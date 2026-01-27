
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize Gemini with the proper structure.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSystemInstruction = (currentProducts: Product[]) => `You are Lumina, the Lead Technical Strategist for "Lumina Global".
We are an all-in-one platform for digital business success. Our offerings include:
1. SaaS & Software: Powerful automation and management tools.
2. Website Templates: Professional, secure code for rapid launches.
3. Trading Bots: High-performance financial automation (Always include a risk disclaimer).
4. E-commerce Website Delivery: Done-for-you store builds in 14 days.
5. Cybersecurity Services: Audits, risk assessments, and monitoring.

Inventory: ${JSON.stringify(currentProducts.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price })))}.

Your persona: Elite, technically expert, professional, and business-focused.
Help users navigate our ecosystem. If they want to scale, suggest SaaS. If they want to launch a store, suggest our Bespoke Delivery. If they want passive automation, suggest Trading Bots.
Always emphasize trust, innovation, and security.`;

/**
 * getAIResponse handles user interaction with Lumina AI.
 */
export const getAIResponse = async (userMessage: string, history: { role: 'user' | 'model', content: string }[], currentProducts: Product[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role as 'user' | 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: generateSystemInstruction(currentProducts),
      },
    });
    return response.text || "I apologize, my neural link is experiencing latency. Please restate your technical inquiry.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lumina Offline. Please reach out to ops@luminaglobal.io.";
  }
};

/**
 * semanticSearchProducts uses the model to map user intent to specific product IDs.
 */
export const semanticSearchProducts = async (query: string, currentProducts: Product[]): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Query: "${query}". Identify matching Product IDs from our ecosystem.
      Inventory: ${JSON.stringify(currentProducts.map(p => ({ id: p.id, name: p.name, desc: p.description })))}.
      Return JSON array of IDs only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const jsonStr = response.text || '[]';
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("Semantic search error:", error);
    return [];
  }
};
