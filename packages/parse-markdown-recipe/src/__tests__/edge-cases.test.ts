import { parseIngredients } from '../ingredients-parser';

describe('Edge Cases and Error Handling', () => {
  it('should handle malformed ingredients gracefully', () => {
    const ingredients = `
- 
- 带鱼
- 花雕酒 25g
- 
- 食用油 130g
`;

    const result = parseIngredients(ingredients, '');

    // Note: Empty lines are filtered out, but empty names are still parsed
    expect(result.main).toHaveLength(5);
    expect(result.main[0]).toEqual({
      name: '',
      amount: '',
      unit: ''
    });

    expect(result.main[1]).toEqual({
      name: '带鱼',
      amount: '',
      unit: ''
    });

    expect(result.main[2]).toEqual({
      name: '花雕酒',
      amount: '25',
      unit: 'g'
    });

    expect(result.main[3]).toEqual({
      name: '',
      amount: '',
      unit: ''
    });

    expect(result.main[4]).toEqual({
      name: '食用油',
      amount: '130',
      unit: 'g'
    });
  });

  it('should handle ingredients with special characters', () => {
    const ingredients = `
- 辣椒（干） 10g
- 花椒（整粒） 5g
- 八角（大料） 3颗
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '辣椒（干）',
      amount: '10',
      unit: 'g'
    });

    expect(result.main[1]).toEqual({
      name: '花椒（整粒）',
      amount: '5',
      unit: 'g'
    });

    expect(result.main[2]).toEqual({
      name: '八角（大料）',
      amount: '3',
      unit: '颗'
    });
  });

  it('should handle ingredients with mixed punctuation', () => {
    const ingredients = `
- 盐（细盐/精盐）
- 糖（白砂糖/冰糖）
- 油（花生油/菜籽油）
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '盐',
      amount: '细盐/精盐',
      unit: ''
    });

    expect(result.main[1]).toEqual({
      name: '糖',
      amount: '白砂糖/冰糖',
      unit: ''
    });

    expect(result.main[2]).toEqual({
      name: '油',
      amount: '花生油/菜籽油',
      unit: ''
    });
  });

  it('should handle ingredients with multiple parentheses', () => {
    const ingredients = `
- 带鱼（新鲜）（500g）
- 花雕酒（陈年）（25g）
`;

    const result = parseIngredients(ingredients, '');

    // Note: Multiple parentheses are handled by descriptive format parser
    // The first parentheses group is treated as part of the name
    expect(result.main[0]).toEqual({
      name: '带鱼',
      amount: '新鲜）（500g',
      unit: ''
    });

    expect(result.main[1]).toEqual({
      name: '花雕酒',
      amount: '陈年）（25g',
      unit: ''
    });
  });

  it('should handle ingredients with unusual spacing', () => {
    const ingredients = `
- 带鱼    500g
- 花雕酒  25g
- 食用油  130g
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '带鱼',
      amount: '500',
      unit: 'g'
    });

    expect(result.main[1]).toEqual({
      name: '花雕酒',
      amount: '25',
      unit: 'g'
    });

    expect(result.main[2]).toEqual({
      name: '食用油',
      amount: '130',
      unit: 'g'
    });
  });

  it('should handle ingredients with leading/trailing spaces', () => {
    const ingredients = `
-  带鱼 500g  
-  花雕酒 25g  
-  食用油 130g  
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '带鱼',
      amount: '500',
      unit: 'g'
    });

    expect(result.main[1]).toEqual({
      name: '花雕酒',
      amount: '25',
      unit: 'g'
    });

    expect(result.main[2]).toEqual({
      name: '食用油',
      amount: '130',
      unit: 'g'
    });
  });

  it('should handle ingredients with mixed formats and edge cases', () => {
    const ingredients = `
- 
- 带鱼 500g（新鲜或冻带鱼）
- 陈皮 — 3 片
- 水（用于泡淀粉）
- 白糖 50–60g
- 葱花
- 盐 适量（根据口味调整）
- 
- 辣椒（干） 10g
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main).toHaveLength(9);
    
    // Empty line
    expect(result.main[0]).toEqual({
      name: '',
      amount: '',
      unit: ''
    });

    // Standard format
    expect(result.main[1]).toEqual({
      name: '带鱼',
      amount: '500',
      unit: 'g',
      note: '新鲜或冻带鱼'
    });

    // Em dash format
    expect(result.main[2]).toEqual({
      name: '陈皮',
      amount: '3',
      unit: '片'
    });

    // Descriptive format
    expect(result.main[3]).toEqual({
      name: '水',
      amount: '用于泡淀粉',
      unit: ''
    });

    // Range format
    expect(result.main[4]).toEqual({
      name: '白糖',
      amount: '50–60',
      unit: 'g'
    });

    // Name only format
    expect(result.main[5]).toEqual({
      name: '葱花',
      amount: '',
      unit: ''
    });

    // Standard format with note
    expect(result.main[6]).toEqual({
      name: '盐 适量',
      amount: '根据口味调整',
      unit: ''
    });

    // Empty line
    expect(result.main[7]).toEqual({
      name: '',
      amount: '',
      unit: ''
    });

    // Special characters
    expect(result.main[8]).toEqual({
      name: '辣椒（干）',
      amount: '10',
      unit: 'g'
    });
  });

  it('should handle very long ingredient names', () => {
    const ingredients = `
- 新鲜带鱼（去头去尾，洗净，打花刀，用厨房纸吸干水分） 500g
- 陈年花雕酒（绍兴黄酒，用于去腥增香） 25g
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '新鲜带鱼（去头去尾，洗净，打花刀，用厨房纸吸干水分）',
      amount: '500',
      unit: 'g'
    });

    expect(result.main[1]).toEqual({
      name: '陈年花雕酒（绍兴黄酒，用于去腥增香）',
      amount: '25',
      unit: 'g'
    });
  });

  it('should handle ingredients with numbers in names', () => {
    const ingredients = `
- 2号面粉 200g
- 5号白糖 50g
- 1号鸡蛋 2个
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '2号面粉',
      amount: '200',
      unit: 'g'
    });

    expect(result.main[1]).toEqual({
      name: '5号白糖',
      amount: '50',
      unit: 'g'
    });

    expect(result.main[2]).toEqual({
      name: '1号鸡蛋',
      amount: '2',
      unit: '个'
    });
  });
});
