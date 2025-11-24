
export enum AgentRole {
  USER = 'USER',
  ORCHESTRATOR = 'ORCHESTRATOR',
  CONSULTANT = 'CONSULTANT'
}

export interface NutrientLevels {
  fat?: 'low' | 'moderate' | 'high';
  salt?: 'low' | 'moderate' | 'high';
  sugar?: 'low' | 'moderate' | 'high';
  saturatedFat?: 'low' | 'moderate' | 'high';
}

export interface ProductData {
  name: string;
  brand?: string;
  ingredients: string;
  imageUrl?: string;
  source: 'OpenFoodFacts' | 'WebSearch';
  nutriScore?: string;
  nutrientLevels?: NutrientLevels;
}

export interface HealthAnalysis {
  verdict: 'SAFE' | 'CAUTION' | 'AVOID';
  summary: string;
  keyConcerns: string[];
  alternatives: Array<{
    name: string;
    reason: string;
  }>;
}

export interface Message {
  id: string;
  role: AgentRole;
  text: string;
  timestamp: number;
  productData?: ProductData;
  analysis?: HealthAnalysis;
  isThinking?: boolean;
  thinkingStep?: string;
}

export interface OrchestratorIntent {
  productName: string | null;
  healthCondition: string | null;
  isRelevant: boolean;
}

export interface UserProfile {
  name: string;
  conditions: string; // e.g., "Diabetes, Hypertension"
  goals: string;      // e.g., "Reduce sugar, Lose 5kg"
  lifestyle: string;  // e.g., "Vegetarian, Keto"
}
