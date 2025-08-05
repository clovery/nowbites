import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface RecipeJson {
  title: string;
  description?: string;
  ingredients: {
    main: Array<{
      name: string;
      amount: string;
      unit: string;
      note?: string;
    }>;
    auxiliary: Array<{
      name: string;
      amount: string;
      unit: string;
      note?: string;
    }>;
  };
  sauce: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  steps: Array<{
    title: string;
    content: string[];
  }>;
  tips: Array<{
    content: string;
  }>;
  tags: string[];
}

async function readRecipeFiles(): Promise<RecipeJson[]> {
  const recipesDir = path.join(__dirname, 'recipes');
  const files = fs.readdirSync(recipesDir).filter(file => file.endsWith('.json'));
  
  const recipes: RecipeJson[] = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(recipesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const recipe = JSON.parse(content) as RecipeJson;
      recipes.push(recipe);
      console.log(`📖 Read recipe: ${recipe.title}`);
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error);
    }
  }
  
  return recipes.sort((a, b) => a.title.localeCompare(b.title));
}

function convertRecipeToDatabaseFormat(recipe: RecipeJson, userId: string, recipeId: string) {
  // Convert ingredients to the database format
  const ingredients = [
    ...recipe.ingredients.main.map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      type: 'main' as const,
      note: ing.note
    })),
    ...recipe.ingredients.auxiliary.map(ing => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      type: 'auxiliary' as const,
      note: ing.note
    }))
  ];

  // Convert sauce to the database format
  const sauce = recipe.sauce.map(s => ({
    name: s.name,
    amount: s.amount,
    unit: s.unit
  }));

  // Convert steps to the database format
  const steps = recipe.steps.map((step, index) => ({
    title: step.title,
    time: 0, // Default time since JSON doesn't have time
    content: step.content
  }));

  // Convert tips to the database format
  const tips = recipe.tips.map(tip => tip.content);

  return {
    id: recipeId,
    title: recipe.title,
    description: recipe.description || '',
    ingredients,
    sauce,
    steps,
    tips,
    tags: recipe.tags,
    userId,
    isPublic: true,
    // Set default values for missing fields
    cookingTime: 30,
    servings: 4,
    difficulty: 'medium' as const,
    imageUrl: '',
    coverImage: ''
  };
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { openid: 'sample_user_1' },
    update: {},
    create: {
      openid: 'sample_user_1',
      nickName: 'Chef John',
      avatarUrl: 'https://example.com/avatar1.jpg',
      gender: 1,
      country: 'China',
      province: 'Guangdong',
      city: 'Shenzhen'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { openid: 'sample_user_2' },
    update: {},
    create: {
      openid: 'sample_user_2',
      nickName: 'Kitchen Master',
      avatarUrl: 'https://example.com/avatar2.jpg',
      gender: 2,
      country: 'China',
      province: 'Beijing',
      city: 'Beijing'
    }
  });

  console.log('✅ Users created');

  // Read and insert recipe JSON files
  console.log('📚 Reading recipe JSON files...');
  const recipeFiles = await readRecipeFiles();
  
  for (let i = 0; i < recipeFiles.length; i++) {
    const recipe = recipeFiles[i];
    const recipeId = `json_recipe_${i + 1}`;
    
    try {
      const recipeData = convertRecipeToDatabaseFormat(recipe, user1.id, recipeId);
      
      await prisma.recipe.upsert({
        where: { id: recipeId },
        update: recipeData,
        create: recipeData
      });
      
      console.log(`✅ Inserted recipe: ${recipe.title}`);
    } catch (error) {
      console.error(`❌ Error inserting recipe ${recipe.title}:`, error);
    }
  }

  console.log('✅ Sample recipes created');
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 