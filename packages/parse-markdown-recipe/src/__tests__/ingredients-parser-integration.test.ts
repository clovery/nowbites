import { parseIngredients } from '../ingredients-parser';

describe('Ingredients Parser Integration Tests', () => {
  describe('parseIngredients', () => {
    it('should parse main and auxiliary ingredients correctly', () => {
      const mainIngredients = `
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）
- 花雕酒 25g
- 食用油 130g
`;

      const auxiliaryIngredients = `
- 蒜 30g
- 姜 30g
- 盐 适量
`;

      const result = parseIngredients(mainIngredients, auxiliaryIngredients);

      expect(result.main).toHaveLength(3);
      expect(result.auxiliary).toHaveLength(3);

      // Check main ingredients
      expect(result.main[0]).toEqual({
        name: '带鱼',
        amount: '500',
        unit: 'g',
        note: '新鲜或冻带鱼，不能有臭味'
      });

      expect(result.main[1]).toEqual({
        name: '花雕酒',
        amount: '25',
        unit: 'g'
      });

      // Check auxiliary ingredients
      expect(result.auxiliary[0]).toEqual({
        name: '蒜',
        amount: '30',
        unit: 'g'
      });

      expect(result.auxiliary[2]).toEqual({
        name: '盐',
        amount: '适量',
        unit: ''
      });
    });

    it('should handle empty ingredient lists', () => {
      const result = parseIngredients('', '');
      
      expect(result.main).toHaveLength(0);
      expect(result.auxiliary).toHaveLength(0);
    });

    it('should handle mixed formats in same list', () => {
      const ingredients = `
- 带鱼 500g（新鲜或冻带鱼）
- 陈皮 — 3 片
- 水（用于泡淀粉）
- 白糖 50–60g
- 葱花
- 盐 适量（根据口味调整）
`;

      const result = parseIngredients(ingredients, '');

      expect(result.main).toHaveLength(6);
      
      // Standard format
      expect(result.main[0]).toEqual({
        name: '带鱼',
        amount: '500',
        unit: 'g',
        note: '新鲜或冻带鱼'
      });

      // Em dash format
      expect(result.main[1]).toEqual({
        name: '陈皮',
        amount: '3',
        unit: '片'
      });

      // Descriptive format
      expect(result.main[2]).toEqual({
        name: '水',
        amount: '用于泡淀粉',
        unit: ''
      });

      // Range format
      expect(result.main[3]).toEqual({
        name: '白糖',
        amount: '50–60',
        unit: 'g'
      });

      // Name only format
      expect(result.main[4]).toEqual({
        name: '葱花',
        amount: '',
        unit: ''
      });

      // Standard format with note
      expect(result.main[5]).toEqual({
        name: '盐 适量',
        amount: '根据口味调整',
        unit: ''
      });
    });

    it('should handle edge cases gracefully', () => {
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
  });
});
