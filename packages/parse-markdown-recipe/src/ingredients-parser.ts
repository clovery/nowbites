import { RecipeIngredients, Ingredient } from './types';

/**
 * Parse ingredients from markdown format to structured format
 * @param mainIngredients - 主料 section content
 * @param auxiliaryIngredients - 辅料 section content
 * @returns structured ingredients object
 */
export function parseIngredients(mainIngredients: string, auxiliaryIngredients: string): RecipeIngredients {
  const main = parseIngredientList(mainIngredients);
  const auxiliary = parseIngredientList(auxiliaryIngredients);
  
  return { main, auxiliary };
}

/**
 * Parse a list of ingredients from markdown format
 * @param content - ingredient list content
 * @returns array of ingredients
 */
function parseIngredientList(content: string): Ingredient[] {
  const lines = content.split('\n').filter(line => line.trim());
  const ingredients: Ingredient[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      const ingredientText = trimmed.substring(1).trim();
      const ingredient = parseIngredient(ingredientText);
      if (ingredient) {
        ingredients.push(ingredient);
      }
    }
  }
  
  return ingredients;
}

/**
 * Parse a single ingredient line
 * @param text - ingredient text like "带鱼 500g（新鲜或冻带鱼，不能有臭味）"
 * @returns parsed ingredient object
 */
function parseIngredient(text: string): Ingredient | null {
  // Match pattern: "name amount(unit) (note)"
  const regex = /^(.+?)\s+(\d+(?:\.\d+)?[a-zA-Z\u4e00-\u9fa5]*)\s*(?:（(.+?)）)?$/;
  const match = text.match(regex);
  
  if (!match) {
    // Try simpler pattern without unit
    const simpleRegex = /^(.+?)\s+(.+)$/;
    const simpleMatch = text.match(simpleRegex);
    if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
      return {
        name: simpleMatch[1].trim(),
        amount: simpleMatch[2].trim(),
        unit: ''
      };
    }
    return null;
  }
  
  const [, name, amount, note] = match;
  
  if (!name || !amount) {
    return null;
  }
  
  // Extract unit from amount if present (support Chinese characters)
  const unitMatch = amount.match(/^(\d+(?:\.\d+)?)([a-zA-Z\u4e00-\u9fa5]+)$/);
  let unit = '';
  let cleanAmount = amount;
  
  if (unitMatch && unitMatch[1] && unitMatch[2]) {
    cleanAmount = unitMatch[1];
    unit = unitMatch[2];
  }
  
  return {
    name: name.trim(),
    amount: cleanAmount,
    unit,
    note: note || undefined
  };
} 