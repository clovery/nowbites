import { parseMarkdownRecipe, extractIngredients, extractInstructions, getContentWithoutFrontmatter } from '../index';

describe('Chinese Recipe Parsing', () => {
  const chineseRecipeMarkdown = `# 乌发养生豆浆食谱

一款适合日常养发、补肾养血的健康饮品，选用黑色食材与坚果搭配，营养丰富，口感香浓。

---

## 📝 材料（1人份）

| 食材     | 用量   |
|----------|--------|
| 黑豆     | 10g    |
| 黑芝麻   | 5g     |
| 花生     | 10g    |
| 红枣     | 2颗    |
| 清水     | 300ml  |

---

## 🍳 做法步骤

1. **提前浸泡**（推荐）：
   - 黑豆、花生提前浸泡 6~8 小时，黑芝麻可不用泡。
   - 红枣去核备用。

2. **放入豆浆机/破壁机**：
   - 将所有食材和 300ml 水倒入机器中。

3. **选择程序**：
   - 启动"豆浆"或"营养糊"程序（约25分钟）。

4. **过滤（可选）**：
   - 打好的豆浆根据个人口感可过滤掉渣滓。

5. **加热或保温**：
   - 若未自动加热，请煮沸后饮用。

---

## 💡 温馨提示

- 可根据个人口味加入适量冰糖或蜂蜜调味。
- 红枣有甜味，若不喜甜可减少。
- 有破壁功能的机器能保留更多膳食纤维。

---

## ⚕️ 功效简述

- **黑豆**：补肾乌发、延缓衰老  
- **黑芝麻**：养肝润燥、通便美容  
- **花生**：补脾和胃、润肺化痰  
- **红枣**：补气养血、调和营养

---

> 📌 建议每周饮用 2~3 次，坚持调养效果更佳。`;

  describe('parseMarkdownRecipe', () => {
    it('should parse Chinese recipe metadata correctly', async () => {
      const parser = await parseMarkdownRecipe(chineseRecipeMarkdown);
      const parsedRecipe = parser.getParsedRecipe();
      
      // Since there's no frontmatter, metadata should be empty or have default values
      expect(parsedRecipe?.metadata.title).toBeUndefined();
      expect(parsedRecipe?.metadata.description).toBeUndefined();
      expect(parsedRecipe?.metadata.cookingTime).toBeUndefined();
      expect(parsedRecipe?.metadata.servings).toBeUndefined();
      expect(parsedRecipe?.metadata.difficulty).toBeUndefined();
      expect(parsedRecipe?.metadata.tags).toBeUndefined();
    });

    it('should generate HTML content', async () => {
      const parser = await parseMarkdownRecipe(chineseRecipeMarkdown);
      const parsedRecipe = parser.getParsedRecipe();
      
      expect(parsedRecipe?.html).toContain('<h1>');
      expect(parsedRecipe?.html).toContain('乌发养生豆浆食谱');
      expect(parsedRecipe?.html).toContain('<h2>');
    });

    it('should convert to JSON format', async () => {
      const parser = await parseMarkdownRecipe(chineseRecipeMarkdown);
      const recipe = parser.toJson();
      
      expect(recipe.title).toBe('乌发养生豆浆食谱');
      expect(recipe.description).toBe('一款适合日常养发、补肾养血的健康饮品，选用黑色食材与坚果搭配，营养丰富，口感香浓。');
      expect(recipe.ingredients.main.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
    });
  });

  describe('extractIngredients', () => {
    it('should extract ingredients from Chinese recipe table format', () => {
      const contentWithoutFrontmatter = getContentWithoutFrontmatter(chineseRecipeMarkdown);
      const ingredients = extractIngredients(contentWithoutFrontmatter);
      
      expect(ingredients).toContain('黑豆 10g');
      expect(ingredients).toContain('黑芝麻 5g');
      expect(ingredients).toContain('花生 10g');
      expect(ingredients).toContain('红枣 2颗');
      expect(ingredients).toContain('清水 300ml');
    });
  });

  describe('extractInstructions', () => {
    it('should extract cooking instructions from Chinese recipe', () => {
      const contentWithoutFrontmatter = getContentWithoutFrontmatter(chineseRecipeMarkdown);
      const instructions = extractInstructions(contentWithoutFrontmatter);
      
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0]).toContain('提前浸泡');
      expect(instructions[0]).toContain('黑豆、花生提前浸泡 6~8 小时，黑芝麻可不用泡。');
      expect(instructions[0]).toContain('红枣去核备用。');
    });
  });
}); 