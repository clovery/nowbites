import { marked } from "marked";
import matter from "gray-matter";
import type { 
  RecipeMetadata, 
  ParsedRecipe, 
  Recipe, 
  Ingredient, 
  Step, 
  Tip, 
  Json 
} from "./types";

export type { 
  RecipeMetadata, 
  ParsedRecipe, 
  Recipe, 
  Ingredient, 
  Step, 
  Tip, 
  Json,
  RecipeIngredients,
  Sauce
} from "./types";

// Export structured recipe utilities
export {
  parseIngredients,
  parseSauce,
  validateRecipe,
  recipeToMarkdown
} from "./recipe-utils";

/**
 * Parse a markdown recipe file and extract metadata and content
 * @param markdown - The markdown content to parse
 * @returns Parsed recipe with metadata and content
 */
export async function parseMarkdownRecipe(markdown: string): Promise<ParsedRecipe> {
  // Parse frontmatter and content
  const { data, content } = matter(markdown);
  
  // Convert markdown to HTML
  const html = await marked.parse(content);
  
  return {
    metadata: data as RecipeMetadata,
    content,
    html,
  };
}

/**
 * Get the content without frontmatter for parsing ingredients and instructions
 * @param markdown - The original markdown content
 * @returns Content without frontmatter
 */
export function getContentWithoutFrontmatter(markdown: string): string {
  const { content } = matter(markdown);
  return content;
}

/**
 * Extract ingredients from recipe content
 * @param content - The recipe content
 * @returns Array of ingredients
 */
export function extractIngredients(content: string): string[] {
  const ingredients: string[] = [];
  
  // Look for table format ingredients (Chinese recipe format)
  const lines = content.split('\n');
  let inIngredientsSection = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for ingredients section headers (English and Chinese)
    if (trimmed.startsWith('##') && (trimmed.toLowerCase().includes('ingredient') || 
        trimmed.includes('材料') || 
        trimmed.includes('食材'))) {
      inIngredientsSection = true;
      continue;
    }
    
    // Stop when we hit another section
    if (inIngredientsSection && (trimmed.startsWith('##') || trimmed.startsWith('---'))) {
      break;
    }
    
    // Process table rows in ingredients section
    if (inIngredientsSection && trimmed.startsWith('|')) {
      const parts = trimmed.split('|').map(part => part.trim()).filter(part => part);
      
      // Skip header row (contains "食材" or "用量" or similar)
      if (parts.some(part => part.includes('食材') || part.includes('用量') || part.includes('材料'))) {
        continue;
      }
      
      // Skip separator row (contains only dashes and pipes)
      if (trimmed.match(/^\|[\s\-:]+\|[\s\-:]+\|$/)) {
        continue;
      }
      
      // Process actual ingredient rows
      if (parts.length >= 2) {
        const ingredient = `${parts[0]} ${parts[1]}`;
        ingredients.push(ingredient);
      }
    }
  }
  
  return ingredients;
}

/**
 * Extract cooking instructions from recipe content
 * @param content - The recipe content
 * @returns Array of instructions
 */
export function extractInstructions(content: string): string[] {
  const lines = content.split('\n');
  const instructions: string[] = [];
  let inInstructions = false;
  let currentInstruction = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for instruction section headers (English and Chinese)
    if (trimmed.toLowerCase().includes('instruction') || 
        trimmed.toLowerCase().includes('step') ||
        trimmed.toLowerCase().includes('method') ||
        trimmed.includes('做法') ||
        trimmed.includes('步骤')) {
      inInstructions = true;
      continue;
    }
    
    // Stop when we hit another section
    if (inInstructions && (trimmed.startsWith('##') || trimmed.startsWith('---'))) {
      // Add the last instruction if we have one
      if (currentInstruction.trim()) {
        instructions.push(currentInstruction.trim());
        currentInstruction = ''; // Clear to avoid duplication
      }
      break;
    }
    
    if (inInstructions && trimmed) {
      if (trimmed.match(/^\d+\./)) {
        // If we have a previous instruction, save it
        if (currentInstruction.trim()) {
          instructions.push(currentInstruction.trim());
        }
        // Start new numbered instruction
        currentInstruction = trimmed.replace(/^\d+\.\s*/, '');
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        // Add bullet point to current instruction
        if (currentInstruction) {
          currentInstruction += ' ' + trimmed.substring(1).trim();
        } else {
          // Standalone bullet point - skip this as it might be from other sections
          // instructions.push(trimmed.substring(1).trim());
        }
      } else if (trimmed && !trimmed.startsWith('**')) {
        // Add regular text to current instruction
        if (currentInstruction) {
          currentInstruction += ' ' + trimmed;
        }
      }
    }
  }
  
  // Add the last instruction if we have one
  if (currentInstruction.trim()) {
    instructions.push(currentInstruction.trim());
    currentInstruction = ''; // Clear to avoid duplication
  }
  
  return instructions;
}



/**
 * Convert parsed recipe to Recipe format
 * @param parsedRecipe - The parsed recipe from parseMarkdownRecipe
 * @returns Recipe data in Recipe format
 */
export function convertToRecipeFormat(
  parsedRecipe: ParsedRecipe
): Recipe {
  const contentWithoutFrontmatter = getContentWithoutFrontmatter(parsedRecipe.content);
  const ingredients = extractIngredients(contentWithoutFrontmatter);
  const instructions = extractInstructions(contentWithoutFrontmatter);
  
  // Convert ingredients to Recipe format
  const recipeIngredients: Ingredient[] = ingredients.map(ingredient => {
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
    ingredients: recipeIngredients as unknown as Json,
    sauce: [] as Json, // Default empty sauce array
    steps: recipeSteps as unknown as Json,
    tips: recipeTips as unknown as Json,
    cookingTime: cookingTimeMinutes,
    servings: servingsNumber,
    difficulty: parsedRecipe.metadata.difficulty,
    tags: parsedRecipe.metadata.tags || []
  };
}

/**
 * Extract unit from amount string
 * @param amount - Amount string like "10g", "2颗", "300ml"
 * @returns Unit string
 */
function extractUnit(amount: string): string {
  const unitMatch = amount.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g);
  return unitMatch ? unitMatch.join('') : '';
}

/**
 * Parse cooking time string to minutes
 * @param timeString - Time string like "25分钟", "1小时", "30分钟"
 * @returns Minutes as number
 */
function parseCookingTime(timeString: string): number {
  const minutesMatch = timeString.match(/(\d+)分钟/);
  const hoursMatch = timeString.match(/(\d+)小时/);
  
  if (minutesMatch && minutesMatch[1]) {
    return parseInt(minutesMatch[1]);
  } else if (hoursMatch && hoursMatch[1]) {
    return parseInt(hoursMatch[1]) * 60;
  }
  
  return 0;
}

/**
 * Parse servings string to number
 * @param servingsString - Servings string like "1人份", "4人份"
 * @returns Number of servings
 */
function parseServings(servingsString: string): number {
  const match = servingsString.match(/(\d+)人份/);
  return match && match[1] ? parseInt(match[1]) : 1;
}

/**
 * Extract title from first markdown heading in content
 * @param content - The recipe content
 * @returns Title string or undefined
 */
function extractTitleFromContent(content: string): string | undefined {
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for first heading (starts with #)
    if (trimmed.startsWith('# ')) {
      return trimmed.substring(2).trim();
    }
  }
  
  return undefined;
}

/**
 * Extract description from content (text after title and before first section)
 * @param content - The recipe content
 * @returns Description string or undefined
 */
function extractDescriptionFromContent(content: string): string | undefined {
  const lines = content.split('\n');
  let foundTitle = false;
  const descriptionLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      continue;
    }
    
    // Found the title
    if (trimmed.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    
    // If we found the title, collect description lines until we hit a section
    if (foundTitle) {
      // Stop when we hit a section marker
      if (trimmed.startsWith('##') || trimmed.startsWith('---')) {
        break;
      }
      
      // Add non-empty lines to description
      if (trimmed) {
        descriptionLines.push(trimmed);
      }
    }
  }
  
  return descriptionLines.length > 0 ? descriptionLines.join(' ').trim() : undefined;
}

/**
 * Extract tips from recipe content
 * @param content - The recipe content
 * @returns Array of tips
 */
function extractTips(content: string): string[] {
  const lines = content.split('\n');
  const tips: string[] = [];
  let inTips = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for tips section headers (Chinese)
    if (trimmed.includes('温馨提示') || trimmed.includes('小贴士') || trimmed.includes('提示')) {
      inTips = true;
      continue;
    }
    
    // Stop when we hit another section
    if (inTips && (trimmed.startsWith('##') || trimmed.startsWith('---'))) {
      break;
    }
    
    if (inTips && trimmed && (trimmed.startsWith('-') || trimmed.startsWith('*'))) {
      tips.push(trimmed.substring(1).trim());
    }
  }
  
  return tips;
} 