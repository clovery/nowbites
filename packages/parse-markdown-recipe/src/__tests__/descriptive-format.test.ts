import { parseIngredients } from '../ingredients-parser';

describe('Descriptive Format Parser', () => {
  it('should parse descriptive format', () => {
    const ingredients = `
- 水（用于泡淀粉）
- 色拉油（炸肉使用）
- 豆油（少量，调香）
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '水',
      amount: '用于泡淀粉',
      unit: ''
    });

    expect(result.main[1]).toEqual({
      name: '色拉油',
      amount: '炸肉使用',
      unit: ''
    });

    expect(result.main[2]).toEqual({
      name: '豆油',
      amount: '少量，调香',
      unit: ''
    });
  });

  it('should handle descriptive format with complex descriptions', () => {
    const ingredients = `
- 盐（腌肉 3–5g + 调汁 2g）
- 胡椒粉（适量，根据口味调整）
- 黄酒（适量，去腥增香）
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '盐',
      amount: '腌肉 3–5g + 调汁 2g',
      unit: ''
    });

    expect(result.main[1]).toEqual({
      name: '胡椒粉',
      amount: '适量，根据口味调整',
      unit: ''
    });

    expect(result.main[2]).toEqual({
      name: '黄酒',
      amount: '适量，去腥增香',
      unit: ''
    });
  });

  it('should handle descriptive format with cooking instructions', () => {
    const ingredients = `
- 水（烧开后放凉）
- 油（热锅冷油）
- 盐（最后调味）
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '水',
      amount: '烧开后放凉',
      unit: ''
    });

    expect(result.main[1]).toEqual({
      name: '油',
      amount: '热锅冷油',
      unit: ''
    });

    expect(result.main[2]).toEqual({
      name: '盐',
      amount: '最后调味',
      unit: ''
    });
  });

  it('should handle descriptive format with preparation notes', () => {
    const ingredients = `
- 葱（切葱花）
- 姜（切片）
- 蒜（拍碎）
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '葱',
      amount: '切葱花',
      unit: ''
    });

    expect(result.main[1]).toEqual({
      name: '姜',
      amount: '切片',
      unit: ''
    });

    expect(result.main[2]).toEqual({
      name: '蒜',
      amount: '拍碎',
      unit: ''
    });
  });

  it('should handle descriptive format with quality requirements', () => {
    const ingredients = `
- 带鱼（新鲜或冻带鱼，不能有臭味）
- 花雕酒（陈年佳酿）
- 食用油（花生油或菜籽油）
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '带鱼',
      amount: '新鲜或冻带鱼，不能有臭味',
      unit: ''
    });

    expect(result.main[1]).toEqual({
      name: '花雕酒',
      amount: '陈年佳酿',
      unit: ''
    });

    expect(result.main[2]).toEqual({
      name: '食用油',
      amount: '花生油或菜籽油',
      unit: ''
    });
  });
});
