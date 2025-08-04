import { Sauce } from './types';

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
  const regex = /^(.+?)\s+(\d+(?:\.\d+)?[a-zA-Z\u4e00-\u9fa5]*)$/;
  const match = text.match(regex);
  
  if (!match) {
    return null;
  }
  
  const [, name, amount] = match;
  
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
    unit
  };
} 