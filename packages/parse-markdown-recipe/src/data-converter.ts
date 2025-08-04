import type { ParsedRecipe, Recipe, Ingredient, Step, Tip, RecipeIngredients } from "./types";
import { getContentWithoutFrontmatter } from "./markdown-parser";
import { 
  extractIngredients, 
  extractInstructions, 
  extractTips,
  extractTitleFromContent,
  extractDescriptionFromContent,
  extractMainIngredientsSection,
  extractAuxiliaryIngredientsSection,
  extractSauceSection
} from "./content-extractor";
import { parseCookingTime, parseServings, extractUnit } from "./utils";
import { parseIngredients } from "./ingredients-parser";
import { parseSauce } from "./sauce-parser";

/**
 * Convert parsed recipe to Recipe format
 * @param parsedRecipe - The parsed recipe from parseMarkdownRecipe
 * @returns Recipe data in Recipe format
 */
export function convertToRecipeFormat(
  parsedRecipe: ParsedRecipe
): Recipe {
  const contentWithoutFrontmatter = getContentWithoutFrontmatter(parsedRecipe.content);
  
  // Extract sections for proper parsing
  const mainIngredientsSection = extractMainIngredientsSection(contentWithoutFrontmatter);
  const auxiliaryIngredientsSection = extractAuxiliaryIngredientsSection(contentWithoutFrontmatter);
  const sauceSection = extractSauceSection(contentWithoutFrontmatter);
  
  let recipeIngredients: RecipeIngredients;
  
  // If we have specific main/auxiliary sections, use the dedicated parsers
  if (mainIngredientsSection.trim() || auxiliaryIngredientsSection.trim()) {
    recipeIngredients = parseIngredients(mainIngredientsSection, auxiliaryIngredientsSection);
  } else {
    // Fall back to the original extractIngredients function for general ingredients sections
    const ingredients = extractIngredients(contentWithoutFrontmatter);
    
    // Convert ingredients to Recipe format using the original approach
    const recipeIngredientsList: Ingredient[] = ingredients.map(ingredient => {
      // Parse ingredient string like "黑豆 10g" or "红枣 2颗"
      const match = ingredient.match(/^(.+?)\s+(\d+[^\s]*)$/);
      if (match && match[1] && match[2]) {
        return {
          name: match[1].trim(),
          amount: match[2].trim(),
          unit: extractUnit(match[2])
        };
      }
      return {
        name: ingredient,
        amount: "适量"
      };
    });
    
    recipeIngredients = {
      main: recipeIngredientsList,
      auxiliary: []
    };
  }
  
  // Parse sauce using the dedicated parser
  const recipeSauce = parseSauce(sauceSection);
  
  // Extract instructions
  const instructions = extractInstructions(contentWithoutFrontmatter);
  
  // Convert instructions to Recipe steps format
  const recipeSteps: Step[] = instructions.map((instruction, index) => ({
    title: `步骤 ${index + 1}`,
    content: [instruction]
  }));
  
  // Extract tips from content (look for sections with tips/hints)
  const tips = extractTips(contentWithoutFrontmatter);
  const recipeTips: Tip[] = tips.map(tip => ({ content: tip }));
  
  // Convert cooking time from string to number (minutes)
  const cookingTimeMinutes = parsedRecipe.metadata.cookingTime 
    ? parseCookingTime(parsedRecipe.metadata.cookingTime as string)
    : undefined;
  
  // Convert servings from string to number
  const servingsNumber = parsedRecipe.metadata.servings
    ? parseServings(parsedRecipe.metadata.servings as string)
    : undefined;
  
  // Extract title from first heading if not in metadata
  const title = parsedRecipe.metadata.title || extractTitleFromContent(parsedRecipe.content) || "Untitled Recipe";
  
  // Extract description from content if not in metadata
  const description = parsedRecipe.metadata.description || extractDescriptionFromContent(parsedRecipe.content);
  
  return {
    title,
    description,
    ingredients: recipeIngredients,
    sauce: recipeSauce,
    steps: recipeSteps,
    tips: recipeTips,
    cookingTime: cookingTimeMinutes,
    servings: servingsNumber,
    difficulty: parsedRecipe.metadata.difficulty,
    tags: parsedRecipe.metadata.tags || []
  };
} 