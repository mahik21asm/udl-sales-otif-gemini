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
if (admin && admin.apps && admin.apps.length === 0) {
  try {
    // We assume the service account or default credentials are set up by the platform
    // or we'll handle gracefully
    admin.initializeApp();
  } catch (e) {
    console.warn("Firebase Admin failed to initialize. Server sync features might be limited.", e);
  }
}

const db = (admin && admin.apps && admin.apps.length > 0) ? admin.firestore() : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

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
