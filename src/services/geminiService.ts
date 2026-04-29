import { GoogleGenAI } from "@google/genai";
import { SalesRecord } from "../types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export const getGeminiResponse = async (prompt: string, records: SalesRecord[] = []) => {
  if (!records) records = [];
  // Create a summary context of the data to feed into Gemini
  // We don't want to send thousands of rows, but we can send aggregated statistics or a sample
  const totalSales = records.reduce((acc, curr) => acc + (curr.salesLacs || 0), 0);
  const totalQty = records.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const totalInvoices = records.length;
  
  // Aggregate by plant
  const plantStats = records.reduce((acc: any, curr) => {
    const plant = curr.plant || 'Unknown';
    if (!acc[plant]) acc[plant] = { count: 0, sales: 0 };
    acc[plant].count++;
    acc[plant].sales += (curr.salesLacs || 0);
    return acc;
  }, {});

  const context = `
    You are an AI assistant for the UDL Sales & OTIF Dashboard.
    Current Dashboard Context:
    - Total Sales Value: ${totalSales.toLocaleString()} Lacs
    - Total Quantity: ${totalQty.toLocaleString()} MT
    - Total Invoices: ${totalInvoices}
    - Plant-specific breakdown: ${JSON.stringify(plantStats)}
    
    Data Schema: Each sales record includes: plant, invoiceType, segment, customer, accountManager, salesLacs, quantity, onTime, failure, material, billingDate.
    
    Answer the user's question based on this data. If you need more details or can't answer from this summary, let them know.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: 'user', parts: [{ text: context }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are a professional business analyst. Be concise, data-driven, and helpful.",
      }
    });

    return response.text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};
