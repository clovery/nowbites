import { Recipe, RecipeIngredients, Ingredient, Sauce, Step, Tip } from './types';

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

/**
 * Parse sauce from markdown format
 * @param content - sauce section content
 * @returns array of sauce ingredients
 */
export function parseSauce(content: string): Sauce[] {
  const lines = content.split('\n').filter(line => line.trim());
  const sauces: Sauce[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      const sauceText = trimmed.substring(1).trim();
      const sauce = parseSauceIngredient(sauceText);
      if (sauce) {
        sauces.push(sauce);
      }
    }
  }
  
  return sauces;
}

/**
 * Parse a single sauce ingredient line
 * @param text - sauce text like "酱油 50g"
 * @returns parsed sauce object
 */
function parseSauceIngredient(text: string): Sauce | null {
  const regex = /^(.+?)\s+(\d+(?:\.\d+)?[a-zA-Z]*)$/;
  const match = text.match(regex);
  
  if (!match) {
    return null;
  }
  
  const [, name, amount] = match;
  
  if (!name || !amount) {
    return null;
  }
  
  // Extract unit from amount if present
  const unitMatch = amount.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
  let unit = '';
  let cleanAmount = amount;
  
  if (unitMatch && unitMatch[1] && unitMatch[2]) {
    cleanAmount = unitMatch[1];
    unit = unitMatch[2];
  }
  
  return {
    name: name.trim(),
    amount: cleanAmount,
    unit
  };
}

/**
 * Validate recipe structure
 * @param recipe - recipe object to validate
 * @returns validation result
 */
export function validateRecipe(recipe: Recipe): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!recipe.title) {
    errors.push('Recipe title is required');
  }
  
  if (!recipe.ingredients.main || recipe.ingredients.main.length === 0) {
    errors.push('At least one main ingredient is required');
  }
  
  if (!recipe.steps || recipe.steps.length === 0) {
    errors.push('At least one step is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Convert recipe to markdown format
 * @param recipe - recipe object
 * @returns markdown string
 */
export function recipeToMarkdown(recipe: Recipe): string {
  let markdown = `# ${recipe.title}\n\n`;
  
  if (recipe.description) {
    markdown += `${recipe.description}\n\n`;
  }
  
  // Main ingredients
  markdown += '### 主料\n';
  for (const ingredient of recipe.ingredients.main) {
    markdown += `- ${ingredient.name} ${ingredient.amount}${ingredient.unit}`;
    if (ingredient.note) {
      markdown += `（${ingredient.note}）`;
    }
    markdown += '\n';
  }
  markdown += '\n';
  
  // Auxiliary ingredients
  markdown += '### 辅料\n';
  for (const ingredient of recipe.ingredients.auxiliary) {
    markdown += `- ${ingredient.name} ${ingredient.amount}${ingredient.unit}`;
    if (ingredient.note) {
      markdown += `（${ingredient.note}）`;
    }
    markdown += '\n';
  }
  markdown += '\n';
  
  // Sauce
  markdown += '### 调味汁\n';
  for (const sauce of recipe.sauce) {
    markdown += `- ${sauce.name} ${sauce.amount}${sauce.unit}\n`;
  }
  markdown += '\n';
  
  // Steps
  markdown += '### 步骤\n';
  for (let i = 0; i < recipe.steps.length; i++) {
    const step = recipe.steps[i];
    if (step) {
      markdown += `${i + 1}. ${step.title}`;
      if (step.time) {
        markdown += `（${step.time}分钟）`;
      }
      markdown += '\n';
      for (const content of step.content) {
        markdown += `   ${content}\n`;
      }
      markdown += '\n';
    }
  }
  
  // Tips
  if (recipe.tips && recipe.tips.length > 0) {
    markdown += '### 小贴士\n';
    for (const tip of recipe.tips) {
      markdown += `- ${tip.content}\n`;
    }
  }
  
  return markdown;
} 