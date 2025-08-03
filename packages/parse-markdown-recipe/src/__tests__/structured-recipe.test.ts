import { parseIngredients, parseSauce, recipeToMarkdown, validateRecipe } from '../recipe-utils';
import { Recipe } from '../types';

describe('Structured Recipe Format', () => {
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

  test('should parse main ingredients correctly', () => {
    const ingredients = parseIngredients(mainIngredientsText, auxiliaryIngredientsText);
    
    expect(ingredients.main).toHaveLength(1);
    expect(ingredients.main[0]).toEqual({
      name: '带鱼',
      amount: '500',
      unit: 'g',
      note: '新鲜或冻带鱼，不能有臭味'
    });
  });

  test('should parse auxiliary ingredients correctly', () => {
    const ingredients = parseIngredients(mainIngredientsText, auxiliaryIngredientsText);
    
    expect(ingredients.auxiliary).toHaveLength(9);
    expect(ingredients.auxiliary[0]).toEqual({
      name: '花雕酒',
      amount: '25',
      unit: 'g'
    });
    expect(ingredients.auxiliary[1]).toEqual({
      name: '食用油',
      amount: '130',
      unit: 'g'
    });
  });

  test('should parse sauce correctly', () => {
    const sauce = parseSauce(sauceText);
    
    expect(sauce).toHaveLength(5);
    expect(sauce[0]).toEqual({
      name: '酱油',
      amount: '50',
      unit: 'g'
    });
    expect(sauce[1]).toEqual({
      name: '米醋',
      amount: '50',
      unit: 'g'
    });
  });

  test('should validate recipe structure', () => {
    const recipe: Recipe = {
      title: '红烧带鱼',
      ingredients: {
        main: [
          { name: '带鱼', amount: '500', unit: 'g', note: '新鲜或冻带鱼，不能有臭味' }
        ],
        auxiliary: [
          { name: '花雕酒', amount: '25', unit: 'g' },
          { name: '食用油', amount: '130', unit: 'g' }
        ]
      },
      sauce: [
        { name: '酱油', amount: '50', unit: 'g' },
        { name: '米醋', amount: '50', unit: 'g' }
      ],
      steps: [
        {
          title: '准备食材',
          time: 10,
          content: ['将带鱼清洗干净', '准备调味料']
        }
      ],
      tips: [
        { content: '选择新鲜的带鱼很重要' }
      ],
      tags: ['海鲜', '红烧']
    };

    const validation = validateRecipe(recipe);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should convert recipe to markdown', () => {
    const recipe: Recipe = {
      title: '红烧带鱼',
      ingredients: {
        main: [
          { name: '带鱼', amount: '500', unit: 'g', note: '新鲜或冻带鱼，不能有臭味' }
        ],
        auxiliary: [
          { name: '花雕酒', amount: '25', unit: 'g' }
        ]
      },
      sauce: [
        { name: '酱油', amount: '50', unit: 'g' }
      ],
      steps: [
        {
          title: '准备食材',
          time: 10,
          content: ['将带鱼清洗干净']
        }
      ],
      tips: [
        { content: '选择新鲜的带鱼很重要' }
      ],
      tags: ['海鲜', '红烧']
    };

    const markdown = recipeToMarkdown(recipe);
    
    expect(markdown).toContain('# 红烧带鱼');
    expect(markdown).toContain('### 主料');
    expect(markdown).toContain('- 带鱼 500g（新鲜或冻带鱼，不能有臭味）');
    expect(markdown).toContain('### 辅料');
    expect(markdown).toContain('- 花雕酒 25g');
    expect(markdown).toContain('### 调味汁');
    expect(markdown).toContain('- 酱油 50g');
    expect(markdown).toContain('### 步骤');
    expect(markdown).toContain('1. 准备食材（10分钟）');
    expect(markdown).toContain('### 小贴士');
    expect(markdown).toContain('- 选择新鲜的带鱼很重要');
  });

  test('should handle ingredients without notes', () => {
    const ingredients = parseIngredients(mainIngredientsText, auxiliaryIngredientsText);
    
    // Check that auxiliary ingredients without notes are parsed correctly
    expect(ingredients.auxiliary[0]).toEqual({
      name: '花雕酒',
      amount: '25',
      unit: 'g'
    });
  });

  test('should handle ingredients with different units', () => {
    const testText = `
- 盐 适量
- 水 1000ml
- 糖 2勺
`;
    
    const ingredients = parseIngredients(testText, '');
    
    expect(ingredients.main[0]).toEqual({
      name: '盐',
      amount: '适量',
      unit: ''
    });
    
    expect(ingredients.main[1]).toEqual({
      name: '水',
      amount: '1000',
      unit: 'ml'
    });
    
    expect(ingredients.main[2]).toEqual({
      name: '糖',
      amount: '2',
      unit: '勺'
    });
  });
}); 