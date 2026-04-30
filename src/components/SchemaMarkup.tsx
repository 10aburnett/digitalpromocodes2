/**
 * Schema Markup Component for Blog Posts
 * Renders JSON-LD structured data based on SEO settings
 */

import { SeoSettings } from '@/types/seo';
import { siteOrigin } from '@/lib/site-origin';
import { SITE_BRAND } from '@/lib/brand';

interface Props {
  seoSettings: SeoSettings;
  post: {
    title: string;
    excerpt: string | null;
    slug: string;
    authorName: string | null;
    publishedAt: Date | null;
    updatedAt: Date | null;
  };
}

export function SchemaMarkup({ seoSettings, post }: Props) {
  const origin = siteOrigin();

  // Use custom schema if enabled
  if (seoSettings.useCustomSchema && seoSettings.customSchema) {
    try {
      // Validate JSON before rendering
      JSON.parse(seoSettings.customSchema);
      return (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seoSettings.customSchema }}
        />
      );
    } catch {
      // Fall through to auto-generated if custom schema is invalid
    }
  }

  const authorName = post.authorName || `${SITE_BRAND} Team`;

  // Auto-generate BlogPosting schema
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${origin}/blog/${post.slug}#article`,
    headline: post.title,
    description: seoSettings.seoDescription || post.excerpt || undefined,
    datePublished: post.publishedAt?.toISOString?.() || undefined,
    dateModified: post.updatedAt?.toISOString?.() || undefined,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND,
      url: origin,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${origin}/blog/${post.slug}`,
    },
    ...(seoSettings.featuredImage && {
      image: seoSettings.featuredImage,
    }),
  };

  // FAQ schema if present
  const faqSchema =
    seoSettings.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          '@id': `${origin}/blog/${post.slug}#faq`,
          mainEntity: seoSettings.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
