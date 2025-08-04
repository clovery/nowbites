import { marked } from "marked";
import matter from "gray-matter";
import type { ParsedRecipe, RecipeMetadata, Recipe } from "./types";
import { convertToRecipeFormat } from "./data-converter";

class MarkdownParser {
  private marked: typeof marked;
  private matter: typeof matter;
  private parsedRecipe: ParsedRecipe | null = null;

  constructor() {
    this.marked = marked;
    this.matter = matter;
  }

  async parse(markdown: string): Promise<MarkdownParser> {
    const { data, content } = this.matter(markdown);
    const html = await this.marked.parse(content);
    
    this.parsedRecipe = {
      metadata: data as RecipeMetadata,
      content,
      html,
    };
    
    return this;
  }

  getContentWithoutFrontmatter(markdown: string): string {
    const { content } = this.matter(markdown);
    return content;
  }

  toJson(): Recipe {
    if (!this.parsedRecipe) {
      throw new Error("No recipe has been parsed yet. Call parse() first.");
    }
    return convertToRecipeFormat(this.parsedRecipe);
  }

  getParsedRecipe(): ParsedRecipe | null {
    return this.parsedRecipe;
  }
}

/**
 * Parse a markdown recipe file and return a MarkdownParser instance
 * @param markdown - The markdown content to parse
 * @returns MarkdownParser instance with parsed recipe data
 */
export async function parseMarkdownRecipe(markdown: string): Promise<MarkdownParser> {
  const parser = new MarkdownParser();
  return await parser.parse(markdown);
}

/**
 * Get the content without frontmatter for parsing ingredients and instructions
 * @param markdown - The original markdown content
 * @returns Content without frontmatter
 */
export function getContentWithoutFrontmatter(markdown: string): string {
  const { content } = matter(markdown);
  return content;
}

export { MarkdownParser }; 