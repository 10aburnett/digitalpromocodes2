// @ts-nocheck
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getBlogPostBySlug } from '@/lib/blog'
import BlogPostClient from '@/components/BlogPostClient'
import { generateArticleSchema, generateBreadcrumbSchema, calculateReadingTime, extractHeadings, processContentWithHeadingIds, optimizeInternalLinkingServer, optimizeImageAltText } from '@/lib/blog-utils'
import { siteOrigin } from '@/lib/site-origin'
import { SITE_BRAND, SITE_AUTHOR } from '@/lib/brand'
import { parseContentWithSeo, getComputedSeo } from '@/lib/seo-parser'
import { generateToc } from '@/lib/toc-generator'
import { SchemaMarkup } from '@/components/SchemaMarkup'

// SSG + ISR configuration
export const dynamic = 'force-static'
export const revalidate = 3600 // 1 hour
export const dynamicParams = true // Enable ISR for new posts
export const fetchCache = 'force-cache'
export const runtime = 'nodejs' // Required for Prisma

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  publishedAt: string | null
  updatedAt: string | null
  slug: string
  authorName: string | null
  author: {
    name: string
  }
}

// Prebuild all published blog posts at build time
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true }
  });

  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: {
        title: true,
        excerpt: true,
        content: true,
        published: true,
        updatedAt: true,
        publishedAt: true,
        slug: true,
        authorName: true,
        User: { select: { name: true } }
      }
    });

    if (!post || !post.published) {
      return {
        title: `Article not available - ${SITE_BRAND}`,
        description: 'This article is not currently available. Browse other content on Digital Promo Codes.',
        robots: { index: false, follow: true }
      }
    }

    // Parse SEO settings from content
    const { seoSettings } = parseContentWithSeo(post.content);
    const computed = getComputedSeo(seoSettings, {
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
    });

    const publishedDate = post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined;
    const authorName = post.User?.name || post.authorName || SITE_AUTHOR;

    // Use SEO settings for robots - index by default unless explicitly set to noindex
    const shouldIndex = seoSettings.noIndex ? false : true;
    const shouldFollow = seoSettings.noFollow ? false : true;

    return {
      title: computed.title,
      description: computed.description,
      keywords: seoSettings.keywords || `${post.title}, software reviews, digital products, online tools, ${authorName}`,
      authors: [{ name: authorName }],
      alternates: {
        canonical: computed.canonical
      },
      robots: {
        index: shouldIndex,
        follow: shouldFollow,
      },
      openGraph: {
        title: computed.ogTitle,
        description: computed.ogDescription,
        type: 'article',
        url: computed.canonical,
        publishedTime: publishedDate,
        authors: [authorName],
        siteName: SITE_BRAND,
        images: seoSettings.featuredImage ? [{ url: seoSettings.featuredImage }] : undefined,
      },
      twitter: {
        card: seoSettings.twitterCard,
        title: computed.ogTitle,
        description: computed.ogDescription,
        images: seoSettings.featuredImage ? [seoSettings.featuredImage] : undefined,
      }
    }
  } catch (error) {
    console.error('Error generating blog post metadata:', error)
    return {
      title: `Article - ${SITE_BRAND}`,
      description: 'Read coverage of digital tools, software platforms and online services. Practical guides and independent analysis.'
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Guard: Only serve published posts
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: { User: { select: { name: true } } },
  });

  if (!post || !post.published) {
    return notFound();
  }

  const authorName = post.User?.name || post.authorName || SITE_AUTHOR;

  // Parse SEO settings from content
  const { seoSettings, content: cleanContent } = parseContentWithSeo(post.content);

  // Breadcrumb schema (always include)
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${siteOrigin()}/blog/${post.slug}#dpc-breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Homepage',
        item: siteOrigin()
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteOrigin()}/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteOrigin()}/blog/${post.slug}`
      }
    ]
  }

  // Get all blog posts for internal linking optimization
  const allPosts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { id: true, title: true, slug: true }
  })

  // Process content with all optimizations (using clean content without SEO block)
  let optimizedContent = cleanContent

  // 1. Optimize image alt text
  optimizedContent = optimizeImageAltText(optimizedContent, post.title)

  // 2. Add internal links to other blog posts
  optimizedContent = await optimizeInternalLinkingServer(optimizedContent, post.id, allPosts)

  // 3. Add heading IDs for anchor links (sidebar TOC handles display, no inline injection)
  if (seoSettings.autoToc) {
    const { contentWithIds } = generateToc(optimizedContent, {
      includeH3: seoSettings.tocIncludeH3,
    });
    optimizedContent = contentWithIds; // Content now has IDs (no inline TOC injection - sidebar handles it)
  } else {
    // Still add heading IDs for anchor links even without TOC
    optimizedContent = processContentWithHeadingIds(optimizedContent);
  }

  const processedPost = {
    ...post,
    content: optimizedContent,
    readingTime: calculateReadingTime(cleanContent),
    headings: extractHeadings(optimizedContent)
  }

  return (
    <>
      {/* Schema Markup from SEO settings */}
      <SchemaMarkup
        seoSettings={seoSettings}
        post={{
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          authorName,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
        }}
      />

      {/* Server-rendered Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Pass the processed post data to the client component */}
      <BlogPostClient post={processedPost} />

      {/* SSR Contextual CTA - Natural internal links for SEO */}
      <div className="mx-auto w-[90%] md:w-[94%] max-w-[1100px] pb-12">
        <div
          className="p-6 rounded-xl border text-center"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-secondary)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Looking for discounts on Whop products? Browse our{' '}
            <Link href="/offers" className="font-medium underline" style={{ color: 'var(--accent-color)' }}>
              latest promo codes
            </Link>
            {' '}or{' '}
            <Link href="/submit" className="font-medium underline" style={{ color: 'var(--accent-color)' }}>
              submit your own code
            </Link>
            {' '}to get featured.
          </p>
        </div>
      </div>
    </>
  )
}