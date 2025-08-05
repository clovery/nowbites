import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRecipes() {
  console.log('🔍 Verifying recipes in database...');
  
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        id: {
          startsWith: 'json_recipe_'
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        ingredients: true,
        sauce: true,
        steps: true,
        tips: true,
        tags: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${recipes.length} JSON recipes in database:`);
    
    recipes.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.title}`);
      console.log(`   ID: ${recipe.id}`);
      console.log(`   Description: ${recipe.description}`);
      console.log(`   Ingredients: ${recipe.ingredients.length} items`);
      console.log(`   Sauce: ${recipe.sauce.length} items`);
      console.log(`   Steps: ${recipe.steps.length} steps`);
      console.log(`   Tips: ${recipe.tips.length} tips`);
      console.log(`   Tags: ${recipe.tags.join(', ')}`);
      console.log(`   Created: ${recipe.createdAt}`);
    });

    // Also check total recipes
    const totalRecipes = await prisma.recipe.count();
    console.log(`\n📈 Total recipes in database: ${totalRecipes}`);
    
  } catch (error) {
    console.error('❌ Error verifying recipes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRecipes(); 