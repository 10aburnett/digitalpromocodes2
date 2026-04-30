/**
 * SEO Parser Utility
 * Parses SEO settings from hidden HTML comment block in content field.
 * Zero database changes required.
 */

import { SeoSettings, DEFAULT_SEO_SETTINGS } from '@/types/seo';

const SEO_BLOCK_REGEX = /^<!--SEO\n([\s\S]*?)\n-->\n?/;

/**
 * Parse content field and extract SEO settings
 * Returns clean content (without SEO block) and settings
 */
export function parseContentWithSeo(rawContent: string | null): {
  seoSettings: SeoSettings;
  content: string;
} {
  if (!rawContent) {
    return { seoSettings: { ...DEFAULT_SEO_SETTINGS }, content: '' };
  }

  const match = rawContent.match(SEO_BLOCK_REGEX);

  if (match) {
    try {
      const seoJson = match[1];
      const parsedSeo = JSON.parse(seoJson);
      // Merge with defaults to ensure all fields exist
      const seoSettings = { ...DEFAULT_SEO_SETTINGS, ...parsedSeo };
      const content = rawContent.replace(match[0], '');
      return { seoSettings, content };
    } catch (e) {
      // If JSON parsing fails, return defaults and full content
      console.error('Failed to parse SEO block:', e);
      return { seoSettings: { ...DEFAULT_SEO_SETTINGS }, content: rawContent };
    }
  }

  // No SEO block found - return defaults
  return { seoSettings: { ...DEFAULT_SEO_SETTINGS }, content: rawContent };
}

/**
 * Serialize SEO settings and content back into single string
 */
export function serializeContentWithSeo(
  seoSettings: SeoSettings,
  content: string
): string {
  const seoBlock = `<!--SEO\n${JSON.stringify(seoSettings, null, 2)}\n-->\n`;
  return seoBlock + content;
}

/**
 * Check if content has SEO block (for migration detection)
 */
export function hasSeoBlock(content: string | null): boolean {
  if (!content) return false;
  return SEO_BLOCK_REGEX.test(content);
}

/**
 * Generate computed SEO values with fallbacks
 */
export function getComputedSeo(
  seoSettings: SeoSettings,
  post: { title: string; excerpt: string | null; slug: string }
) {
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoppromocodes.com';

  return {
    title: seoSettings.seoTitle || `${post.title} - WhopPromoCodes Blog`,
    description: seoSettings.seoDescription || post.excerpt || '',
    canonical: seoSettings.canonicalUrl || `${siteOrigin}/blog/${post.slug}`,
    ogTitle: seoSettings.ogTitle || seoSettings.seoTitle || post.title,
    ogDescription: seoSettings.ogDescription || seoSettings.seoDescription || post.excerpt || '',
    ogImage: seoSettings.featuredImage || '/og.png',
    robots: `${seoSettings.noIndex ? 'noindex' : 'index'}, ${seoSettings.noFollow ? 'nofollow' : 'follow'}`,
  };
}

/**
 * Strip SEO block from content for display purposes
 * Use this when you need clean content without parsing settings
 */
export function stripSeoBlock(content: string | null): string {
  if (!content) return '';
  return content.replace(SEO_BLOCK_REGEX, '');
}
