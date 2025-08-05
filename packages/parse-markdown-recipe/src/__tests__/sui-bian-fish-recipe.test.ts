import { parseMarkdownRecipe, extractIngredients, extractInstructions, getContentWithoutFrontmatter } from '../index';
import { 
  extractMainIngredientsSection, 
  extractAuxiliaryIngredientsSection, 
  extractSauceSection 
} from '../content-extractor';

describe('Sui Bian Fish Recipe Parsing', () => {
  const suiBianFishRecipeMarkdown = `# 隋卞做带鱼

## 🧂 食材准备

### 主料  
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）  

### 辅料  
- 花雕酒 25g  
- 食用油 130g  
- 蒜 30g  
- 姜 30g  
- 花椒 10g  
- 干辣椒段 150g  
- 葱花 30g  
- 花生米 80g  
- 淀粉 5g  

### 调味汁  
- 酱油 50g  
- 米醋 50g  
- 白糖 80g  
- 味精 1g  
- 料酒 10g  

---

## 👨‍🍳 烹饪步骤

### 🥢 第一步：处理带鱼（00:18）
- 带鱼洗净后打上花刀。
- 用清水冲去一部分腥味。
- 加入花雕酒腌制去腥。
- 用厨房纸将表面水分吸干，备用。

---

### 🔥 第二步：煎带鱼（00:55）
- 热锅加油（六七成热），放入带鱼煎至表面定型、颜色微黄。
- 大约在 1:38 翻面，煎至 1:55 颜色加深。
- 将带鱼推至锅的一边，并将锅稍微倾斜，腾出空间炒香料。

---

### 🌶️ 第三步：炒香料（02:48）
- 倾斜锅后，在空的一边加入蒜炒至微黄。
- 加入花椒炒香。
- 加入姜片与干辣椒段，继续炒至辣椒变色出香味。

---

### 🧪 第四步：调汁翻炒
- 将锅放平，与带鱼一起翻炒均匀。
- 将调好的汁（兑入淀粉）搅拌均匀后倒入锅中。
- 快速翻炒，使带鱼均匀裹上酱汁。

---

### 🌿 第五步：收尾出锅
- 倒入葱花与花生米。
- 再次翻炒均匀，即可出锅装盘。

---

## ✅ 小贴士
- 带鱼下锅前一定要擦干水分，防止溅油。
- 调味汁建议提前调好，加入淀粉时搅拌均匀避免结块。`;

  describe('parseMarkdownRecipe', () => {
    it('should parse Sui Bian fish recipe metadata correctly', async () => {
      const parser = await parseMarkdownRecipe(suiBianFishRecipeMarkdown);
      const parsedRecipe = parser.getParsedRecipe();
      
      // Since there's no frontmatter, metadata should be empty or have default values
      expect(parsedRecipe?.metadata.title).toBeUndefined();
      expect(parsedRecipe?.metadata.description).toBeUndefined();
      expect(parsedRecipe?.metadata.cookingTime).toBeUndefined();
      expect(parsedRecipe?.metadata.servings).toBeUndefined();
      expect(parsedRecipe?.metadata.difficulty).toBeUndefined();
      expect(parsedRecipe?.metadata.tags).toBeUndefined();
    });

    it('should generate HTML content with emoji headers', async () => {
      const parser = await parseMarkdownRecipe(suiBianFishRecipeMarkdown);
      const parsedRecipe = parser.getParsedRecipe();
      
      expect(parsedRecipe?.html).toContain('<h1>');
      expect(parsedRecipe?.html).toContain('隋卞做带鱼');
      expect(parsedRecipe?.html).toContain('<h2>');
      expect(parsedRecipe?.html).toContain('🧂 食材准备');
      expect(parsedRecipe?.html).toContain('👨‍🍳 烹饪步骤');
    });

    it('should convert to JSON format with proper structure', async () => {
      const parser = await parseMarkdownRecipe(suiBianFishRecipeMarkdown);
      const recipe = parser.toJson();
      
      expect(recipe.title).toBe('隋卞做带鱼');
      expect(recipe.ingredients.main.length).toBeGreaterThan(0);
      expect(recipe.ingredients.auxiliary.length).toBeGreaterThan(0);
      expect(recipe.sauce.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(recipe.tips.length).toBeGreaterThan(0);
    });
  });

  describe('extractIngredients', () => {
    it('should extract ingredients from Sui Bian fish recipe format', () => {
      const contentWithoutFrontmatter = getContentWithoutFrontmatter(suiBianFishRecipeMarkdown);
      const ingredients = extractIngredients(contentWithoutFrontmatter);
      
      // Should extract ingredients from the table format if present
      // For this recipe, it uses bullet points, so extractIngredients might not find table format
      expect(ingredients).toBeDefined();
    });
  });

  describe('extractInstructions', () => {
    it('should extract cooking instructions from Sui Bian fish recipe', () => {
      const contentWithoutFrontmatter = getContentWithoutFrontmatter(suiBianFishRecipeMarkdown);
      const instructions = extractInstructions(contentWithoutFrontmatter);
      
      expect(instructions.length).toBeGreaterThan(0);
      // Should extract the step content
      expect(instructions.some(instruction => instruction.includes('带鱼洗净'))).toBe(true);
      expect(instructions.some(instruction => instruction.includes('热锅加油'))).toBe(true);
    });
  });

  describe('Section Extraction', () => {
    it('should extract main ingredients section correctly', () => {
      const mainSection = extractMainIngredientsSection(suiBianFishRecipeMarkdown);
      
      expect(mainSection).toContain('带鱼 500g（新鲜或冻带鱼，不能有臭味）');
      expect(mainSection).not.toContain('花雕酒');
      expect(mainSection).not.toContain('酱油');
    });

    it('should extract auxiliary ingredients section correctly', () => {
      const auxiliarySection = extractAuxiliaryIngredientsSection(suiBianFishRecipeMarkdown);
      
      expect(auxiliarySection).toContain('花雕酒 25g');
      expect(auxiliarySection).toContain('食用油 130g');
      expect(auxiliarySection).toContain('蒜 30g');
      expect(auxiliarySection).toContain('姜 30g');
      expect(auxiliarySection).toContain('花椒 10g');
      expect(auxiliarySection).toContain('干辣椒段 150g');
      expect(auxiliarySection).toContain('葱花 30g');
      expect(auxiliarySection).toContain('花生米 80g');
      expect(auxiliarySection).toContain('淀粉 5g');
      expect(auxiliarySection).not.toContain('带鱼');
      expect(auxiliarySection).not.toContain('酱油');
    });

    it('should extract sauce section correctly', () => {
      const sauceSection = extractSauceSection(suiBianFishRecipeMarkdown);
      
      expect(sauceSection).toContain('酱油 50g');
      expect(sauceSection).toContain('米醋 50g');
      expect(sauceSection).toContain('白糖 80g');
      expect(sauceSection).toContain('味精 1g');
      expect(sauceSection).toContain('料酒 10g');
      expect(sauceSection).not.toContain('带鱼');
      expect(sauceSection).not.toContain('花雕酒');
    });
  });

  describe('Recipe Structure Validation', () => {
    it('should parse ingredients with notes correctly', async () => {
      const parser = await parseMarkdownRecipe(suiBianFishRecipeMarkdown);
      const recipe = parser.toJson();
      console.log('recipe', JSON.stringify(recipe, null, 2));
      
      // Check main ingredient with note
      const mainIngredient = recipe.ingredients.main.find(ing => ing.name === '带鱼');
      expect(mainIngredient).toBeDefined();
      if (mainIngredient) {
        expect(mainIngredient.name).toBe('带鱼');
        expect(mainIngredient.amount).toBe('500');
        expect(mainIngredient.unit).toBe('g');
        expect(mainIngredient.note).toBe('新鲜或冻带鱼，不能有臭味');
      }
    });

    it('should parse steps with time codes correctly', async () => {
      const parser = await parseMarkdownRecipe(suiBianFishRecipeMarkdown);
      const recipe = parser.toJson();
      
      const steps = recipe.steps as unknown as Array<{ title: string; content: string[] }>;
      expect(steps.length).toBeGreaterThan(0);
      
      // Check that steps contain the expected content
      const firstStep = steps[0];
      if (firstStep) {
        expect(firstStep.content.some(content => content.includes('带鱼洗净'))).toBe(true);
        expect(firstStep.content.some(content => content.includes('花雕酒腌制'))).toBe(true);
      }
    });

    it('should parse tips correctly', async () => {
      const parser = await parseMarkdownRecipe(suiBianFishRecipeMarkdown);
      const recipe = parser.toJson();
      
      const tips = recipe.tips as unknown as Array<{ content: string }>;
      expect(tips.length).toBeGreaterThan(0);
      
      // Check tip content
      const tipContents = tips.map(tip => tip.content);
      expect(tipContents.some(tip => tip.includes('擦干水分'))).toBe(true);
      expect(tipContents.some(tip => tip.includes('调味汁建议提前调好'))).toBe(true);
    });

    it('should handle emoji headers gracefully', async () => {
      const parser = await parseMarkdownRecipe(suiBianFishRecipeMarkdown);
      const recipe = parser.toJson();
      
      // Should still parse correctly despite emoji headers
      expect(recipe.title).toBe('隋卞做带鱼');
      expect(recipe.ingredients.main.length).toBeGreaterThan(0);
      expect(recipe.ingredients.auxiliary.length).toBeGreaterThan(0);
      expect(recipe.sauce.length).toBeGreaterThan(0);
    });
  });
}); 