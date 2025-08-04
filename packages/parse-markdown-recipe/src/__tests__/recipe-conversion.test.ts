import { parseMarkdownRecipe } from '../index';
import type { Recipe } from '../types';

describe('Recipe Format Conversion', () => {
  const testRecipeMarkdown = `# 乌发养生豆浆食谱

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

  describe('MarkdownParser toJson', () => {
    it('should convert parsed recipe to Recipe format', async () => {
      const parser = await parseMarkdownRecipe(testRecipeMarkdown);
      const recipe = parser.toJson();
      console.log('recipe', JSON.stringify(recipe, null, 2));
      expect(recipe).toBeDefined();
      expect(recipe.title).toBe('乌发养生豆浆食谱');
      expect(recipe.description).toBe('一款适合日常养发、补肾养血的健康饮品，选用黑色食材与坚果搭配，营养丰富，口感香浓。');
      expect((recipe.steps as any[]).length).toBe(5);
      expect(recipe.cookingTime).toBeUndefined();
      expect(recipe.servings).toBeUndefined();
      expect(recipe.difficulty).toBeUndefined();
      expect(recipe.tags).toEqual([]);
    });

    it('should have correct Recipe interface structure', async () => {
      const parser = await parseMarkdownRecipe(testRecipeMarkdown);
      const recipe: Recipe = parser.toJson();
      
      // Check required fields
      expect(typeof recipe.title).toBe('string');
      expect(recipe.ingredients).toHaveProperty('main');
      expect(recipe.ingredients).toHaveProperty('auxiliary');
      expect(Array.isArray(recipe.ingredients.main)).toBe(true);
      expect(Array.isArray(recipe.ingredients.auxiliary)).toBe(true);
      expect(Array.isArray(recipe.sauce)).toBe(true);
      expect(Array.isArray(recipe.steps)).toBe(true);
      expect(Array.isArray(recipe.tips)).toBe(true);
      expect(Array.isArray(recipe.tags)).toBe(true);
    });

    it('should convert ingredients to structured format', async () => {
      const parser = await parseMarkdownRecipe(testRecipeMarkdown);
      const recipe = parser.toJson();
      
      const ingredients = recipe.ingredients.main;
      expect(ingredients.length).toBeGreaterThan(0);
      
      // Check ingredient structure
      const firstIngredient = ingredients.find((ing) => ing.name === '黑豆');
      expect(firstIngredient).toBeDefined();
      if (firstIngredient) {
        expect(firstIngredient.name).toBe('黑豆');
        expect(firstIngredient.amount).toBe('10g');
        expect(firstIngredient.unit).toBe('g');
      }
    });

    it('should convert steps to structured format', async () => {
      const parser = await parseMarkdownRecipe(testRecipeMarkdown);
      const recipe = parser.toJson();
      
      const steps = recipe.steps as unknown as Array<{ title: string; content: string[] }>;
      expect(steps.length).toBeGreaterThan(0);
      
      // Check step structure
      const firstStep = steps[0];
      if (firstStep) {
        expect(firstStep.title).toBe('步骤 1');
        expect(Array.isArray(firstStep.content)).toBe(true);
        expect(firstStep.content[0]).toContain('提前浸泡');
      }
    });

    it('should extract tips correctly', async () => {
      const parser = await parseMarkdownRecipe(testRecipeMarkdown);
      const recipe = parser.toJson();
      
      const tips = recipe.tips as unknown as Array<{ content: string }>;
      expect(tips.length).toBeGreaterThan(0);
      
      // Check tip structure
      const firstTip = tips[0];
      if (firstTip) {
        expect(firstTip.content).toContain('冰糖或蜂蜜');
      }
    });

    it('should handle missing metadata gracefully', async () => {
      const minimalMarkdown = `# Test Recipe

## 📝 材料

| 食材 | 用量 |
|------|------|
| 测试 | 1个 |

## 🍳 做法步骤

1. 测试步骤`;

      const parser = await parseMarkdownRecipe(minimalMarkdown);
      const recipe = parser.toJson();
      
      expect(recipe.title).toBe('Test Recipe');
      expect(recipe.cookingTime).toBeUndefined();
      expect(recipe.servings).toBeUndefined();
      expect(recipe.difficulty).toBeUndefined();
      expect(recipe.tags).toEqual([]);
    });
  });
}); 