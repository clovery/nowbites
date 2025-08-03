import { parseIngredients, parseSauce, recipeToMarkdown, validateRecipe } from '../src/recipe-utils';
import { Recipe } from '../src/types';

// Example recipe data in the format you provided
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

const sauceText = `
- 酱油 50g
- 米醋 50g
- 白糖 80g
- 味精 1g
- 料酒 10g
`;

// Parse the ingredients and sauce
const ingredients = parseIngredients(mainIngredientsText, auxiliaryIngredientsText);
const sauce = parseSauce(sauceText);

// Create a complete recipe object
const recipe: Recipe = {
  title: '红烧带鱼',
  description: '经典的红烧带鱼，肉质鲜美，味道浓郁',
  ingredients,
  sauce,
  steps: [
    {
      title: '准备食材',
      time: 15,
      content: [
        '将带鱼清洗干净，去除内脏和鱼鳞',
        '将带鱼切成段，每段约5-6厘米',
        '准备调味料：酱油、米醋、白糖、味精、料酒'
      ]
    },
    {
      title: '腌制带鱼',
      time: 30,
      content: [
        '将带鱼段放入碗中',
        '加入料酒、盐腌制30分钟',
        '腌制过程中可以准备其他配料'
      ]
    },
    {
      title: '准备配料',
      time: 10,
      content: [
        '蒜切末，姜切片',
        '干辣椒切段',
        '葱花切好备用',
        '花生米炒熟备用'
      ]
    },
    {
      title: '煎制带鱼',
      time: 20,
      content: [
        '锅中倒入食用油，烧至7成热',
        '将腌制好的带鱼段放入锅中煎制',
        '煎至两面金黄，取出备用'
      ]
    },
    {
      title: '炒制调味料',
      time: 10,
      content: [
        '锅中留少许油，放入蒜末、姜片爆香',
        '加入花椒、干辣椒段炒出香味',
        '加入酱油、米醋、白糖、味精调味'
      ]
    },
    {
      title: '红烧带鱼',
      time: 25,
      content: [
        '将煎好的带鱼段放入锅中',
        '加入适量清水，没过带鱼',
        '大火烧开后转小火炖煮20分钟',
        '最后加入葱花、花生米即可'
      ]
    }
  ],
  tips: [
    { content: '选择新鲜的带鱼很重要，避免有臭味的鱼' },
    { content: '煎制带鱼时火候要控制好，避免煎糊' },
    { content: '炖煮时火候要小，让鱼肉更加入味' },
    { content: '最后收汁时注意不要收得太干，保留一些汤汁' }
  ],
  cookingTime: 110, // 总时间：15+30+10+20+10+25 = 110分钟
  servings: 4,
  difficulty: 'medium',
  tags: ['海鲜', '红烧', '带鱼', '家常菜']
};

// Validate the recipe
const validation = validateRecipe(recipe);
console.log('Recipe validation:', validation);

if (validation.isValid) {
  console.log('✅ Recipe is valid!');
  
  // Convert to markdown format
  const markdown = recipeToMarkdown(recipe);
  console.log('\n📝 Generated Markdown:');
  console.log(markdown);
  
  // Display structured data
  console.log('\n📊 Structured Data:');
  console.log('Main Ingredients:', recipe.ingredients.main);
  console.log('Auxiliary Ingredients:', recipe.ingredients.auxiliary);
  console.log('Sauce:', recipe.sauce);
  console.log('Steps:', recipe.steps.length, 'steps');
  console.log('Tips:', recipe.tips.length, 'tips');
} else {
  console.log('❌ Recipe validation failed:');
  validation.errors.forEach(error => console.log('-', error));
}

// Example of how to store in database (JSON format for Prisma)
const databaseRecipe = {
  id: 'recipe_001',
  title: recipe.title,
  description: recipe.description,
  ingredients: recipe.ingredients, // This will be stored as JSON
  sauce: recipe.sauce, // This will be stored as JSON
  steps: recipe.steps, // This will be stored as JSON
  tips: recipe.tips, // This will be stored as JSON
  cookingTime: recipe.cookingTime,
  servings: recipe.servings,
  difficulty: recipe.difficulty,
  tags: recipe.tags
};

console.log('\n💾 Database Format:');
console.log(JSON.stringify(databaseRecipe, null, 2)); 