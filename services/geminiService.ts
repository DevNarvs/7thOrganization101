import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, never expose keys on client. 
// This is a frontend-only demo structure. 
// The prompt instructions imply usage of process.env.API_KEY.
// Ensure the build environment has this variable.

const apiKey = process.env.API_KEY || ''; 

// Helper to safely call the API only if key exists
export const generateOrganizationContent = async (prompt: string, type: 'announcement' | 'about'): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini.");
    return "Error: API Key missing. Please configure process.env.API_KEY.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = type === 'announcement' 
      ? "You are a professional PR secretary for a youth organization. Write a catchy, formal, yet engaging announcement body text based on the user's topic. Keep it under 100 words."
      : "You are a professional copywriter for a non-profit organization. Write an inspiring 'About Us' section based on the user's prompt. Keep it under 150 words.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster text generation
      }
    });

    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate content. Please try again.";
  }
};
