import { parseIngredients } from '../ingredients-parser';

describe('Em Dash Format Parser', () => {
  it('should parse simple em dash format', () => {
    const ingredients = `
- 陈皮 — 3 片
- 蒜 — 3 粒
- 桂皮 — 1 段
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '陈皮',
      amount: '3',
      unit: '片'
    });

    expect(result.main[1]).toEqual({
      name: '蒜',
      amount: '3',
      unit: '粒'
    });

    expect(result.main[2]).toEqual({
      name: '桂皮',
      amount: '1',
      unit: '段'
    });
  });

  it('should parse em dash format with complex notes', () => {
    const ingredients = `
- 大葱段 — 适量（去腥 5 段 + 炒制适量）
- 姜片 — 适量（去腥 3 片 + 炒制适量）
- 草果（去籽） — 1 粒
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '大葱段',
      amount: '适量',
      unit: '',
      note: '去腥 5 段 + 炒制适量'
    });

    expect(result.main[1]).toEqual({
      name: '姜片',
      amount: '适量',
      unit: '',
      note: '去腥 3 片 + 炒制适量'
    });

    expect(result.main[2]).toEqual({
      name: '草果（去籽）',
      amount: '1',
      unit: '粒'
    });
  });

  it('should handle em dash format with additional notes', () => {
    const ingredients = `
- 盐 — 适量（根据口味调整）
- 糖 — 10g（可选）
`;

    const result = parseIngredients(ingredients, '');

    expect(result.main[0]).toEqual({
      name: '盐',
      amount: '适量',
      unit: '',
      note: '根据口味调整'
    });

    expect(result.main[1]).toEqual({
      name: '糖',
      amount: '10',
      unit: 'g',
      note: '可选'
    });
  });

  it('should handle em dash format with Chinese units', () => {
    const ingredients = `
- 红枣 — 2颗
- 花生 — 10g
- 清水 — 300ml
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

  it('should handle em dash format with descriptive amounts', () => {
    const ingredients = `
- 葱花 — 少许
- 香菜 — 适量
- 姜丝 — 几根
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
});
