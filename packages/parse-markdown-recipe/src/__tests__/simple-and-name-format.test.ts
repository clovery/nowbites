import { parseIngredients } from '../ingredients-parser';

describe('Simple and Name-Only Format Parser', () => {
  describe('Simple Format Parser', () => {
    it('should parse simple format without units', () => {
      const ingredients = `
- 盐 适量
- 水 半杯
- 葱花 少许
`;

      const result = parseIngredients(ingredients, '');

      expect(result.main[0]).toEqual({
        name: '盐',
        amount: '适量',
        unit: ''
      });

      expect(result.main[1]).toEqual({
        name: '水',
        amount: '半杯',
        unit: ''
      });

      expect(result.main[2]).toEqual({
        name: '葱花',
        amount: '少许',
        unit: ''
      });
    });

    it('should handle simple format with descriptive amounts', () => {
      const ingredients = `
- 葱花 少许
- 香菜 适量
- 姜丝 几根
`;

      const result = parseIngredients(ingredients, '');

      expect(result.main[0]).toEqual({
        name: '葱花',
        amount: '少许',
        unit: ''
      });

      expect(result.main[1]).toEqual({
        name: '香菜',
        amount: '适量',
        unit: ''
      });

      expect(result.main[2]).toEqual({
        name: '姜丝',
        amount: '几根',
        unit: ''
      });
    });

    it('should handle simple format with cooking terms', () => {
      const ingredients = `
- 盐 最后调味
- 油 热锅冷油
- 水 烧开后放凉
`;

      const result = parseIngredients(ingredients, '');

      expect(result.main[0]).toEqual({
        name: '盐',
        amount: '最后调味',
        unit: ''
      });

      expect(result.main[1]).toEqual({
        name: '油',
        amount: '热锅冷油',
        unit: ''
      });

      expect(result.main[2]).toEqual({
        name: '水',
        amount: '烧开后放凉',
        unit: ''
      });
    });
  });

  describe('Name Only Format Parser', () => {
    it('should parse ingredients with only name', () => {
      const ingredients = `
- 葱丝
- 香菜
- 姜丝
- 胡萝卜丝
- 蒜片
`;

      const result = parseIngredients(ingredients, '');

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

    it('should handle single word ingredients', () => {
      const ingredients = `
- 葱花
- 香菜
- 姜丝
`;

      const result = parseIngredients(ingredients, '');

      expect(result.main[0]).toEqual({
        name: '葱花',
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
    });

    it('should handle garnishes and decorations', () => {
      const ingredients = `
- 芝麻
- 枸杞
- 薄荷叶
`;

      const result = parseIngredients(ingredients, '');

      expect(result.main[0]).toEqual({
        name: '芝麻',
        amount: '',
        unit: ''
      });

      expect(result.main[1]).toEqual({
        name: '枸杞',
        amount: '',
        unit: ''
      });

      expect(result.main[2]).toEqual({
        name: '薄荷叶',
        amount: '',
        unit: ''
      });
    });

    it('should handle herbs and spices', () => {
      const ingredients = `
- 八角
- 桂皮
- 花椒
`;

      const result = parseIngredients(ingredients, '');

      expect(result.main[0]).toEqual({
        name: '八角',
        amount: '',
        unit: ''
      });

      expect(result.main[1]).toEqual({
        name: '桂皮',
        amount: '',
        unit: ''
      });

      expect(result.main[2]).toEqual({
        name: '花椒',
        amount: '',
        unit: ''
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle ingredients with special characters in name', () => {
      const ingredients = `
- 辣椒（干）
- 花椒（整粒）
- 八角（大料）
`;

      const result = parseIngredients(ingredients, '');

      // Note: These are parsed by descriptive format parser because they contain parentheses
      expect(result.main[0]).toEqual({
        name: '辣椒',
        amount: '干',
        unit: ''
      });

      expect(result.main[1]).toEqual({
        name: '花椒',
        amount: '整粒',
        unit: ''
      });

      expect(result.main[2]).toEqual({
        name: '八角',
        amount: '大料',
        unit: ''
      });
    });

    it('should handle mixed simple and name-only formats', () => {
      const ingredients = `
- 葱花
- 盐 适量
- 香菜
- 油 少许
- 姜丝
`;

      const result = parseIngredients(ingredients, '');

      expect(result.main[0]).toEqual({
        name: '葱花',
        amount: '',
        unit: ''
      });

      expect(result.main[1]).toEqual({
        name: '盐',
        amount: '适量',
        unit: ''
      });

      expect(result.main[2]).toEqual({
        name: '香菜',
        amount: '',
        unit: ''
      });

      expect(result.main[3]).toEqual({
        name: '油',
        amount: '少许',
        unit: ''
      });

      expect(result.main[4]).toEqual({
        name: '姜丝',
        amount: '',
        unit: ''
      });
    });
  });
});
