import { extractReferences, extractReferencesWithMetadata } from '../references-extractor';

describe('References Extractor', () => {
  const markdownWithReferences = `# 红烧牛肉（老饭骨版）

## 食材准备

### 主料
* 牛腩 — 约 1 千克

---

## 烹饪步骤

### 第一步：焯水去腥
1. 牛腩切块。

---

## 小贴士
* 白醋焯水可去腥并软化肉质。

---

## 参考

* [老饭骨《红烧牛肉》视频](https://b23.tv/pb48PtP)
* [红烧牛肉做法详解](https://example.com/beef-recipe)
* 传统川菜烹饪技巧
* [YouTube 教程](https://youtube.com/watch?v=123)
* [烹饪书籍《川菜大全》](https://bookstore.com/book/123)`;

  describe('extractReferences', () => {
    it('should extract references from markdown content', () => {
      const references = extractReferences(markdownWithReferences);
      
      expect(references).toHaveLength(5);
      
      // Check first reference (markdown link)
      expect(references[0]).toEqual({
        title: '老饭骨《红烧牛肉》视频',
        url: 'https://b23.tv/pb48PtP',
        type: 'video'
      });
      
      // Check second reference (markdown link)
      expect(references[1]).toEqual({
        title: '红烧牛肉做法详解',
        url: 'https://example.com/beef-recipe',
        type: 'website'
      });
      
      // Check third reference (plain text)
      expect(references[2]).toEqual({
        title: '传统川菜烹饪技巧',
        type: 'technique'
      });
      
      // Check fourth reference (YouTube)
      expect(references[3]).toEqual({
        title: 'YouTube 教程',
        url: 'https://youtube.com/watch?v=123',
        type: 'video'
      });
      
      // Check fifth reference (book)
      expect(references[4]).toEqual({
        title: '烹饪书籍《川菜大全》',
        url: 'https://bookstore.com/book/123',
        type: 'book'
      });
    });

    it('should handle different reference section headers', () => {
      const markdownWithEnglishHeader = `# Recipe

## References

* [Video Tutorial](https://example.com/video)
* [Blog Post](https://example.com/blog)`;

      const references = extractReferences(markdownWithEnglishHeader);
      
      expect(references).toHaveLength(2);
      expect(references[0].title).toBe('Video Tutorial');
      expect(references[0].url).toBe('https://example.com/video');
    });

    it('should handle alternative Chinese headers', () => {
      const markdownWithAlternativeHeader = `# Recipe

## 引用

* [视频教程](https://example.com/video)`;

      const references = extractReferences(markdownWithAlternativeHeader);
      
      expect(references).toHaveLength(1);
      expect(references[0].title).toBe('视频教程');
    });

    it('should return empty array when no references section', () => {
      const markdownWithoutReferences = `# Recipe

## 食材
* 食材1 100g

## 步骤
1. 第一步`;

      const references = extractReferences(markdownWithoutReferences);
      
      expect(references).toHaveLength(0);
    });

    it('should stop at next section header', () => {
      const markdownWithMultipleSections = `# Recipe

## 参考

* [链接1](https://example1.com)
* [链接2](https://example2.com)

## 其他内容

* 不应该被包含的内容`;

      const references = extractReferences(markdownWithMultipleSections);
      
      expect(references).toHaveLength(2);
      expect(references[0].url).toBe('https://example1.com');
      expect(references[1].url).toBe('https://example2.com');
    });
  });

  describe('extractReferencesWithMetadata', () => {
    it('should extract references with enhanced metadata', () => {
      const references = extractReferencesWithMetadata(markdownWithReferences);
      
      expect(references).toHaveLength(5);
      
      // Check enhanced metadata for first reference
      expect(references[0]).toMatchObject({
        title: '老饭骨《红烧牛肉》视频',
        url: 'https://b23.tv/pb48PtP',
        type: 'video',
        domain: 'b23.tv',
        isExternal: true
      });
      
      // Check enhanced metadata for plain text reference
      expect(references[2]).toMatchObject({
        title: '传统川菜烹饪技巧',
        type: 'technique',
        isExternal: false
      });
    });

    it('should handle invalid URLs gracefully', () => {
      const markdownWithInvalidUrl = `# Recipe

## 参考

* [无效链接](invalid-url)
* [有效链接](https://example.com)`;

      const references = extractReferencesWithMetadata(markdownWithInvalidUrl);
      
      expect(references).toHaveLength(2);
      
      expect(references[0]).toMatchObject({
        title: '无效链接',
        isExternal: false
      });
      
      expect(references[1]).toMatchObject({
        title: '有效链接',
        url: 'https://example.com',
        domain: 'example.com',
        isExternal: true
      });
    });
  });

  describe('Reference type inference', () => {
    it('should infer video type correctly', () => {
      const videoReferences = [
        '[B站视频](https://b23.tv/abc123)',
        '[YouTube教程](https://youtube.com/watch?v=123)',
        '[视频教程](https://example.com/video)'
      ];
      
      videoReferences.forEach(refText => {
        const markdown = `# Recipe\n## 参考\n* ${refText}`;
        const references = extractReferences(markdown);
        expect(references[0].type).toBe('video');
      });
    });

    it('should infer article type correctly', () => {
      const articleReferences = [
        '[博客文章](https://blog.example.com/post)',
        '[文章](https://example.com/article)',
        '[Blog Post](https://example.com/blog)'
      ];
      
      articleReferences.forEach(refText => {
        const markdown = `# Recipe\n## 参考\n* ${refText}`;
        const references = extractReferences(markdown);
        expect(references[0].type).toBe('article');
      });
    });

    it('should infer book type correctly', () => {
      const bookReferences = [
        '[烹饪书籍](https://example.com/book)',
        '[教材](https://example.com/textbook)',
        '[Book](https://example.com/book)'
      ];
      
      bookReferences.forEach(refText => {
        const markdown = `# Recipe\n## 参考\n* ${refText}`;
        const references = extractReferences(markdown);
        expect(references[0].type).toBe('book');
      });
    });

    it('should infer technique type correctly', () => {
      const techniqueReferences = [
        '传统烹饪技巧',
        '烹饪方法',
        'Traditional technique'
      ];
      
      techniqueReferences.forEach(refText => {
        const markdown = `# Recipe\n## 参考\n* ${refText}`;
        const references = extractReferences(markdown);
        expect(references[0].type).toBe('technique');
      });
    });
  });
});
