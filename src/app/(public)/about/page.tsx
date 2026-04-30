import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { siteOrigin } from '@/lib/site-origin';
import { SITE_BRAND, SITE_DESCRIPTION } from '@/lib/brand';

// SSG configuration
export const dynamic = 'force-static'
export const fetchCache = 'force-cache'
export const revalidate = 86400 // 24h

const title = `About ${SITE_BRAND} – How We Catalogue Digital Product Offers`;
const description = `Learn how ${SITE_BRAND} collects, checks and organises promotional codes for software, online courses, and membership platforms.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: 'about, promo codes, digital products, software discounts, affiliate disclosure, offer verification',
  alternates: {
    canonical: 'https://digitalpromocodes.com/about',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    }
  },
  openGraph: {
    title,
    description,
    url: `${siteOrigin()}/about`,
    type: 'website',
    siteName: SITE_BRAND,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function AboutPage() {
  const origin = siteOrigin();

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${origin}#dpc-org`,
            name: SITE_BRAND,
            url: origin,
            logo: `${origin}/logo.svg`,
            description: "A directory platform that catalogues promotional codes and pricing for digital tools and services.",
            contactPoint: { "@type": "ContactPoint", contactType: "customer support", url: `${origin}/contact` }
          })
        }}
      />

      <div className="min-h-screen py-16 transition-theme" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1100px]">

          {/* Left-aligned Hero */}
          <header className="mb-16">
            <span
              className="inline-block text-xs font-medium tracking-wider uppercase px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: 'rgba(22, 101, 52, 0.08)', color: 'var(--accent-color)' }}
            >
              About this platform
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
              A structured way to find Whop discounts
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              We track promotional deals for software, online courses, and membership communities, presenting clear pricing information and straightforward affiliate disclosures.
            </p>
          </header>

          {/* Two-column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 mb-20">

            {/* LEFT: Mission Narrative */}
            <div className="space-y-8">
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Locating reliable discounts for Whop products often takes longer than it should. Codes lapse, conditions are revised, and many deal pages are never updated. {SITE_BRAND} exists to reduce that friction.
              </p>

              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We maintain a large catalogue of current Whop offers. Each entry is designed to show the live price, any available reduction, and a concise overview of the product or service behind the code.
              </p>

              {/* Horizontal Mission Banner */}
              <div
                className="flex items-center gap-4 py-5 px-6 mt-8"
                style={{ backgroundColor: 'var(--background-secondary)' }}
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>What we focus on</span>
                  <p className="text-base font-medium" style={{ color: 'var(--text-color)' }}>
                    Improve the clarity and accessibility of pricing for digital products.
                  </p>
                </div>
              </div>

              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We work as independent affiliates. If you choose to buy through links on this site, we may receive a commission, but the amount you pay does not change. This revenue helps cover operating costs and ongoing review of the offers we list.
              </p>
            </div>

            {/* RIGHT: Stats & Values Rail */}
            <aside className="space-y-6">
              <div className="py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Catalogue size</span>
                </div>
                <p className="text-2xl font-semibold" style={{ color: 'var(--text-color)' }}>Over 100 entries</p>
              </div>

              <div className="py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Refresh cycle</span>
                </div>
                <p className="text-2xl font-semibold" style={{ color: 'var(--text-color)' }}>Regular offer checks</p>
              </div>

              <div className="py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Code review</span>
                </div>
                <p className="text-2xl font-semibold" style={{ color: 'var(--text-color)' }}>Manually screened codes</p>
              </div>

              <div className="py-4">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Affiliate disclosure</span>
                </div>
                <p className="text-2xl font-semibold" style={{ color: 'var(--text-color)' }}>Upfront commission notes</p>
              </div>
            </aside>
          </div>

          {/* Numbered Timeline: What Sets Us Apart */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-8" style={{ color: 'var(--text-color)' }}>
              How the site works
            </h2>

            <div className="relative pl-8">
              {/* Vertical line */}
              <div
                className="absolute left-[11px] top-2 bottom-2 w-px"
                style={{ backgroundColor: 'var(--border-color)' }}
              />

              <div className="space-y-8">
                {/* Item 1 */}
                <div className="relative">
                  <div
                    className="absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                  >
                    1
                  </div>
                  <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text-color)' }}>
                    Collecting relevant offers
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    We source promo codes directly from product creators, course providers, and community managers, as well as from user submissions.
                  </p>
                </div>

                {/* Item 2 */}
                <div className="relative">
                  <div
                    className="absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                  >
                    2
                  </div>
                  <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text-color)' }}>
                    Ongoing validation
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    We routinely test codes and compare listed prices with live product pages, removing entries that are no longer valid or accurate.
                  </p>
                </div>

                {/* Item 3 */}
                <div className="relative">
                  <div
                    className="absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                  >
                    3
                  </div>
                  <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text-color)' }}>
                    Clear offer summaries
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Each listing is structured to show what the product does, what it costs at the time of review, and whether an affiliate relationship is in place.
                  </p>
                </div>

                {/* Item 4 */}
                <div className="relative">
                  <div
                    className="absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
                  >
                    4
                  </div>
                  <h3 className="text-base font-medium mb-1" style={{ color: 'var(--text-color)' }}>
                    Community input
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Visitors can propose new promo codes they find elsewhere; submissions are checked before being added to the public catalogue.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mb-12 p-6 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)', borderLeft: '4px solid var(--accent-color)' }}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
              Disclaimer
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {SITE_BRAND} is an independent project and is <strong>not officially affiliated with, endorsed by, or sponsored by Whop Inc.</strong> or any of its subsidiaries. &quot;Whop&quot; is a trademark of Whop Inc. We are an independent affiliate directory that aggregates publicly available promo codes and offers for products sold on the Whop marketplace. All product names, logos, and brands are property of their respective owners.
            </p>
          </section>

          {/* Footer Links */}
          <footer className="pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Have a question about how we list or review offers? Let us know.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/contact"
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-color)' }}
              >
                Get in touch <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-color)' }}
              >
                View blog <span aria-hidden="true">→</span>
              </Link>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
