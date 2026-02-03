
import { GoogleGenAI } from "@google/genai";

export const generateCouponBackground = async (businessName: string, discountType: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable in your Vercel project settings (Settings > Environment Variables).");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Create a high-quality, professional, and elegant background for a business discount coupon. 
    Theme: ${discountType}. Business Name: ${businessName}. 
    The style should be modern, minimalist, with vibrant but sophisticated colors. 
    DO NOT include any text or specific numbers in the background image. 
    Leave ample space in the center and bottom for text overlay. 
    Aspect ratio should be 16:9. High resolution, aesthetic design.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    // Check if candidates exist
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("The AI model did not return any results. Please try again.");
    }

    const candidate = response.candidates[0];
    
    // Check if content and parts exist
    if (!candidate.content || !candidate.content.parts) {
      throw new Error("The AI response was empty. This can happen if the prompt triggers safety filters.");
    }

    // Iterate through parts to find the image part (inlineData)
    // This is the safest way to satisfy TypeScript's strict null checks
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data was found in the AI response.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    // Provide user-friendly guidance for common API errors
    if (error?.message?.includes('403')) {
      throw new Error("Access Denied (403): Please check if your API Key is valid and billing is enabled on your Google Cloud project.");
    }
    if (error?.message?.includes('429')) {
      throw new Error("Rate Limit Exceeded (429): You are sending requests too fast. Please wait 60 seconds and try again.");
    }
    
    throw error;
  }
};
