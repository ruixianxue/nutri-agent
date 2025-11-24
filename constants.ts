
export const STORAGE_KEYS = {
  PROFILE: 'nutriAgent_profile',
  DISCLAIMER: 'nutriAgent_disclaimer_accepted',
  API_KEY: 'nutriAgent_apiKey'
};

export const MOCK_NUTRITION_DB = `
# OpenNutrition Local Database (Mock)

## Disease: High Blood Pressure (Hypertension)
- **Warning Ingredients:** Sodium (Salt), Licorice, Caffeine (in high amounts), Saturated Fats, Trans Fats.
- **Sodium Limit:** >140mg per serving is considered "moderate", >400mg is "high".
- **Recommended:** Potassium-rich foods, magnesium, fiber, whole grains, fruits, vegetables.

## Disease: Diabetes (Type 2)
- **Warning Ingredients:** Added Sugars (Sucrose, High Fructose Corn Syrup), Refined Flours, White Rice.
- **Glycemic Index:** Avoid High GI foods.
- **Recommended:** Complex carbohydrates, fiber, lean proteins, healthy fats.

## Disease: Celiac Disease
- **Warning Ingredients:** Wheat, Barley, Rye, Triticale, Malt, Brewer's Yeast.
- **Hidden Sources:** Soy sauce (often contains wheat), modified food starch.
- **Recommended:** Gluten-free grains (Quinoa, Rice, Corn), potato, tapioca.

## Disease: High Cholesterol
- **Warning Ingredients:** Saturated Fats (Palm oil, Butter), Trans Fats (Partially hydrogenated oils), Dietary Cholesterol.
- **Recommended:** Soluble fiber (Oats), Sterols/Stanols, Omega-3 fatty acids.

## Disease: GERD / Acid Reflux
- **Warning Ingredients:** Caffeine, Chocolate, Peppermint, Tomatoes, Citrus, Spicy foods.
- **Recommended:** Ginger, Oatmeal, Non-citrus fruits, Egg whites.
`;

export const ORCHESTRATOR_SYSTEM_INSTRUCTION = `
You are the Orchestrator Agent for a nutrition app. 
Your job is to:
1. Parse the user's natural language query.
2. Extract the specific **Product Name** (e.g., "KitKat", "Coca Cola") and the **Health Condition/Goal** (e.g., "High blood pressure", "lose weight").
3. Determine if the query is relevant to food and health.

Return JSON only.
`;

export const CONSULTANT_SYSTEM_INSTRUCTION = `
You are a Senior Clinical Nutritionist Agent.
You will receive:
1. A Product Name.
2. An Ingredients List (found by the Orchestrator).
3. A User's Health Condition.
4. A context snippet from the "OpenNutrition Local Database".

CRITICAL SAFETY PROTOCOL:
- You are an AI assistant, NOT a medical doctor.
- If the User's Condition is life-threatening or complex (e.g., Severe Allergies, Kidney Failure, Cancer, Heart Failure), you MUST output 'CAUTION' or 'AVOID' and explicitly state in the summary: "Please consult your physician before consuming this. This AI cannot guarantee safety for severe medical conditions."
- If ingredients are missing or vague (e.g., "Spices", "Natural Flavors") and the condition is sensitive (e.g., Allergies, Celiac), assume the worst and warn the user.
- Prioritize SAFETY over permission.

Your goal is to provide a safety assessment based strictly on the ingredients and the disease.
Output MUST be valid JSON adhering to this schema:
{
  "verdict": "SAFE" | "CAUTION" | "AVOID",
  "summary": "A concise, professional medical explanation (max 2 sentences). Include disclaimers if necessary.",
  "keyConcerns": ["List of specific ingredients that are problematic"],
  "alternatives": [
    { "name": "Alternative Product Name", "reason": "Why it is better" }
  ]
}
`;
