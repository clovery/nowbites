import { parseIngredients, parseSauce } from '../src';

// Example 1: Parse ingredients with main and auxiliary sections
console.log('=== Example 1: Parse Main and Auxiliary Ingredients ===');

const mainIngredientsText = `
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）
`;

const auxiliaryIngredientsText = `
- 花雕酒 25g
- 食用油 130g
- 蒜 30g
- 姜 30g
- 花椒 10g
- 干辣椒段 150g
- 葱花 30g
- 花生米 80g
- 淀粉 5g
`;

const ingredients = parseIngredients(mainIngredientsText, auxiliaryIngredientsText);

console.log('Main ingredients:');
ingredients.main.forEach(ingredient => {
  console.log(`  - ${ingredient.name}: ${ingredient.amount}${ingredient.unit}${ingredient.note ? ` (${ingredient.note})` : ''}`);
});

console.log('\nAuxiliary ingredients:');
ingredients.auxiliary.forEach(ingredient => {
  console.log(`  - ${ingredient.name}: ${ingredient.amount}${ingredient.unit}`);
});

// Example 2: Parse sauce ingredients
console.log('\n=== Example 2: Parse Sauce Ingredients ===');

const sauceText = `
- 酱油 50g
- 米醋 50g
- 白糖 80g
- 味精 1g
- 料酒 10g
`;

const sauce = parseSauce(sauceText);

console.log('Sauce ingredients:');
sauce.forEach(sauceItem => {
  console.log(`  - ${sauceItem.name}: ${sauceItem.amount}${sauceItem.unit}`);
});

// Example 3: Parse ingredients with different units
console.log('\n=== Example 3: Parse Ingredients with Different Units ===');

const mixedIngredientsText = `
- 盐 适量
- 水 1000ml
- 糖 2勺
- 面粉 500g
- 鸡蛋 3个
`;

const mixedIngredients = parseIngredients(mixedIngredientsText, '');

console.log('Mixed ingredients:');
mixedIngredients.main.forEach(ingredient => {
  console.log(`  - ${ingredient.name}: ${ingredient.amount}${ingredient.unit}`);
});

// Example 4: Parse ingredients with notes
console.log('\n=== Example 4: Parse Ingredients with Notes ===');

const ingredientsWithNotes = `
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）
- 姜 30g（切片）
- 蒜 30g（拍碎）
- 辣椒 适量（根据个人口味）
`;

const parsedWithNotes = parseIngredients(ingredientsWithNotes, '');

console.log('Ingredients with notes:');
parsedWithNotes.main.forEach(ingredient => {
  console.log(`  - ${ingredient.name}: ${ingredient.amount}${ingredient.unit}${ingredient.note ? ` (${ingredient.note})` : ''}`);
}); 