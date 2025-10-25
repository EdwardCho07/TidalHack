
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

export const analyzeImage = async (imagePart: ImagePart, prompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [imagePart, { text: prompt }],
      },
    });

    const text = response.text;
    if (text) {
      return text;
    } else {
      throw new Error("The API returned an empty response. The image might be unclear or unsupported.");
    }
  } catch (error) {
    console.error("Error analyzing image with Gemini API:", error);
    // Provide a more user-friendly error message
    if (error instanceof Error && error.message.includes('400')) {
        throw new Error("The request was malformed. Please check the image format and try again.");
    }
    if (error instanceof Error && error.message.includes('503')) {
        throw new Error("The service is temporarily unavailable. Please try again later.");
    }
    throw new Error("Failed to analyze the image. Please ensure you have a valid API key and internet connection.");
  }
};

export const cleanGroceryList = async (rawTranscript: string): Promise<string[]> => {
  if (!rawTranscript.trim()) {
    return [];
  }
  try {
    const prompt = `You are a grocery list assistant. A user has provided a voice transcript. Your task is to extract only the grocery items from the following text. Remove all filler words (like 'um', 'uh', 'like', 'I need', 'okay so'), conversational phrases, and any words that are not grocery items. Format the output as a clean, comma-separated string. For example, if the input is 'okay so I need uh milk, maybe some eggs, and oh yeah bread please', the output should be 'milk, eggs, bread'. Here is the transcript: "${rawTranscript}"`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }],
      },
    });

    const text = response.text;
    if (text) {
      return text.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    return [];
  } catch (error) {
    console.error("Error cleaning grocery list with Gemini API:", error);
    throw new Error("Failed to process the grocery list. Please try again.");
  }
};
