import type { Ingredient } from './types';

/**
 * Extract ingredients from recipe content
 * @param content - The recipe content
 * @returns Array of ingredients
 */
export function extractIngredients(content: string): Ingredient[] {
  const ingredients: Ingredient[] = [];
  
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
        const name = parts[0];
        const amountWithUnit = parts[1];
        
        if (name && amountWithUnit) {
          // Parse amount and unit from the amount field
          const unitMatch = amountWithUnit.match(/^(\d+(?:\.\d+)?)([a-zA-Z\u4e00-\u9fa5]+)$/);
          let unit = '';
          let cleanAmount = amountWithUnit;
          
          if (unitMatch && unitMatch[1] && unitMatch[2]) {
            cleanAmount = unitMatch[1];
            unit = unitMatch[2];
          }
          
          ingredients.push({
            name: name.trim(),
            amount: cleanAmount,
            unit: unit
          });
        }
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
        trimmed.includes('步骤') ||
        trimmed.includes('烹饪步骤')) {
      inInstructions = true;
      continue;
    }
    
    // Handle emoji headers like "## 👨‍🍳 烹饪步骤"
    if (trimmed.startsWith('##') && trimmed.includes('烹饪步骤')) {
      inInstructions = true;
      continue;
    }
    
    // Stop when we hit another section (but not step headers or separators within instructions)
    if (inInstructions && (trimmed.startsWith('##') || trimmed.startsWith('---'))) {
      // Don't stop for step headers (### with step content)
      if (trimmed.startsWith('###') && (trimmed.includes('第') || trimmed.includes('步'))) {
        // This is a step header, not a section break
        // Continue processing
      } else if (trimmed.startsWith('---') && inInstructions) {
        // This is a separator within instructions, continue processing
        // Continue processing
      } else {
        // Add the last instruction if we have one
        if (currentInstruction.trim()) {
          instructions.push(currentInstruction.trim());
          currentInstruction = ''; // Clear to avoid duplication
        }
        break;
      }
    }
    
    if (inInstructions && trimmed) {
      // Handle emoji step headers like "### 🥢 第一步：处理带鱼（00:18）"
      if (trimmed.startsWith('###') && (trimmed.includes('第') || trimmed.includes('步'))) {
        // If we have a previous instruction, save it
        if (currentInstruction.trim()) {
          instructions.push(currentInstruction.trim());
        }
        // Start new instruction from step title
        const stepTitle = trimmed.replace(/^###\s*[^\s]+\s*/, '').replace(/（[^）]+）$/, '');
        currentInstruction = stepTitle;
      } else if (trimmed.match(/^\d+\./)) {
        // If we have a previous instruction, save it
        if (currentInstruction.trim()) {
          instructions.push(currentInstruction.trim());
        }
        // Start new numbered instruction
        currentInstruction = trimmed.replace(/^\d+\.\s*/, '');
      } else if ((trimmed.startsWith('-') || trimmed.startsWith('*')) && !trimmed.startsWith('---')) {
        // Add bullet point to current instruction
        if (currentInstruction) {
          currentInstruction += ' ' + trimmed.substring(1).trim();
        } else {
          // Standalone bullet point - skip this as it might be from other sections
          // instructions.push(trimmed.substring(1).trim());
        }
      } else if (trimmed && !trimmed.startsWith('**') && !trimmed.startsWith('---')) {
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
 * Extract tips from recipe content
 * @param content - The recipe content
 * @returns Array of tips
 */
export function extractTips(content: string): string[] {
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

/**
 * Extract title from first markdown heading in content
 * @param content - The recipe content
 * @returns Title string or undefined
 */
export function extractTitleFromContent(content: string): string | undefined {
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
export function extractDescriptionFromContent(content: string): string | undefined {
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
      // Stop when we hit a ## section marker (but continue through --- separators)
      if (trimmed.startsWith('##')) {
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
 * Extract main ingredients section content from recipe content
 * @param content - The recipe content
 * @returns Main ingredients section content as string
 */
export function extractMainIngredientsSection(content: string): string {
  const lines = content.split('\n');
  let inMainIngredients = false;
  const mainIngredientsLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for main ingredients section headers (Chinese) - both ## and ###
    if ((trimmed.startsWith('##') || trimmed.startsWith('###')) && (trimmed.includes('主料') || trimmed.includes('主要食材'))) {
      inMainIngredients = true;
      continue;
    }
    
    // Stop when we hit another section
    if (inMainIngredients && (trimmed.startsWith('##') || trimmed.startsWith('---'))) {
      break;
    }
    
    // Collect main ingredients lines (both table and bullet formats)
    if (inMainIngredients && trimmed) {
      mainIngredientsLines.push(line);
    }
  }
  
  return mainIngredientsLines.join('\n');
}

/**
 * Extract auxiliary ingredients section content from recipe content
 * @param content - The recipe content
 * @returns Auxiliary ingredients section content as string
 */
export function extractAuxiliaryIngredientsSection(content: string): string {
  const lines = content.split('\n');
  let inAuxiliaryIngredients = false;
  const auxiliaryIngredientsLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for auxiliary ingredients section headers (Chinese) - both ## and ###
    if ((trimmed.startsWith('##') || trimmed.startsWith('###')) && (trimmed.includes('辅料') || trimmed.includes('辅助食材'))) {
      inAuxiliaryIngredients = true;
      continue;
    }
    
    // Stop when we hit another section
    if (inAuxiliaryIngredients && (trimmed.startsWith('##') || trimmed.startsWith('---'))) {
      break;
    }
    
    // Collect auxiliary ingredients lines (both table and bullet formats)
    if (inAuxiliaryIngredients && trimmed) {
      auxiliaryIngredientsLines.push(line);
    }
  }
  
  return auxiliaryIngredientsLines.join('\n');
}

/**
 * Extract sauce section content from recipe content
 * @param content - The recipe content
 * @returns Sauce section content as string
 */
export function extractSauceSection(content: string): string {
  const lines = content.split('\n');
  let inSauce = false;
  const sauceLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for sauce section headers (Chinese) - both ## and ###
    if ((trimmed.startsWith('##') || trimmed.startsWith('###')) && (trimmed.includes('调味汁') || trimmed.includes('调味料') || trimmed.includes('酱料'))) {
      inSauce = true;
      continue;
    }
    
    // Stop when we hit another ## section (but continue through ### and ---)
    if (inSauce && trimmed.startsWith('##') && !trimmed.includes('调味汁') && !trimmed.includes('调味料') && !trimmed.includes('酱料')) {
      break;
    }
    
    // Collect sauce lines (both table and bullet formats)
    if (inSauce && trimmed) {
      sauceLines.push(line);
    }
  }
  
  return sauceLines.join('\n');
} 