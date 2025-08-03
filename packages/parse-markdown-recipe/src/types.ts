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

// Recipe model interfaces
export interface Recipe {
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

export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
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