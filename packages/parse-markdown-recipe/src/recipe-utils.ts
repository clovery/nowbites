import { Recipe, Step, Tip } from './types';
import { parseIngredients } from './ingredients-parser';
import { parseSauce } from './sauce-parser';

// Re-export the parsing functions for backward compatibility
export { parseIngredients } from './ingredients-parser';
export { parseSauce } from './sauce-parser';

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