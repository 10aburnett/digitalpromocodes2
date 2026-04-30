// @ts-nocheck
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedBlogPosts, type BlogListItem } from '@/lib/blog'
import { siteOrigin } from '@/lib/site-origin'
import { SITE_BRAND, SITE_AUTHOR } from '@/lib/brand'

// TypeScript safety: allow optional fields without altering Prisma
type BlogListItemWithDates = BlogListItem & {
  updatedAt?: Date | null;
  authorName?: string | null;
  author?: { name?: string | null } | null;
};

// SSG + ISR configuration
export const dynamic = 'force-static'
export const revalidate = 3600 // 1 hour
export const fetchCache = 'force-cache'
export const runtime = 'nodejs' // Required for Prisma

const currentYear = new Date().getFullYear()

// NOTE: Blog hub is intentionally noindex during launch phase.
// Do not make indexable or add to sitemap without explicit SEO review.
// This prevents topical dilution and crawl surface expansion during trust-building.
export const metadata: Metadata = {
  title: `${SITE_BRAND} Blog - Reviews, Guides & Product Analysis ${currentYear}`,
  description: `Read in-depth coverage of digital tools, software platforms, and online services. Practical breakdowns and independent reviews updated for ${currentYear}.`,
  keywords: `articles, reviews ${currentYear}, software analysis, digital tools, online services, product guides, technology insights`,
  alternates: {
// PHASE1-DEINDEX:     canonical: `${siteOrigin()}/blog`
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: `${SITE_BRAND} Blog - Software Reviews & Digital Product Analysis ${currentYear}`,
    description: `Browse detailed guides on digital products and services. Independent analysis of tools, platforms, and online communities for ${currentYear}.`,
    type: 'website',
    url: `${siteOrigin()}/blog`
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_BRAND} Blog - Digital Product Reviews ${currentYear}`,
    description: `Coverage of software, online tools, and digital services. Analysis and guides to help you make informed decisions in ${currentYear}.`
  }
}

export default async function BlogPage() {
  try {
    const posts = await getPublishedBlogPosts();

    if (!posts.length) {
      return (
        <div className="min-h-screen py-8 transition-theme" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
          <div className="mx-auto w-[90%] md:w-[95%] max-w-[1200px]">
            <div className="space-y-6">
              {/* Two-column hero layout */}
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-8 items-start mb-10">
                <div>
                  <p className="text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: 'var(--accent-color)' }}>
                    Digital Promo Codes Blog
                  </p>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)', lineHeight: 1.2 }}>
                    Guides, updates & playbooks for smarter Whop spending.
                  </h1>
                  <p className="text-sm md:text-base max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                    Long-form guides and analysis on Whop products, online communities and promo tactics from the team behind Digital Promo Codes.
                  </p>
                </div>

                <aside
                  className="rounded-2xl border p-5 md:p-6 shadow-sm"
                  style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                    Stay ahead of new Whop offers
                  </h2>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Occasional roundups of new Whop products, notable promo codes and strategy breakdowns. No clutter or spam.
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    New posts are usually published a few times each month.
                  </p>
                </aside>
              </div>

              {/* Empty state card */}
              <div className="flex justify-center py-16">
                <div
                  className="max-w-md text-center rounded-2xl border p-8"
                  style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full"
                       style={{ backgroundColor: 'rgba(8,145,178,0.12)', color: 'var(--accent-color)' }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                    There are no published posts yet
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    We&apos;re currently preparing in-depth guides and examples. Check back soon for new posts.
                  </p>
                </div>
              </div>

              {/* Contextual CTA */}
              <div
                className="mt-10 p-6 rounded-xl border text-center"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-secondary)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Ready to save on your next purchase? Browse our{' '}
                  <Link href="/offers" className="font-medium underline" style={{ color: 'var(--accent-color)' }}>
                    verified promo codes
                  </Link>
                  {' '}or{' '}
                  <Link href="/submit" className="font-medium underline" style={{ color: 'var(--accent-color)' }}>
                    submit your own code
                  </Link>
                  {' '}to help others save.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const origin = siteOrigin();

    // Build JSON-LD CollectionPage schema for SEO
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${SITE_BRAND} Blog`,
      description: `Latest posts and guides on deals and digital products in ${currentYear}.`,
      url: `${origin}/blog`,
      hasPart: (posts as BlogListItemWithDates[]).slice(0, 20).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        datePublished: p.publishedAt?.toISOString?.() ?? undefined,
        dateModified: (p.updatedAt ?? p.publishedAt)?.toISOString?.() ?? undefined,
        url: `${origin}/blog/${p.slug}`,
        image: `${origin}/og.png`,
        author: {
          '@type': 'Person',
          name: (p as any).User?.name || (p as any).authorName || SITE_AUTHOR
        }
      })),
    };

    return (
      <div className="min-h-screen py-8 transition-theme" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
        {/* Server-rendered JSON-LD for blog collection */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1200px]">
          <div className="space-y-8">
            {/* Two-column hero layout */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-8 items-start mb-10">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: 'var(--accent-color)' }}>
                  Digital Promo Codes Blog
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)', lineHeight: 1.2 }}>
                  Guides, updates & playbooks for smarter Whop spending.
                </h1>
                <p className="text-sm md:text-base max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Long-form guides and analysis on Whop products, online communities and promo tactics from the team behind Digital Promo Codes.
                </p>
              </div>

              <aside
                className="rounded-2xl border p-5 md:p-6 shadow-sm"
                style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Stay ahead of new Whop offers
                </h2>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Occasional roundups of new Whop products, notable promo codes and strategy breakdowns. No clutter or spam.
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  New posts are usually published a few times each month.
                </p>
              </aside>
            </div>

            {/* Blog posts grid - 2-column editorial layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-8">
              {(posts as BlogListItemWithDates[]).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article
                    className="group relative h-full overflow-hidden rounded-2xl border bg-[color:var(--card-bg)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: 'var(--card-border)', boxShadow: 'var(--promo-shadow)' }}
                  >
                    {/* Left accent strip */}
                    <div
                      className="absolute inset-y-0 left-0 w-1"
                      style={{
                        background: 'linear-gradient(to bottom, var(--accent-color), transparent)',
                      }}
                    />

                    <div className="flex h-full flex-col gap-4 px-5 py-5 md:px-6 md:py-6 pl-7">
                      {/* Meta row */}
                      <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wide"
                           style={{ color: 'var(--text-muted)' }}>
                        <time>
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : ''}
                        </time>

                        <span className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                              style={{
                                borderColor: 'rgba(148,163,184,0.45)',
                                backgroundColor: 'rgba(15,23,42,0.02)',
                                color: 'var(--text-secondary)',
                              }}>
                          {post.pinned ? 'Editor pick' : 'Deep-dive'}
                        </span>
                      </div>

                      {/* Title + excerpt */}
                      <div className="space-y-2">
                        <h2
                          className="text-lg md:text-xl font-semibold leading-snug group-hover:text-[color:var(--accent-color)] transition-colors"
                          style={{ color: 'var(--text-color)' }}
                        >
                          {post.title}
                        </h2>

                        {post.excerpt && (
                          <p className="text-sm leading-relaxed line-clamp-3"
                             style={{ color: 'var(--text-secondary)' }}>
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Footer: author + CTA chip */}
                      <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t"
                           style={{ borderColor: 'var(--border-color)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {(post.authorName ?? post.author?.name) || 'Digital Promo Codes team'}
                        </span>

                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium group-hover:border-[color:var(--accent-color)] group-hover:text-[color:var(--accent-color)] transition-colors"
                          style={{ borderColor: 'rgba(148,163,184,0.6)', color: 'var(--text-secondary)' }}
                        >
                          View breakdown
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.7}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="M13 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Contextual CTA */}
            <div
              className="mt-10 p-6 rounded-xl border text-center"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-secondary)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Ready to save on your next purchase? Browse our{' '}
                <Link href="/offers" className="font-medium underline" style={{ color: 'var(--accent-color)' }}>
                  verified promo codes
                </Link>
                {' '}or{' '}
                <Link href="/submit" className="font-medium underline" style={{ color: 'var(--accent-color)' }}>
                  submit your own code
                </Link>
                {' '}to help others save.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Blog page load failed:', err);
    return (
      <div className="min-h-screen py-8 transition-theme" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1200px]">
          <div className="space-y-6">
            {/* Two-column hero layout (error state) */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-8 items-start mb-10">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase mb-2" style={{ color: 'var(--accent-color)' }}>
                  Digital Promo Codes Blog
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)', lineHeight: 1.2 }}>
                  Guides, updates & playbooks for smarter Whop spending.
                </h1>
                <p className="text-sm md:text-base max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Long-form guides and analysis on Whop products, online communities and promo tactics from the team behind Digital Promo Codes.
                </p>
              </div>

              <aside
                className="rounded-2xl border p-5 md:p-6 shadow-sm"
                style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Stay ahead of new Whop offers
                </h2>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Occasional roundups of new Whop products, notable promo codes and strategy breakdowns. No clutter or spam.
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  New posts are usually published a few times each month.
                </p>
              </aside>
            </div>

            {/* Error state card */}
            <div className="flex justify-center py-16">
              <div
                className="max-w-md text-center rounded-2xl border p-8"
                style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full"
                     style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', color: '#ef4444' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Blog posts could not be loaded
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  An issue occurred while retrieving blog content. Please refresh the page or try again shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}