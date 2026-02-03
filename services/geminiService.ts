
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

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part || !part.inlineData) {
      throw new Error("Gemini AI failed to return image data. This may be due to safety filters or service availability.");
    }

    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    // Provide user-friendly guidance for common API errors
    if (error?.message?.includes('403')) {
      throw new Error("Access Denied (403): Ensure your API Key is active and your billing account is in good standing.");
    }
    if (error?.message?.includes('429')) {
      throw new Error("Rate Limit Exceeded (429): Please wait a moment before generating another coupon.");
    }
    
    throw error;
  }
};
