import { GoogleGenAI } from "@google/genai";

export const generateCouponBackground = async (businessName: string, discountType: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure your environment is correctly configured.");
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

    const candidates = response?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("The AI model returned no candidates.");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("The AI response was empty.");
    }

    // Safely iterate to find the image part
    for (const part of content.parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in the AI response.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    if (error?.message?.includes('403')) {
      throw new Error("Access Denied (403): Your API key may be invalid or restricted.");
    }
    if (error?.message?.includes('429')) {
      throw new Error("Rate Limit Exceeded (429): Please wait a minute before generating another coupon.");
    }
    
    throw error;
  }
};