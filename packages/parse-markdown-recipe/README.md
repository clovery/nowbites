# @nowbites/parse-markdown-recipe

A utility package for parsing markdown recipe files and extracting structured data.

## Features

- Parse markdown recipe files with frontmatter metadata
- Extract ingredients and cooking instructions
- Convert markdown content to HTML
- Support for both English and Chinese recipe formats
- Convert parsed recipes to Prisma database format
- TypeScript support with full type definitions
- Direct source code exposure (no build step required)
- Comprehensive Jest test suite with coverage

## Installation

This package is part of the monorepo and can be used by other packages in the workspace.

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint

# Check types
pnpm check-types
```

## Usage

```typescript
import { parseMarkdownRecipe, extractIngredients, extractInstructions, convertToRecipeFormat } from '@nowbites/parse-markdown-recipe';

// Parse a markdown recipe
const markdown = `
---
title: "Spaghetti Carbonara"
description: "Classic Italian pasta dish"
cookingTime: "20 minutes"
servings: "4"
difficulty: "Medium"
tags: ["pasta", "italian", "quick"]
---

## Ingredients

- 400g spaghetti
- 200g pancetta or guanciale
- 4 large eggs
- 100g Pecorino Romano cheese
- Black pepper
- Salt

## Instructions

1. Bring a large pot of salted water to boil
2. Cook spaghetti according to package directions
3. Meanwhile, cook pancetta in a large skillet until crispy
4. Beat eggs with grated cheese and black pepper
5. Drain pasta, reserving some cooking water
6. Toss hot pasta with egg mixture and pancetta
7. Add reserved cooking water if needed for creaminess
`;

const recipe = await parseMarkdownRecipe(markdown);

console.log(recipe.metadata.title); // "Spaghetti Carbonara"
console.log(recipe.metadata.cookingTime); // "20 minutes"

// Extract ingredients and instructions
const ingredients = extractIngredients(recipe.content);
const instructions = extractInstructions(recipe.content);

console.log(ingredients);
// ["400g spaghetti", "200g pancetta or guanciale", ...]

console.log(instructions);
// ["Bring a large pot of salted water to boil", ...]

// Convert to Recipe format for database storage
const recipeData = convertToRecipeFormat(recipe);
console.log(recipeData);
// {
//   title: "Spaghetti Carbonara",
//   ingredients: [{ name: "spaghetti", amount: "400g", unit: "g" }, ...],
//   steps: [{ title: "步骤 1", content: ["Bring a large pot..."] }, ...],
//   cookingTime: 20,
//   servings: 4,
//   ...
// }
```

## API Reference

### `parseMarkdownRecipe(markdown: string): Promise<ParsedRecipe>`

Parses a markdown recipe file and returns structured data.

**Parameters:**
- `markdown` (string): The markdown content to parse

**Returns:**
- `ParsedRecipe` object with:
  - `metadata`: Frontmatter data as RecipeMetadata
  - `content`: Raw markdown content
  - `html`: HTML version of the content

### `extractIngredients(content: string): string[]`

Extracts ingredients from recipe content by looking for bullet points or table format (for Chinese recipes).

### `extractInstructions(content: string): string[]`

Extracts cooking instructions from recipe content by looking for numbered or bulleted lists in instruction sections (supports both English and Chinese).

### `convertToRecipeFormat(parsedRecipe: ParsedRecipe): Recipe`

Converts a parsed recipe to the Recipe database format with structured JSON fields for ingredients, steps, and tips.

**Parameters:**
- `parsedRecipe` (ParsedRecipe): The parsed recipe from parseMarkdownRecipe

**Returns:**
- `Recipe` object ready for database insertion

## Types

### `RecipeMetadata`

```typescript
interface RecipeMetadata {
  title?: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  cookingTime?: string;
  servings?: string;
  difficulty?: string;
  tags?: string[];
  [key: string]: any;
}
```

### `ParsedRecipe`

```typescript
interface ParsedRecipe {
  metadata: RecipeMetadata;
  content: string;
  html: string;
}
```

### `Recipe`

```typescript
interface Recipe {
  id?: string;
  title: string;
  coverImage?: string;
  ingredients: Json;
  sauce: Json;
  steps: Json;
  tips: Json;
  description?: string;
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  imageUrl?: string;
  tags: string[];
}
```

### `Ingredient`

```typescript
interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
}
```

### `Step`

```typescript
interface Step {
  title: string;
  time?: number; // in minutes
  content: string[];
}
```

### `Tip`

```typescript
interface Tip {
  content: string;
}
``` 