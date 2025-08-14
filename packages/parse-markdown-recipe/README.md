# Parse Markdown Recipe

A TypeScript library for parsing markdown recipe files and converting them to structured data.

## Features

- Parse markdown recipe files with or without frontmatter
- Extract structured ingredients (main and auxiliary)
- Parse cooking steps and instructions
- Extract tips and cooking advice
- **NEW**: Extract references and external links with enhanced metadata
- Convert to JSON format for database storage
- Support for Chinese recipe formats
- Handle various ingredient formats and units

## Installation

```bash
npm install @nowbites/parse-markdown-recipe
```

## Usage

### Basic Usage

```typescript
import { parseMarkdownRecipe } from '@nowbites/parse-markdown-recipe';

const markdown = `# Recipe Title

## 参考

* [Video Tutorial](https://example.com/video)
* [Blog Post](https://example.com/blog)
* Traditional cooking technique`;

const parser = await parseMarkdownRecipe(markdown);
const recipe = parser.toJson();

console.log(recipe.title); // "Recipe Title"
```

### References Extraction

The library now provides a dedicated references extractor with enhanced functionality:

```typescript
import { extractReferences, extractReferencesWithMetadata } from '@nowbites/parse-markdown-recipe';

const markdown = `## 参考

* [老饭骨《红烧牛肉》视频](https://b23.tv/pb48PtP)
* [红烧牛肉做法详解](https://example.com/beef-recipe)
* 传统川菜烹饪技巧`;

// Basic extraction
const basicReferences = extractReferences(markdown);
console.log(basicReferences);
// Output:
// [
//   { title: "老饭骨《红烧牛肉》视频", url: "https://b23.tv/pb48PtP", type: "video" },
//   { title: "红烧牛肉做法详解", url: "https://example.com/beef-recipe", type: "website" },
//   { title: "传统川菜烹饪技巧", type: "technique" }
// ]

// Enhanced extraction with metadata
const enhancedReferences = extractReferencesWithMetadata(markdown);
console.log(enhancedReferences);
// Output includes additional fields:
// - domain: extracted from URL
// - isExternal: boolean indicating if link is external
```

### References Format

The library supports extracting references from recipe markdown files in the following formats:

#### Markdown Links
```markdown
## 参考

* [老饭骨《红烧牛肉》视频](https://b23.tv/pb48PtP)
* [红烧牛肉做法详解](https://example.com/beef-recipe)
```

#### Plain Text with URLs
```markdown
## 参考

* 老饭骨《红烧牛肉》视频 https://b23.tv/pb48PtP
* 红烧牛肉做法详解 https://example.com/beef-recipe
```

#### Plain Text Only
```markdown
## 参考

* 传统川菜烹饪技巧
* 家庭烹饪小贴士
```

### Reference Object Structure

Each reference is parsed into an object with the following structure:

```typescript
interface Reference {
  title: string;        // The reference title or description
  url?: string;         // Optional URL if present
  description?: string; // Optional additional description
  type?: string;        // Inferred reference type
}

interface ReferenceWithMetadata extends Reference {
  domain?: string;      // Extracted domain from URL
  isExternal: boolean;  // Whether the link is external
}
```

### Automatic Type Inference

The library automatically infers reference types based on content:

- **video**: B站、YouTube、视频教程等
- **article**: 博客文章、文章等
- **book**: 书籍、教材等
- **technique**: 传统技巧、烹饪方法等
- **website**: 其他网站链接

### Supported Section Headers

The library recognizes the following section headers for references:
- `## 参考` (Chinese)
- `## References` (English)
- `## 引用` (Alternative Chinese)

## API Reference

### Core Functions

#### `parseMarkdownRecipe(markdown: string): Promise<MarkdownParser>`

Parse a markdown recipe and return a parser instance.

```typescript
const parser = await parseMarkdownRecipe(markdown);
const recipe = parser.toJson();
```

### References Functions

#### `extractReferences(content: string): Reference[]`

Extract basic references from recipe content.

```typescript
import { extractReferences } from '@nowbites/parse-markdown-recipe';

const references = extractReferences(markdownContent);
```

#### `extractReferencesWithMetadata(content: string): ReferenceWithMetadata[]`

Extract references with enhanced metadata including domain and external link detection.

```typescript
import { extractReferencesWithMetadata } from '@nowbites/parse-markdown-recipe';

const references = extractReferencesWithMetadata(markdownContent);
```

### Content Extraction Functions

#### `extractIngredients(content: string): Ingredient[]`

Extract ingredients from recipe content.

#### `extractInstructions(content: string): string[]`

Extract cooking instructions from recipe content.

#### `extractTips(content: string): string[]`

Extract cooking tips from recipe content.

## Architecture

The library is organized into specialized modules:

- **`content-extractor.ts`**: Core content extraction (ingredients, instructions, tips)
- **`references-extractor.ts`**: Dedicated references extraction with enhanced features
- **`ingredients-parser.ts`**: Structured ingredients parsing
- **`sauce-parser.ts`**: Sauce and seasoning parsing
- **`data-converter.ts`**: Recipe format conversion
- **`types.ts`**: TypeScript type definitions

## Database Integration

The library is designed to work with databases that support JSON fields. References can be stored separately or as part of the recipe structure.

### Example Usage with Database

```typescript
import { extractReferencesWithMetadata } from '@nowbites/parse-markdown-recipe';

// Extract references for storage
const references = extractReferencesWithMetadata(recipeContent);

// Store in database
const recipe = await db.recipe.create({
  data: {
    title: '红烧牛肉',
    content: recipeContent,
    references: references // Store as JSON or separate table
  }
});
```

## Testing

Run the test suite:

```bash
npm test
```

The library includes comprehensive tests for:
- Chinese recipe parsing
- Reference extraction with type inference
- Enhanced metadata extraction
- Various ingredient formats
- Step parsing
- Tip extraction

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT 