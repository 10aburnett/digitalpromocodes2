/**
 * Table of Contents Generator
 * Generates TOC from HTML content headings
 */

/**
 * Decode HTML entities to their actual characters
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

interface TocOptions {
  includeH3?: boolean;
}

interface TocResult {
  toc: string;
  contentWithIds: string;
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Slugify text for use as anchor ID
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract headings from content for preview in admin
 */
export function extractTocHeadings(content: string, includeH3: boolean = false): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const regex = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const existingId = match[2];
    const rawText = match[3].replace(/<[^>]*>/g, ''); // Strip inner tags
    const text = decodeHtmlEntities(rawText); // Decode HTML entities
    const id = existingId || slugify(text);

    if (level === 2 || (level === 3 && includeH3)) {
      headings.push({ id, text, level });
    }
  }

  return headings;
}

/**
 * Generate TOC HTML and add IDs to headings
 */
export function generateToc(content: string, options: TocOptions = {}): TocResult {
  const { includeH3 = false } = options;
  const headings: HeadingItem[] = [];

  // Add IDs to headings that don't have them
  const contentWithIds = content.replace(
    /<h([23])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attrs, text) => {
      const levelNum = parseInt(level);
      if (levelNum === 2 || (levelNum === 3 && includeH3)) {
        const rawText = text.replace(/<[^>]*>/g, '');
        const cleanText = decodeHtmlEntities(rawText); // Decode HTML entities
        const existingIdMatch = attrs.match(/id="([^"]*)"/);
        const existingId = existingIdMatch ? existingIdMatch[1] : null;
        const id = existingId || slugify(cleanText);

        headings.push({ id, text: cleanText, level: levelNum });

        if (!existingId) {
          return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
        }
      }
      return match;
    }
  );

  // Generate TOC HTML
  if (headings.length === 0) {
    return { toc: '', contentWithIds };
  }

  const tocItems = headings
    .map((h) => {
      const indent = h.level === 3 ? ' style="padding-left: 1rem;"' : '';
      return `<li${indent}><a href="#${h.id}">${h.text}</a></li>`;
    })
    .join('\n        ');

  const toc = `
    <nav class="toc" aria-label="Table of contents">
      <h3 class="toc-title">Contents</h3>
      <ol class="toc-list">
        ${tocItems}
      </ol>
    </nav>
  `;

  return { toc, contentWithIds };
}

/**
 * Inject TOC into content at specified position
 */
export function injectTocIntoContent(
  content: string,
  toc: string,
  position: 'before_content' | 'after_intro'
): string {
  if (!toc) return content;

  if (position === 'before_content') {
    return toc + content;
  }

  // After first paragraph
  const firstPEnd = content.indexOf('</p>');
  if (firstPEnd === -1) {
    return toc + content;
  }

  return content.slice(0, firstPEnd + 4) + toc + content.slice(firstPEnd + 4);
}
