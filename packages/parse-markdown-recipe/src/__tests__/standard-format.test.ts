import { parseIngredients } from '../ingredients-parser';

describe('Standard Format Parser', () => {
  it('should parse standard format with units', () => {
    const ingredients = `
- 带鱼 500g
- 花雕酒 25g
- 食用油 130g
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

  it('should parse standard format with notes', () => {
    const ingredients = `
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）
- 花雕酒 25g（去腥用）
- 食用油 130g（炸制用）
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '带鱼',
      amount: '500',
      unit: 'g',
      note: '新鲜或冻带鱼，不能有臭味'
    });

    expect(result.main[1]).toEqual({
      name: '花雕酒',
      amount: '25',
      unit: 'g',
      note: '去腥用'
    });

    expect(result.main[2]).toEqual({
      name: '食用油',
      amount: '130',
      unit: 'g',
      note: '炸制用'
    });
  });

  it('should parse standard format with Chinese units', () => {
    const ingredients = `
- 红枣 2颗
- 花生 10g
- 清水 300ml
`;

    const result = parseIngredients(ingredients, '');

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

  it('should parse standard format with decimal amounts', () => {
    const ingredients = `
- 盐 2.5g
- 糖 1.5勺
- 油 0.5杯
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '盐',
      amount: '2.5',
      unit: 'g'
    });

    expect(result.main[1]).toEqual({
      name: '糖',
      amount: '1.5',
      unit: '勺'
    });

    expect(result.main[2]).toEqual({
      name: '油',
      amount: '0.5',
      unit: '杯'
    });
  });

  it('should parse standard format with mixed units', () => {
    const ingredients = `
- 鸡蛋 2个
- 面粉 200g
- 牛奶 1杯
- 黄油 50g
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '鸡蛋',
      amount: '2',
      unit: '个'
    });

    expect(result.main[1]).toEqual({
      name: '面粉',
      amount: '200',
      unit: 'g'
    });

    expect(result.main[2]).toEqual({
      name: '牛奶',
      amount: '1',
      unit: '杯'
    });

    expect(result.main[3]).toEqual({
      name: '黄油',
      amount: '50',
      unit: 'g'
    });
  });
});
