// SEO Settings Interface for Blog Posts
// Stored as JSON comment block in content field - zero DB changes

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SeoSettings {
  // Basic SEO
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  keywords: string | null;

  // Social/Open Graph
  ogTitle: string | null;
  ogDescription: string | null;
  featuredImage: string | null;
  twitterCard: 'summary_large_image' | 'summary';

  // Schema Markup
  faqs: FAQItem[];
  customSchema: string | null;
  useCustomSchema: boolean;

  // Advanced/Robots
  noIndex: boolean;
  noFollow: boolean;
  customHeadCode: string | null;

  // Table of Contents
  autoToc: boolean;
  tocIncludeH3: boolean;
  tocPosition: 'before_content' | 'after_intro';
}

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  seoTitle: null,
  seoDescription: null,
  canonicalUrl: null,
  keywords: null,
  ogTitle: null,
  ogDescription: null,
  featuredImage: null,
  twitterCard: 'summary_large_image',
  faqs: [],
  customSchema: null,
  useCustomSchema: false,
  noIndex: false,
  noFollow: false,
  customHeadCode: null,
  autoToc: true,
  tocIncludeH3: false,
  tocPosition: 'before_content',
};
