/**
 * Extract references from recipe content
 * @param content - The recipe content
 * @returns Array of reference objects
 */
export function extractReferences(content: string): Array<{ title: string; url?: string; description?: string; type?: string }> {
  const lines = content.split('\n');
  const references: Array<{ title: string; url?: string; description?: string; type?: string }> = [];
  let inReferences = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for references section headers (Chinese and English)
    if (trimmed.startsWith('##') && (trimmed.includes('参考') || trimmed.includes('References') || trimmed.includes('引用'))) {
      inReferences = true;
      continue;
    }
    
    // Stop when we hit another section
    if (inReferences && trimmed.startsWith('##')) {
      break;
    }
    
    if (inReferences && trimmed) {
      // Handle bullet points with links
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const content = trimmed.substring(1).trim();
        
        // Check if it contains a markdown link [text](url)
        const linkMatch = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch && linkMatch[1] && linkMatch[2]) {
          const title = linkMatch[1].trim();
          const url = linkMatch[2].trim();
          const type = inferReferenceType(url, title);
          
          references.push({
            title,
            url,
            type
          });
        } else {
          // Check if it contains a URL
          const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
          if (urlMatch && urlMatch[1]) {
            const url = urlMatch[1];
            const title = content.replace(url, '').trim();
            const type = inferReferenceType(url, title);
            
            references.push({
              title: title || 'Reference',
              url,
              type
            });
          } else {
            // Just text content
            const type = inferReferenceType('', content);
            references.push({
              title: content,
              type
            });
          }
        }
      }
    }
  }
  
  return references;
}

/**
 * Infer the type of reference based on URL and title
 * @param url - The reference URL
 * @param title - The reference title
 * @returns The inferred reference type
 */
function inferReferenceType(url: string, title: string): string | undefined {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();
  
  // Video references
  if (lowerUrl.includes('b23.tv') || lowerUrl.includes('youtube.com') || lowerUrl.includes('bilibili.com') || 
      lowerTitle.includes('视频') || lowerTitle.includes('video')) {
    return 'video';
  }
  
  // Article references
  if (lowerUrl.includes('blog') || lowerUrl.includes('article') || lowerUrl.includes('post') ||
      lowerTitle.includes('文章') || lowerTitle.includes('blog') || lowerTitle.includes('article')) {
    return 'article';
  }
  
  // Book references
  if (lowerTitle.includes('书') || lowerTitle.includes('book') || lowerTitle.includes('教材')) {
    return 'book';
  }
  
  // Technique references
  if (lowerTitle.includes('技巧') || lowerTitle.includes('technique') || lowerTitle.includes('方法') ||
      lowerTitle.includes('传统') || lowerTitle.includes('传统')) {
    return 'technique';
  }
  
  // Website references
  if (url && (lowerUrl.includes('http') || lowerUrl.includes('www'))) {
    return 'website';
  }
  
  return undefined;
}

/**
 * Extract references with enhanced metadata
 * @param content - The recipe content
 * @returns Array of reference objects with enhanced metadata
 */
export function extractReferencesWithMetadata(content: string): Array<{
  title: string;
  url?: string;
  description?: string;
  type?: string;
  domain?: string;
  isExternal: boolean;
}> {
  const basicReferences = extractReferences(content);
  
  return basicReferences.map(ref => {
    const domain = ref.url ? extractDomain(ref.url) : undefined;
    const isExternal = ref.url ? isExternalLink(ref.url) : false;
    
    return {
      ...ref,
      domain,
      isExternal
    };
  });
}

/**
 * Extract domain from URL
 * @param url - The URL to extract domain from
 * @returns The extracted domain
 */
function extractDomain(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return undefined;
  }
}

/**
 * Check if a URL is an external link
 * @param url - The URL to check
 * @returns True if the URL is external
 */
function isExternalLink(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== 'localhost' && !urlObj.hostname.includes('127.0.0.1');
  } catch {
    return false;
  }
}
