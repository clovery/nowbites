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
    // Skip separator lines
    if (trimmed === '---' || trimmed === '--') {
      continue;
    }
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
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
 * @param text - sauce text like "酱油 50g" or "葱丝" or "盐（腌肉 3–5g + 调汁 2g）"
 * @returns parsed sauce object
 */
function parseSauceIngredient(text: string): Sauce | null {
  // Handle em dash separator (—) first
  if (text.includes('—')) {
    const parts = text.split('—').map(part => part.trim());
    if (parts.length >= 2) {
      const name = parts[0];
      const amountWithUnit = parts[1];
      
      if (name && amountWithUnit) {
        // Extract unit from amount if present (support Chinese characters)
        const unitMatch = amountWithUnit.match(/^(\d+(?:\.\d+)?)([a-zA-Z\u4e00-\u9fa5]+)$/);
        let unit = '';
        let cleanAmount = amountWithUnit;
        
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
    }
  }
  
  // Handle ingredients with descriptive amounts in parentheses
  const descriptiveRegex = /^(.+?)（(.+?)）$/;
  const descriptiveMatch = text.match(descriptiveRegex);
  if (descriptiveMatch && descriptiveMatch[1] && descriptiveMatch[2]) {
    const [, name, description] = descriptiveMatch;
    return {
      name: name.trim(),
      amount: description.trim(),
      unit: ''
    };
  }

  // Handle ingredients with only name (no amount/unit)
  if (!text.includes(' ')) {
    return {
      name: text.trim(),
      amount: '',
      unit: ''
    };
  }

  // Handle ingredients with range amounts (e.g., "50–60g")
  const rangeRegex = /^(.+?)\s+(\d+–\d+[a-zA-Z\u4e00-\u9fa5]*)$/;
  const rangeMatch = text.match(rangeRegex);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    const [, name, amount] = rangeMatch;
    
    // Extract unit from amount if present
    const unitMatch = amount.match(/^(\d+–\d+)([a-zA-Z\u4e00-\u9fa5]+)$/);
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

  // Original regex for standard format
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