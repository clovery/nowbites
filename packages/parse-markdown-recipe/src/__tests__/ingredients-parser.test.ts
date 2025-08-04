import { parseIngredients } from '../ingredients-parser';

describe('Ingredients Parser', () => {
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

    it('should handle ingredients with Chinese units', () => {
      const mainIngredients = `
- 红枣 2颗
- 花生 10g
- 清水 300ml
`;

      const result = parseIngredients(mainIngredients, '');

      expect(result.main[0]).toEqual({
        name: '红枣',
        amount: '2',
        unit: '颗'
      });

      expect(result.main[1]).toEqual({
        name: '花生',
        amount: '10',
        unit: 'g'
      });

      expect(result.main[2]).toEqual({
        name: '清水',
        amount: '300',
        unit: 'ml'
      });
    });

    it('should handle ingredients without units', () => {
      const mainIngredients = `
- 鸡蛋 2个
- 盐 适量
`;

      const result = parseIngredients(mainIngredients, '');

      expect(result.main[0]).toEqual({
        name: '鸡蛋',
        amount: '2',
        unit: '个'
      });

      expect(result.main[1]).toEqual({
        name: '盐',
        amount: '适量',
        unit: ''
      });
    });
  });
}); 