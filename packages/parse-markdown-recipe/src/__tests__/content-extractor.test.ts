import { 
  extractMainIngredientsSection, 
  extractAuxiliaryIngredientsSection, 
  extractSauceSection 
} from '../content-extractor';

describe('Content Extractor - Section Extraction', () => {
  const recipeWithSections = `# 红烧带鱼

## 主料
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）

## 辅料
- 花雕酒 25g
- 食用油 130g
- 蒜 30g
- 姜 30g

## 调味汁
- 酱油 50g
- 米醋 50g
- 白糖 80g

## 步骤
1. 准备食材
`;

  test('should extract main ingredients section', () => {
    const mainSection = extractMainIngredientsSection(recipeWithSections);
    
    expect(mainSection).toContain('带鱼 500g（新鲜或冻带鱼，不能有臭味）');
    expect(mainSection).not.toContain('花雕酒');
    expect(mainSection).not.toContain('酱油');
  });

  test('should extract auxiliary ingredients section', () => {
    const auxiliarySection = extractAuxiliaryIngredientsSection(recipeWithSections);
    
    expect(auxiliarySection).toContain('花雕酒 25g');
    expect(auxiliarySection).toContain('食用油 130g');
    expect(auxiliarySection).toContain('蒜 30g');
    expect(auxiliarySection).toContain('姜 30g');
    expect(auxiliarySection).not.toContain('带鱼');
    expect(auxiliarySection).not.toContain('酱油');
  });

  test('should extract sauce section', () => {
    const sauceSection = extractSauceSection(recipeWithSections);
    
    expect(sauceSection).toContain('酱油 50g');
    expect(sauceSection).toContain('米醋 50g');
    expect(sauceSection).toContain('白糖 80g');
    expect(sauceSection).not.toContain('带鱼');
    expect(sauceSection).not.toContain('花雕酒');
  });

  test('should handle recipe without specific sections', () => {
    const simpleRecipe = `# 简单食谱

## 材料
- 食材1 100g
- 食材2 200g

## 步骤
1. 开始烹饪
`;

    const mainSection = extractMainIngredientsSection(simpleRecipe);
    const auxiliarySection = extractAuxiliaryIngredientsSection(simpleRecipe);
    const sauceSection = extractSauceSection(simpleRecipe);
    
    // Should return empty strings when sections don't exist
    expect(mainSection.trim()).toBe('');
    expect(auxiliarySection.trim()).toBe('');
    expect(sauceSection.trim()).toBe('');
  });

  test('should handle different section header formats', () => {
    const recipeWithVariations = `# 测试食谱

## 主要食材
- 主料1 100g

## 辅助食材
- 辅料1 50g

## 调味料
- 调味料1 10g
`;

    const mainSection = extractMainIngredientsSection(recipeWithVariations);
    const auxiliarySection = extractAuxiliaryIngredientsSection(recipeWithVariations);
    const sauceSection = extractSauceSection(recipeWithVariations);
    
    expect(mainSection).toContain('主料1 100g');
    expect(auxiliarySection).toContain('辅料1 50g');
    expect(sauceSection).toContain('调味料1 10g');
  });
}); 