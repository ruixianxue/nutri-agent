
import { GoogleGenAI, Type } from "@google/genai";
import { OrchestratorIntent, HealthAnalysis, ProductData, UserProfile } from '../types';
import { ORCHESTRATOR_SYSTEM_INSTRUCTION, CONSULTANT_SYSTEM_INSTRUCTION, MOCK_NUTRITION_DB, STORAGE_KEYS } from '../constants';

// Helper to get client with dynamic key
const getAiClient = () => {
  const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }
  
  return new GoogleGenAI({ apiKey });
};

/**
 * Orchestrator: Parses user intent
 */
export const parseUserIntent = async (userMessage: string): Promise<OrchestratorIntent> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  
  const response = await ai.models.generateContent({
    model,
    contents: userMessage,
    config: {
      systemInstruction: ORCHESTRATOR_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING, nullable: true },
          healthCondition: { type: Type.STRING, nullable: true },
          isRelevant: { type: Type.BOOLEAN },
        },
        required: ["isRelevant"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Orchestrator");
  
  return JSON.parse(text) as OrchestratorIntent;
};

/**
 * Vision Agent: Identifies product or barcode from image
 */
export const identifyProductFromImage = async (base64Image: string): Promise<{ barcode: string | null, productName: string | null }> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  
  const prompt = "Analyze this image. If you see a barcode, read the numbers and return them as 'barcode'. If you see a food product package, extract the product name and brand. Return JSON.";
  
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: "image/jpeg"
    }
  };

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        imagePart, 
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          barcode: { type: Type.STRING, nullable: true },
          productName: { type: Type.STRING, nullable: true }
        }
      }
    }
  });

  const text = response.text;
  if (!text) return { barcode: null, productName: null };
  return JSON.parse(text);
};

/**
 * Orchestrator: Fallback Web Search (using Gemini Grounding/Tools as simulated MCP)
 */
export const findIngredientsViaWeb = async (productName: string): Promise<ProductData> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  
  // prompt specifically to get ingredients
  const prompt = `Find the full ingredients list for the product: "${productName}". Return the ingredients text verbatim found on the web.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const resultText = response.text || "No ingredients found.";
  
  return {
    name: productName,
    ingredients: resultText,
    source: 'WebSearch',
    imageUrl: 'https://picsum.photos/200/200', // Placeholder as search doesn't guarantee an image URL structure
  };
};

/**
 * Consultant: Analyzes ingredients against condition AND user profile
 */
export const consultNutritionist = async (
  product: ProductData, 
  conditionFromText: string | null,
  userProfile: UserProfile | null
): Promise<HealthAnalysis> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash"; 

  let profileContext = "";
  if (userProfile) {
    profileContext = `
    USER PROFILE:
    - Name: ${userProfile.name}
    - Known Conditions: ${userProfile.conditions}
    - Health Goals: ${userProfile.goals}
    - Lifestyle/Diet: ${userProfile.lifestyle}
    `;
  }

  const primaryCondition = conditionFromText || userProfile?.conditions || "General Healthy Eating";

  const prompt = `
    Product: ${product.name}
    Ingredients: ${product.ingredients}
    
    Specific Inquiry Condition: ${primaryCondition}
    
    ${profileContext}
    
    INSTRUCTIONS:
    1. Evaluate the product ingredients against the "Specific Inquiry Condition".
    2. IF a "USER PROFILE" is provided, ALSO check against the User's Conditions, Goals, and Lifestyle.
    3. If there is a conflict (e.g. Safe for Inquiry but Bad for Profile), set verdict to CAUTION or AVOID and explain why.
    
    Information from Local Database:
    ${MOCK_NUTRITION_DB}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: CONSULTANT_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING, enum: ["SAFE", "CAUTION", "AVOID"] },
          summary: { type: Type.STRING },
          keyConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          }
        },
        required: ["verdict", "summary", "keyConcerns", "alternatives"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Consultant");

  return JSON.parse(text) as HealthAnalysis;
};
