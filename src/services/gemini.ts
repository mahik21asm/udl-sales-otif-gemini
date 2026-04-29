import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface DashboardInsights {
  summary: string;
  recommendations: string[];
  risks: string[];
}

export async function getDashboardInsights(data: any): Promise<DashboardInsights> {
  const modelName = "gemini-3-flash-preview";
  
  const prompt = `
    You are a senior business analyst reviewing a manufacturing sales dashboard.
    Analyze the following filtered dashboard data and provide critical insights.
    
    DATA SUMMARY:
    - Total Sales: ₹${data.kpis.totalSales.toFixed(2)} Lacs
    - OTIF %: ${data.kpis.otifPct}
    - Total Deliveries: ${data.kpis.totalDeliveries}
    - Total Failures: ${data.kpis.failureCount}
    - Active Customers: ${data.kpis.customers}
    
    SEGMENT BREAKDOWN:
    ${data.chartData.segmentData.labels.map((l: string, i: number) => `- ${l}: ₹${data.chartData.segmentData.data[i]} Lacs`).join('\n')}
    
    TOP REVENUES BY ACC MGR:
    ${data.chartData.accMgrData.labels.slice(0, 5).map((l: string, i: number) => `- ${l}: ₹${data.chartData.accMgrData.data[i]} Lacs`).join('\n')}

    FAILURE PARETO (Top Customers):
    ${data.chartData.paretoData.labels.map((l: string, i: number) => `- ${l}: ${data.chartData.paretoData.datasets[0].data[i]} failures`).join('\n')}

    Please return your response in JSON format (pure JSON, no markdown blocks) with the following structure:
    {
      "summary": "A 2-3 sentence overview of current performance.",
      "recommendations": ["4 specific, actionable business recommendations"],
      "risks": ["3 potential risks based on the data trends"]
    }
    
    Focus on OTIF impact, revenue concentration, and account manager performance.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '{}';
    const insights = JSON.parse(text);
    
    return {
      summary: insights.summary || "Unable to generate summary.",
      recommendations: insights.recommendations || [],
      risks: insights.risks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "AI Insights are currently unavailable. Please check your data or try again later.",
      recommendations: [],
      risks: []
    };
  }
}
