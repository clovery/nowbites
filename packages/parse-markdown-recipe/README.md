# Parse Markdown Recipe

A TypeScript library for parsing markdown recipe files and converting them to structured data formats.

## Features

- Parse markdown recipe files with frontmatter
- Extract ingredients, instructions, and metadata
- Support for Chinese recipe formats
- Structured recipe format with main/auxiliary ingredients and sauce
- Validation and conversion utilities
- TypeScript support with full type definitions

## Installation

```bash
npm install @nowbites/parse-markdown-recipe
```

## Basic Usage

### Parse a markdown recipe file

```typescript
import { parseMarkdownRecipe, convertToRecipeFormat } from '@nowbites/parse-markdown-recipe';

const markdown = `
---
title: 红烧带鱼
description: 经典的红烧带鱼，肉质鲜美
cookingTime: 110分钟
servings: 4人份
difficulty: medium
tags: [海鲜, 红烧]
---

### 主料
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）

### 辅料
- 花雕酒 25g
- 食用油 130g
- 蒜 30g
- 姜 30g

### 调味汁
- 酱油 50g
- 米醋 50g
- 白糖 80g
- 味精 1g
- 料酒 10g

### 步骤
1. 准备食材
   - 将带鱼清洗干净，去除内脏和鱼鳞
   - 将带鱼切成段，每段约5-6厘米

2. 腌制带鱼
   - 将带鱼段放入碗中
   - 加入料酒、盐腌制30分钟

### 小贴士
- 选择新鲜的带鱼很重要，避免有臭味的鱼
- 煎制带鱼时火候要控制好，避免煎糊
`;

const parsedRecipe = await parseMarkdownRecipe(markdown);
const recipe = convertToRecipeFormat(parsedRecipe);
```

### Use structured recipe format

```typescript
import { parseIngredients, parseSauce, validateRecipe, recipeToMarkdown } from '@nowbites/parse-markdown-recipe';
import type { Recipe } from '@nowbites/parse-markdown-recipe';

// Parse ingredients from markdown format
const mainIngredientsText = `
- 带鱼 500g（新鲜或冻带鱼，不能有臭味）
`;

const auxiliaryIngredientsText = `
- 花雕酒 25g
- 食用油 130g
- 蒜 30g
- 姜 30g
`;

const sauceText = `
- 酱油 50g
- 米醋 50g
- 白糖 80g
`;

// Parse structured ingredients
const ingredients = parseIngredients(mainIngredientsText, auxiliaryIngredientsText);
const sauce = parseSauce(sauceText);

// Create a complete recipe
const recipe: Recipe = {
  title: '红烧带鱼',
  description: '经典的红烧带鱼，肉质鲜美，味道浓郁',
  ingredients,
  sauce,
  steps: [
    {
      title: '准备食材',
      time: 15,
      content: [
        '将带鱼清洗干净，去除内脏和鱼鳞',
        '将带鱼切成段，每段约5-6厘米'
      ]
    },
    {
      title: '腌制带鱼',
      time: 30,
      content: [
        '将带鱼段放入碗中',
        '加入料酒、盐腌制30分钟'
      ]
    }
  ],
  tips: [
    { content: '选择新鲜的带鱼很重要，避免有臭味的鱼' },
    { content: '煎制带鱼时火候要控制好，避免煎糊' }
  ],
  cookingTime: 45,
  servings: 4,
  difficulty: 'medium',
  tags: ['海鲜', '红烧', '带鱼']
};

// Validate the recipe
const validation = validateRecipe(recipe);
if (validation.isValid) {
  console.log('✅ Recipe is valid!');
  
  // Convert to markdown format
  const markdown = recipeToMarkdown(recipe);
  console.log(markdown);
}
```

## Structured Recipe Format

The library supports a structured recipe format that separates ingredients into categories:

### Recipe Structure

```typescript
interface Recipe {
  title: string;
  description?: string;
  ingredients: RecipeIngredients;  // Main and auxiliary ingredients
  sauce: Sauce[];                  // Sauce ingredients
  steps: Step[];                   // Cooking steps
  tips: Tip[];                     // Cooking tips
  cookingTime?: number;            // Total cooking time in minutes
  servings?: number;               // Number of servings
  difficulty?: string;              // easy, medium, hard
  tags: string[];                  // Recipe tags
  coverImage?: string;             // Cover image URL
  imageUrl?: string;               // Additional image URL
}
```

### Ingredients Structure

```typescript
interface RecipeIngredients {
  main: Ingredient[];      // 主料 (Main ingredients)
  auxiliary: Ingredient[]; // 辅料 (Auxiliary ingredients)
}

interface Ingredient {
  name: string;     // Ingredient name
  amount: string;   // Amount (e.g., "500", "2")
  unit?: string;    // Unit (e.g., "g", "勺", "颗")
  note?: string;    // Optional note (e.g., "新鲜或冻带鱼，不能有臭味")
}

interface Sauce {
  name: string;     // Sauce name
  amount: string;   // Amount
  unit?: string;    // Unit
}
```

### Steps Structure

```typescript
interface Step {
  title: string;           // Step title
  time?: number;           // Time in minutes
  content: string[];       // Step instructions
}

interface Tip {
  content: string;         // Tip content
}
```

## API Reference

### Core Functions

#### `parseMarkdownRecipe(markdown: string): Promise<ParsedRecipe>`

Parse a markdown recipe file and extract metadata and content.

#### `convertToRecipeFormat(parsedRecipe: ParsedRecipe): Recipe`

Convert a parsed recipe to the structured Recipe format.

### Structured Recipe Utilities

#### `parseIngredients(mainIngredients: string, auxiliaryIngredients: string): RecipeIngredients`

Parse main and auxiliary ingredients from markdown format.

#### `parseSauce(content: string): Sauce[]`

Parse sauce ingredients from markdown format.

#### `validateRecipe(recipe: Recipe): { isValid: boolean; errors: string[] }`

Validate a recipe structure and return validation results.

#### `recipeToMarkdown(recipe: Recipe): string`

Convert a structured recipe back to markdown format.

### Content Extraction Functions

#### `extractIngredients(content: string): string[]`

Extract ingredients from recipe content.

#### `extractInstructions(content: string): string[]`

Extract cooking instructions from recipe content.

## Supported Formats

### Markdown Recipe Format

The library supports recipes written in markdown with the following structure:

```markdown
---
title: Recipe Title
description: Recipe description
cookingTime: 30分钟
servings: 4人份
difficulty: medium
tags: [tag1, tag2]
---

### 主料
- 食材1 100g
- 食材2 200g（备注信息）

### 辅料
- 辅料1 50g
- 辅料2 2勺

### 调味汁
- 酱油 30g
- 盐 适量

### 步骤
1. 第一步
   - 具体操作1
   - 具体操作2

2. 第二步
   - 具体操作3

### 小贴士
- 小贴士1
- 小贴士2
```

### Ingredient Parsing

The library can parse ingredients in various formats:

- `带鱼 500g（新鲜或冻带鱼，不能有臭味）` → name: "带鱼", amount: "500", unit: "g", note: "新鲜或冻带鱼，不能有臭味"
- `花雕酒 25g` → name: "花雕酒", amount: "25", unit: "g"
- `盐 适量` → name: "盐", amount: "适量", unit: ""
- `糖 2勺` → name: "糖", amount: "2", unit: "勺"

## Database Integration

The structured recipe format is designed to work with databases like PostgreSQL using Prisma:

```typescript
// Prisma schema
model Recipe {
  id          String   @id @default(cuid())
  title       String
  ingredients Json     // RecipeIngredients structure
  sauce       Json     // Sauce[] structure
  steps       Json     // Step[] structure
  tips        Json     // Tip[] structure
  // ... other fields
}

// Store recipe in database
const databaseRecipe = {
  title: recipe.title,
  ingredients: recipe.ingredients, // Stored as JSON
  sauce: recipe.sauce,             // Stored as JSON
  steps: recipe.steps,             // Stored as JSON
  tips: recipe.tips,               // Stored as JSON
  // ... other fields
};
```

## Examples

See the `examples/` directory for complete working examples:

- `structured-recipe-example.ts` - Complete example with your recipe format
- `chinese-recipe.test.ts` - Test cases for Chinese recipe parsing
- `recipe-conversion.test.ts` - Test cases for recipe conversion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `npm test` to ensure all tests pass
6. Submit a pull request

## License

MIT 