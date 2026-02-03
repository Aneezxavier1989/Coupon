
import { GoogleGenAI } from "@google/genai";

// Always initialize with direct access to process.env.API_KEY as per instructions.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCouponBackground = async (businessName: string, discountType: string): Promise<string> => {
  const ai = getAI();
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

    // Iterate through all parts to find the image part as recommended by the guidelines.
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part || !part.inlineData) {
      throw new Error("No image data returned from Gemini");
    }

    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error) {
    console.error("Error generating background:", error);
    throw error;
  }
};
