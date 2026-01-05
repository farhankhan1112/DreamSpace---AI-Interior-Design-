
import { GoogleGenAI, Type } from "@google/genai";
import { RoomAnalysis, DesignTransformation, DesignStyle, AspectRatio } from "./types";
import { 
  CORE_DESIGNER_SYSTEM_PROMPT, 
  TRANSFORMATION_PROMPT_TEMPLATE, 
  IMAGE_PROMPT_ENGINEER_PROMPT 
} from "./constants";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeRoom = async (base64Image: string): Promise<RoomAnalysis> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: CORE_DESIGNER_SYSTEM_PROMPT },
        imagePart,
        { text: "Analyze this room and return the JSON analysis." }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roomType: { type: Type.STRING },
          detectedLayout: { type: Type.STRING },
          constraints: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["roomType", "detectedLayout", "constraints", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getDesignTransformation = async (
  style: DesignStyle, 
  analysis: RoomAnalysis,
  customIdeas?: string
): Promise<DesignTransformation> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const prompt = `Based on this room analysis: ${JSON.stringify(analysis)}, 
    ${TRANSFORMATION_PROMPT_TEMPLATE(style)}.
    ${customIdeas ? `Additional user requirements to incorporate: ${customIdeas}` : ''}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          style: { type: Type.STRING },
          colorPalette: { type: Type.STRING },
          furnitureRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          lightingPlan: { type: Type.STRING },
          summary: { type: Type.STRING }
        },
        required: ["style", "colorPalette", "furnitureRecommendations", "lightingPlan", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateRenderedImage = async (
  originalImageBase64: string,
  transformation: DesignTransformation,
  analysis: RoomAnalysis,
  customIdeas?: string,
  aspectRatio: AspectRatio = '1:1'
): Promise<string> => {
  const ai = getAI();
  
  // Step 1: Generate high-quality visual prompt
  const promptModel = 'gemini-3-flash-preview';
  const promptResponse = await ai.models.generateContent({
    model: promptModel,
    contents: `
      Original Room: ${analysis.roomType}, Layout: ${analysis.detectedLayout}.
      Design Style: ${transformation.style}.
      Description: ${transformation.summary}.
      Color Palette: ${transformation.colorPalette}.
      ${customIdeas ? `Specific User Ideas to Include: ${customIdeas}` : ''}
      ${IMAGE_PROMPT_ENGINEER_PROMPT}
    `
  });
  
  const visualPrompt = promptResponse.text;

  // Step 2: Use gemini-2.5-flash-image for image-to-image/generation
  const generationModel = 'gemini-2.5-flash-image';
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: originalImageBase64.split(',')[1] || originalImageBase64,
    },
  };

  const renderResponse = await ai.models.generateContent({
    model: generationModel,
    contents: {
      parts: [
        imagePart,
        { text: `Redesign this exact room using the following instructions: ${visualPrompt}. 
        IMPORTANT: Preserve the architectural structural integrity (windows, doors, floor lines). 
        Replace furniture, decor, and wall/floor finishes according to the style and specific ideas provided.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    }
  });

  let generatedBase64 = "";
  for (const part of renderResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      generatedBase64 = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return generatedBase64;
};
