
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = "gemini-2.5-flash";

const createEAPrompt = (strategy: string, symbol: string, timeframe: string): string => `
You are an expert MQL5 programmer. Create a complete, professional, and functional MetaTrader 5 Expert Advisor (EA).
The EA should be for the symbol ${symbol} on the ${timeframe} timeframe.

The trading strategy is as follows:
---
${strategy}
---

Please ensure the code is well-structured, includes input parameters for key variables (like MagicNumber, LotSize, StopLoss, TakeProfit), and is ready to be compiled in MetaEditor.
The code must be complete in a single block. Do not use markdown formatting.
Provide ONLY the MQL5 code.
`;

export const generateEACode = async (strategy: string, symbol: string, timeframe: string): Promise<string> => {
  const prompt = createEAPrompt(strategy, symbol, timeframe);
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    let code = response.text.trim();
    
    // Clean up potential markdown fences that the model might add despite instructions
    if (code.startsWith("```mql5")) {
      code = code.substring(7, code.length - 3).trim();
    } else if (code.startsWith("```")) {
      code = code.substring(3, code.length - 3).trim();
    }

    return code;
  } catch (error) {
    console.error("Error generating EA code with Gemini:", error);
    throw new Error("Failed to generate EA code. The AI model could not process the request.");
  }
};
