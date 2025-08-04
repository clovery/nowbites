/**
 * Extract unit from amount string
 * @param amount - Amount string like "10g", "2颗", "300ml"
 * @returns Unit string
 */
export function extractUnit(amount: string): string {
  const unitMatch = amount.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g);
  return unitMatch ? unitMatch.join('') : '';
}

/**
 * Parse cooking time string to minutes
 * @param timeString - Time string like "25分钟", "1小时", "30分钟"
 * @returns Minutes as number
 */
export function parseCookingTime(timeString: string): number {
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
export function parseServings(servingsString: string): number {
  const match = servingsString.match(/(\d+)人份/);
  return match && match[1] ? parseInt(match[1]) : 1;
} 