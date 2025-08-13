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
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
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
 * @param text - ingredient text like "带鱼 500g（新鲜或冻带鱼，不能有臭味）" or "葱丝" or "水（用于泡淀粉）"
 * @returns parsed ingredient object
 */
function parseIngredient(text: string): Ingredient | null {
  // Try different parsing strategies in order of specificity
  
  // 1. Handle em dash separator (—) format
  const emDashResult = parseEmDashFormat(text);
  if (emDashResult) return emDashResult;
  
  // 2. Handle standard format: "name amount(unit) (note)"
  const standardResult = parseStandardFormat(text);
  if (standardResult) return standardResult;
  
  // 3. Handle descriptive format: "name（description）"
  const descriptiveResult = parseDescriptiveFormat(text);
  if (descriptiveResult) return descriptiveResult;
  
  // 4. Handle range amounts: "name 50–60g"
  const rangeResult = parseRangeFormat(text);
  if (rangeResult) return rangeResult;
  
  // 5. Handle simple format: "name amount"
  const simpleResult = parseSimpleFormat(text);
  if (simpleResult) return simpleResult;
  
  // 6. Handle ingredients with only name
  const nameOnlyResult = parseNameOnlyFormat(text);
  if (nameOnlyResult) return nameOnlyResult;
  
  return null;
}

/**
 * Parse em dash format: "name — amount unit" or "name — amount（note）"
 */
function parseEmDashFormat(text: string): Ingredient | null {
  if (!text.includes('—')) return null;
  
  const parts = text.split('—').map(part => part.trim());
  if (parts.length < 2) return null;
  
  const name = parts[0];
  const amountWithUnit = parts[1];
  
  if (!name || !amountWithUnit) return null;
  
  // Check if amountWithUnit contains complex notes in parentheses
  const noteMatch = amountWithUnit.match(/^(.+?)（(.+?)）$/);
  
  if (noteMatch) {
    // Handle complex format like "适量（去腥 5 段 + 炒制适量）"
    const baseAmount = noteMatch[1];
    const note = noteMatch[2];
    
    if (baseAmount && note) {
      const { amount, unit } = extractAmountAndUnit(baseAmount);
      return {
        name: name.trim(),
        amount,
        unit,
        note: note
      };
    }
  } else {
    // Handle simple format like "3 片"
    const { amount, unit } = extractAmountAndUnit(amountWithUnit);
    return {
      name: name.trim(),
      amount,
      unit,
      note: parts.length > 2 ? parts[2] || undefined : undefined
    };
  }
  
  return null;
}

/**
 * Parse standard format: "name amount(unit) (note)"
 */
function parseStandardFormat(text: string): Ingredient | null {
  const regex = /^(.+?)\s+(\d+(?:\.\d+)?[a-zA-Z\u4e00-\u9fa5]*)\s*(?:（(.+?)）)?$/;
  const match = text.match(regex);
  
  if (!match || !match[1] || !match[2]) return null;
  
  const [, name, amount, note] = match;
  const { amount: cleanAmount, unit } = extractAmountAndUnit(amount);
  
  return {
    name: name.trim(),
    amount: cleanAmount,
    unit,
    note: note || undefined
  };
}

/**
 * Parse descriptive format: "name（description）"
 */
function parseDescriptiveFormat(text: string): Ingredient | null {
  const descriptiveRegex = /^(.+?)（(.+?)）$/;
  const descriptiveMatch = text.match(descriptiveRegex);
  
  if (!descriptiveMatch || !descriptiveMatch[1] || !descriptiveMatch[2]) return null;
  
  const [, name, description] = descriptiveMatch;
  return {
    name: name.trim(),
    amount: description.trim(),
    unit: ''
  };
}

/**
 * Parse range format: "name 50–60g"
 */
function parseRangeFormat(text: string): Ingredient | null {
  const rangeRegex = /^(.+?)\s+(\d+–\d+[a-zA-Z\u4e00-\u9fa5]*)\s*(?:（(.+?)）)?$/;
  const rangeMatch = text.match(rangeRegex);
  
  if (!rangeMatch || !rangeMatch[1] || !rangeMatch[2]) return null;
  
  const [, name, amount, note] = rangeMatch;
  const { amount: cleanAmount, unit } = extractAmountAndUnit(amount);
  
  return {
    name: name.trim(),
    amount: cleanAmount,
    unit,
    note: note || undefined
  };
}

/**
 * Parse simple format: "name amount"
 */
function parseSimpleFormat(text: string): Ingredient | null {
  const simpleRegex = /^(.+?)\s+(.+)$/;
  const simpleMatch = text.match(simpleRegex);
  
  if (!simpleMatch || !simpleMatch[1] || !simpleMatch[2]) return null;
  
  return {
    name: simpleMatch[1].trim(),
    amount: simpleMatch[2].trim(),
    unit: ''
  };
}

/**
 * Parse name-only format: "name" (no amount/unit)
 */
function parseNameOnlyFormat(text: string): Ingredient | null {
  if (text.includes(' ')) return null;
  
  return {
    name: text.trim(),
    amount: '',
    unit: ''
  };
}

/**
 * Extract amount and unit from a string like "500g" or "3 片" or "50–60g"
 * @param text - text containing amount and unit
 * @returns object with amount and unit separated
 */
function extractAmountAndUnit(text: string): { amount: string; unit: string } {
  // Handle range amounts first (e.g., "50–60g")
  const rangeUnitMatch = text.match(/^(\d+–\d+)([a-zA-Z\u4e00-\u9fa5]+)$/);
  if (rangeUnitMatch && rangeUnitMatch[1] && rangeUnitMatch[2]) {
    return {
      amount: rangeUnitMatch[1],
      unit: rangeUnitMatch[2]
    };
  }
  
  // Extract unit from amount if present (support Chinese characters)
  const unitMatch = text.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z\u4e00-\u9fa5]+)$/);
  
  if (unitMatch && unitMatch[1] && unitMatch[2]) {
    return {
      amount: unitMatch[1],
      unit: unitMatch[2]
    };
  }
  
  return {
    amount: text,
    unit: ''
  };
} 