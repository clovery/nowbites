import fs from 'fs';
import path from 'path';
import { parseMarkdownRecipe } from '@nowbites/parse-markdown-recipe';

// Paths
const RECIPES_SOURCE_DIR = path.resolve(__dirname, '../../../docs/recipes');
const RECIPES_OUTPUT_DIR = path.resolve(__dirname, '../prisma/recipes');

async function convertRecipes(): Promise<void> {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(RECIPES_OUTPUT_DIR)) {
      fs.mkdirSync(RECIPES_OUTPUT_DIR, { recursive: true });
    }

    // Read all markdown files from source directory
    const files = fs.readdirSync(RECIPES_SOURCE_DIR)
      .filter(file => file.endsWith('.md'));

    console.log(`Found ${files.length} markdown files to convert:`);

    for (const file of files) {
      const filePath = path.join(RECIPES_SOURCE_DIR, file);
      const fileName = path.basename(file, '.md');
      
      console.log(`Converting ${file}...`);

      try {
        // Read markdown content
        const markdownContent = fs.readFileSync(filePath, 'utf-8');
        
        // Parse markdown to recipe format
        const parser = await parseMarkdownRecipe(markdownContent);
        const recipeJson = parser.toJson();
        
        // Create output filename (kebab-case with Chinese character support)
        const outputFileName = fileName
          .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // Keep Chinese characters, letters, numbers, spaces, hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .toLowerCase();
        
        const outputPath = path.join(RECIPES_OUTPUT_DIR, `${outputFileName}.json`);
        
        // Write JSON file
        fs.writeFileSync(outputPath, JSON.stringify(recipeJson, null, 2), 'utf-8');
        
        console.log(`✓ Converted ${file} -> ${outputFileName}.json`);
      } catch (error) {
        console.error(`✗ Error converting ${file}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log('\nConversion completed!');
    console.log(`Output directory: ${RECIPES_OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('Script error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the conversion
convertRecipes(); 