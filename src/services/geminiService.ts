import { GoogleGenAI } from "@google/genai";
import { SalesRecord } from "../types";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export interface DashboardInsights {
  summary: string;
  recommendations: string[];
  risks: string[];
}

export const getGeminiResponse = async (prompt: string, records: SalesRecord[] = []) => {
  if (!records) records = [];
  
  // Provide richer context for the chat
  const totalSales = records.reduce((acc, curr) => acc + (curr.salesLacs || 0), 0);
  const totalQty = records.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  
  const plantStats = records.reduce((acc: any, curr) => {
    const plant = curr.plant || 'Unknown';
    if (!acc[plant]) acc[plant] = { count: 0, sales: 0, failures: 0 };
    acc[plant].count++;
    acc[plant].sales += (curr.salesLacs || 0);
    acc[plant].failures += (curr.failure || 0);
    return acc;
  }, {});

  const topCustomers = Object.entries(records.reduce((acc: any, curr) => {
    acc[curr.customer] = (acc[curr.customer] || 0) + curr.salesLacs;
    return acc;
  }, {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  const context = `
    You are an AI assistant for the UDL Sales & OTIF Dashboard.
    Current Dashboard Context:
    - Total Sales: ₹${totalSales.toFixed(2)} Lacs
    - Total Quantity: ${totalQty.toLocaleString()} MT
    - Plant Stats: ${JSON.stringify(plantStats)}
    - Top 5 Customers: ${JSON.stringify(topCustomers)}
    
    Data Schema: plant, invoiceType, segment, customer, accountManager, salesLacs, quantity, onTime, failure, material, billingDate.
    
    Answer the user's question based on this summary. Be professional and concise.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: 'user', parts: [{ text: context }, { text: prompt }] }
      ],
      config: {
        systemInstruction: "You are a professional business analyst for UDL Group. Be concise and helpful.",
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error reaching AI service. Please ensure the Gemini API key is configured correctly.";
  }
};

export async function getDashboardInsights(data: any): Promise<DashboardInsights> {
  const prompt = `
    You are a senior business analyst. Analyze this manufacturing dashboard data:
    - Total Sales: ₹${data.kpis.totalSales.toFixed(2)} Lacs
    - OTIF %: ${data.kpis.otifPct}
    - Total Failures: ${data.kpis.failureCount}
    - Segment Performance: ${JSON.stringify(data.chartData.segmentData)}
    - Failure Pareto: ${JSON.stringify(data.chartData.paretoData.labels)}
    
    Return pure JSON:
    {
      "summary": "2-3 sentence overview",
      "recommendations": ["4 actionable items"],
      "risks": ["3 specific risks"]
    }
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const insights = JSON.parse(response.text || '{}');
    return {
      summary: insights.summary || "Summary unavailable.",
      recommendations: insights.recommendations || [],
      risks: insights.risks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { summary: "Insights unavailable. Please check connectivity or API configuration.", recommendations: [], risks: [] };
  }
}
