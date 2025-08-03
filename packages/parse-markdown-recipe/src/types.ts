// Type for JSON fields
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface RecipeMetadata {
  title?: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  cookingTime?: string;
  servings?: string;
  difficulty?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface ParsedRecipe {
  metadata: RecipeMetadata;
  content: string;
  html: string;
}

// Enhanced Recipe model interfaces
export interface Recipe {
  id?: string;
  title: string;
  coverImage?: string;
  ingredients: RecipeIngredients;
  sauce: Sauce[];
  steps: Step[];
  tips: Tip[];
  description?: string;
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  imageUrl?: string;
  tags: string[];
}

// Structured ingredients with main and auxiliary categories
export interface RecipeIngredients {
  main: Ingredient[];      // 主料
  auxiliary: Ingredient[]; // 辅料
}

export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
  note?: string; // 备注，如"新鲜或冻带鱼，不能有臭味"
}

export interface Sauce {
  name: string;
  amount: string;
  unit?: string;
}

export interface Step {
  title: string;
  time?: number; // in minutes
  content: string[];
}

export interface Tip {
  content: string;
} 