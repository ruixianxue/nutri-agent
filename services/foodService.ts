import { ProductData, NutrientLevels } from '../types';

const OFF_API_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const OFF_BARCODE_URL = 'https://world.openfoodfacts.org/api/v0/product/';

const mapProductResponse = (product: any, source: 'OpenFoodFacts' | 'WebSearch' = 'OpenFoodFacts'): ProductData | null => {
  if (!product) return null;
  
  // We need ingredients to be useful (though sometimes basic info is okay if we can search ingredients later, 
  // but for this app we strictly want ingredients)
  if (!product.ingredients_text && !product.ingredients_text_en) {
    // Some products have image but no text. We return what we have, 
    // but the UI might show "No ingredients found".
  }

  // Map nutrient levels if available
  let nutrientLevels: NutrientLevels | undefined;
  if (product.nutrient_levels) {
    nutrientLevels = {
      fat: product.nutrient_levels.fat,
      salt: product.nutrient_levels.salt,
      sugar: product.nutrient_levels.sugars, // Note: API uses 'sugars'
      saturatedFat: product.nutrient_levels['saturated-fat'] // Note: API uses 'saturated-fat'
    };
  }

  return {
    name: product.product_name || 'Unknown Product',
    brand: product.brands,
    ingredients: product.ingredients_text_en || product.ingredients_text || 'No ingredients listed in database.',
    imageUrl: product.image_front_small_url || product.image_url,
    source: source,
    nutriScore: product.nutriscore_grade, // e.g. 'a', 'b', 'c', 'd', 'e'
    nutrientLevels: nutrientLevels
  };
};

export const searchByBarcode = async (barcode: string): Promise<ProductData | null> => {
  try {
    const response = await fetch(`${OFF_BARCODE_URL}${barcode}.json`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
       return mapProductResponse(data.product);
    }
    return null;
  } catch (error) {
    console.error("OpenFoodFacts barcode fetch error:", error);
    return null;
  }
};

export const searchOpenFoodFacts = async (query: string): Promise<ProductData | null> => {
  try {
    const searchUrl = `${OFF_API_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.products && data.products.length > 0) {
      return mapProductResponse(data.products[0]);
    }

    return null;
  } catch (error) {
    console.error("OpenFoodFacts fetch error:", error);
    return null;
  }
};