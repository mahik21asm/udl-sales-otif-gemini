import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import axios from "axios";
import * as admin from "firebase-admin";

// Derive __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// Note: In AI Studio, credentials should ideally be in env vars or a service account file
// For this demo, we'll try to use the default app if possible or skip if not configured
if (admin.apps.length === 0) {
  try {
    // We assume the service account or default credentials are set up by the platform
    // or we'll handle gracefully
    admin.initializeApp();
  } catch (e) {
    console.warn("Firebase Admin failed to initialize. Server sync features might be limited.", e);
  }
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- Microsoft 365 OAuth Routes ---

  const MS_AUTH_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
  const MS_TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  const MS_SCOPES = "openid profile email User.Read Mail.Read";

  app.get("/api/auth/microsoft/url", (req, res) => {
    const clientId = process.env.VITE_MICROSOFT_CLIENT_ID;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/microsoft/callback`;

    if (!clientId) {
      return res.status(500).json({ error: "MICROSOFT_CLIENT_ID not configured" });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope: MS_SCOPES,
      state: "random_state_string", // Should be dynamic in production
    });

    res.json({ url: `${MS_AUTH_ENDPOINT}?${params.toString()}` });
  });

  app.get("/auth/microsoft/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.VITE_MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/microsoft/callback`;

    if (!code) return res.status(400).send("No code provided");

    try {
      const response = await axios.post(
        MS_TOKEN_ENDPOINT,
        new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code: code as string,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Store tokens (for this demo, we'll use a cookie or Firestore)
      // Ideally, store in Firestore linked to the user
      if (db) {
        await db.collection("settings").doc("m365_config").set({
          refreshToken: refresh_token,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          connected: true
        }, { merge: true });
      }

      // Success message and close popup
      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
            <div style="text-align: center; background: white; padding: 2rem; border-radius: 1rem; shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
              <h2 style="color: #0f172a;">Authentication Successful!</h2>
              <p style="color: #64748b;">You can now sync your Sales Dashboard with M365 Email.</p>
              <p style="color: #94a3b8; font-size: 0.875rem;">This window will close automatically.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'M365_AUTH_SUCCESS' }, '*');
                  setTimeout(() => window.close(), 2000);
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Microsoft OAuth Error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed. Check logs.");
    }
  });

  // --- Sync Route ---
  app.post("/api/sync/m365", async (req, res) => {
    // 1. Get refresh token from Firestore
    if (!db) return res.status(500).json({ error: "Firestore not initialized" });

    const configDoc = await db.collection("settings").doc("m365_config").get();
    if (!configDoc.exists) return res.status(404).json({ error: "M365 not connected" });

    const { refreshToken } = configDoc.data()!;

    try {
      // 2. Get fresh access token
      const tokenRes = await axios.post(
        MS_TOKEN_ENDPOINT,
        new URLSearchParams({
          client_id: process.env.VITE_MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const accessToken = tokenRes.data.access_token;

      // 3. Search for email from specific sender with Attachment
      // User can pass sender in body or we use a default
      const sender = req.body.sender || "reports@example.com";
      
      const messagesRes = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages?$filter=from/emailAddress/address eq '${sender}' and hasAttachments eq true&$top=1&$orderby=receivedDateTime desc`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const messages = messagesRes.data.value;
      if (messages.length === 0) {
        return res.json({ success: false, message: `No recent emails found from ${sender} with attachments.` });
      }

      const messageId = messages[0].id;

      // 4. Get Attachments
      const attachmentsRes = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const attachments = attachmentsRes.data.value;
      const excelAttachment = attachments.find((a: any) => 
        (a.name.endsWith('.xlsx') || a.name.endsWith('.csv')) && a.contentBytes
      );

      if (!excelAttachment) {
        return res.json({ success: false, message: "Found email but no Excel/CSV attachment detected or content is missing." });
      }

      // 5. Parse Attachment using 'xlsx'
      const XLSX = await import('xlsx');
      const buffer = Buffer.from(excelAttachment.contentBytes, 'base64');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // 6. Map to SalesRecord schema
      // This is a "Best Effort" mapping based on known headers
      const mappedRecords = rawData.map(row => ({
        plant: row['Plant'] || row['PLANT'] || 'Unknown',
        customer: row['Customer Name'] || row['Customer'] || row['SOLD TO PARTY'],
        segment: row['Segment'] || row['SEGMENT'] || 'General',
        invoiceType: row['Invoice Type'] || row['TYPE'],
        salesLacs: parseFloat(row['Total Invoice Value'] || row['Sales']) || 0,
        quantity: parseFloat(row['Total Quantity'] || row['Quantity']) || 0,
        onTime: parseInt(row['On Time'] || row['OT'] || 1),
        failure: parseInt(row['Failure'] || row['Late'] || 0),
        billingDate: row['Billing Date'] || row['Date'] || new Date().toISOString().split('T')[0],
        material: row['Material Description'] || row['Description'],
        accountManager: row['Account Manager'] || row['AM'],
        uploadedAt: new Date().toISOString(),
        batchId: `email_sync_${Date.now()}`
      })).filter(r => r.customer && r.salesLacs > 0);

      if (mappedRecords.length === 0) {
        return res.json({ success: false, message: "Excel parsed but no valid records found. Check column headers." });
      }

      // 7. Update Firestore
      if (db) {
        const salesRef = db.collection("sales_records");
        const batchSize = 400;
        
        // Optional: Clear old records if requested (automatic refresh usually keeps history or replaces)
        // For production "refresh", we'll append for now or replace based on batchId
        
        for (let i = 0; i < mappedRecords.length; i += batchSize) {
          const batch = db.batch();
          const chunk = mappedRecords.slice(i, i + batchSize);
          chunk.forEach(record => {
            const docRef = salesRef.doc();
            batch.set(docRef, record);
          });
          await batch.commit();
        }
      }

      res.json({
        success: true,
        message: `Successfully synced ${mappedRecords.length} records from ${excelAttachment.name}`,
        details: {
          received: messages[0].receivedDateTime,
          attachmentName: excelAttachment.name
        }
      });

    } catch (error: any) {
      console.error("Sync Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Sync failed" });
    }
  });


  // --- Vite / Production Serving ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
