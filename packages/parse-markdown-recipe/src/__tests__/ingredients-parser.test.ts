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

    it('should handle ingredients with descriptive amounts', () => {
      const mainIngredients = `
- 水（用于泡淀粉）
- 色拉油（炸肉使用）
- 豆油（少量，调香）
`;

      const result = parseIngredients(mainIngredients, '');

      expect(result.main[0]).toEqual({
        name: '水',
        amount: '用于泡淀粉',
        unit: '',
        note: undefined
      });

      expect(result.main[1]).toEqual({
        name: '色拉油',
        amount: '炸肉使用',
        unit: '',
        note: undefined
      });

      expect(result.main[2]).toEqual({
        name: '豆油',
        amount: '少量，调香',
        unit: '',
        note: undefined
      });
    });

    it('should handle ingredients with range amounts', () => {
      const mainIngredients = `
- 白糖 50–60g
- 米醋 3–5g
`;

      const result = parseIngredients(mainIngredients, '');

      expect(result.main[0]).toEqual({
        name: '白糖',
        amount: '50–60',
        unit: 'g'
      });

      expect(result.main[1]).toEqual({
        name: '米醋',
        amount: '3–5',
        unit: 'g'
      });
    });

    it('should handle ingredients with only name', () => {
      const mainIngredients = `
- 葱丝
- 香菜
- 姜丝
- 胡萝卜丝
- 蒜片
`;

      const result = parseIngredients(mainIngredients, '');

      expect(result.main[0]).toEqual({
        name: '葱丝',
        amount: '',
        unit: ''
      });

      expect(result.main[1]).toEqual({
        name: '香菜',
        amount: '',
        unit: ''
      });

      expect(result.main[2]).toEqual({
        name: '姜丝',
        amount: '',
        unit: ''
      });

      expect(result.main[3]).toEqual({
        name: '胡萝卜丝',
        amount: '',
        unit: ''
      });

      expect(result.main[4]).toEqual({
        name: '蒜片',
        amount: '',
        unit: ''
      });
    });

    it('should handle ingredients with complex notes', () => {
      const mainIngredients = `
- 盐（腌肉 3–5g + 调汁 2g）
- 胡椒粉（适量）
- 黄酒（适量）
`;

      const result = parseIngredients(mainIngredients, '');

      expect(result.main[0]).toEqual({
        name: '盐',
        amount: '腌肉 3–5g + 调汁 2g',
        unit: '',
        note: undefined
      });

      expect(result.main[1]).toEqual({
        name: '胡椒粉',
        amount: '适量',
        unit: '',
        note: undefined
      });

      expect(result.main[2]).toEqual({
        name: '黄酒',
        amount: '适量',
        unit: '',
        note: undefined
      });
    });
  });
}); 