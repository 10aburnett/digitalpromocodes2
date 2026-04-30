import { Metadata } from 'next';
import Link from 'next/link';
import { siteOrigin } from '@/lib/site-origin';
import { SITE_BRAND } from '@/lib/brand';

// Static generation with long cache - content rarely changes
export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  title: 'How to Redeem a Whop Promo Code | Step-by-Step Guide',
  description: 'Learn how to apply a promo code on Whop checkout. Our step-by-step guide covers finding the coupon field, entering your code, and troubleshooting common issues.',
  alternates: {
    canonical: `${siteOrigin()}/how-to-redeem`,
  },
  openGraph: {
    title: 'How to Redeem a Whop Promo Code | Step-by-Step Guide',
    description: 'Learn how to apply a promo code on Whop checkout. Our step-by-step guide covers finding the coupon field, entering your code, and troubleshooting common issues.',
    type: 'article',
    url: `${siteOrigin()}/how-to-redeem`,
  },
};

// HowTo JSON-LD Schema for this page
function HowToPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Redeem a Whop Promo Code",
    "description": "A complete guide to applying promo codes and coupons on Whop checkout for digital products, courses, and memberships.",
    "image": `${siteOrigin()}/images/howto/whop-ui-map-2025-09.png`,
    "totalTime": "PT2M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Open the checkout page",
        "text": "Navigate to the Whop product or membership you want to purchase and proceed to the checkout page. Your chosen tier and pricing will be displayed on the right-hand side."
      },
      {
        "@type": "HowToStep",
        "name": "Locate the coupon field",
        "text": "Look for the 'Add coupon' or 'Have a code?' link near the order summary. If a code is auto-filled from a browser extension, remove it first to enter your preferred discount."
      },
      {
        "@type": "HowToStep",
        "name": "Enter your promo code",
        "text": "Type or paste your promo code exactly as provided. Whop codes are typically case-insensitive, but avoid extra spaces. Click apply and verify the total updates."
      },
      {
        "@type": "HowToStep",
        "name": "Troubleshoot if needed",
        "text": "If the discount doesn't apply, the code may be for a different billing cycle, tier, or customer type. Try switching plans or using incognito mode if browser extensions interfere."
      },
      {
        "@type": "HowToStep",
        "name": "Check trial and renewal terms",
        "text": "For products with trials, the discount typically applies to the first paid period. Review the renewal line in the summary to confirm amounts and dates."
      },
      {
        "@type": "HowToStep",
        "name": "Complete your purchase",
        "text": "Finish payment to unlock your access. For Discord-based products, use 'Manage → Connect Discord' in your Whop Library to activate permissions."
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function HowToRedeemPage() {
  return (
    <main
      className="min-h-screen py-12 transition-theme"
      style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
    >
      <HowToPageSchema />

      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span style={{ color: 'var(--text-color)' }}>How to Redeem</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
            How to Redeem a Whop Promo Code
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Whop uses a unified checkout layout, so applying a promo code is quick and straightforward.
            Follow these steps to ensure your discount is applied correctly.
          </p>
        </header>

        {/* Main Steps */}
        <article
          className="rounded-3xl border p-6 sm:p-8 mb-8 transition-theme"
          style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
        >
          <div className="space-y-6">
            {/* Step 1 */}
            <section className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              >
                1
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Open the checkout page for the product or plan you want
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Whop displays your chosen tier on the right-hand side, along with the price and billing period.
                  Make sure you&apos;ve selected the correct plan before proceeding.
                </p>
              </div>
            </section>

            {/* Step 2 */}
            <section className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              >
                2
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Locate the &quot;Add coupon&quot; or &quot;Have a code?&quot; link
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  This appears next to the order summary. If a code is auto-filled from a previous session
                  or browser extension, remove it first so you can add your preferred discount manually.
                </p>
              </div>
            </section>

            {/* Step 3 */}
            <section className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              >
                3
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Enter your promo code exactly as provided
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Whop normally accepts codes regardless of capitalisation, but avoid spaces or autofill errors.
                  After applying the code, the total should update immediately.
                </p>
              </div>
            </section>

            {/* Step 4 */}
            <section className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              >
                4
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  If the price doesn&apos;t change
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  The code may only apply to a different billing cycle, one-time purchase, or new-customer plan.
                  Switching the tier or removing and re-adding the code usually resolves this.
                </p>
              </div>
            </section>

            {/* Step 5 */}
            <section className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              >
                5
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Trials and renewals
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  When a trial is available, the discount commonly applies to the first paid period.
                  Check the renewal line in the summary to confirm the exact amount and date.
                </p>
              </div>
            </section>

            {/* Step 6 */}
            <section className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              >
                6
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Browser tools and extensions
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Some coupon extensions or aggressive autofill scripts can override the input field.
                  If your code refuses to apply, try incognito mode or temporarily disabling extensions.
                </p>
              </div>
            </section>

            {/* Step 7 */}
            <section className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
              >
                7
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  After completing your order
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Your access will appear in your Whop Library. For Discord-based products,
                  use &quot;Manage → Connect Discord&quot; to activate permissions.
                </p>
              </div>
            </section>
          </div>

          <p
            className="mt-8 text-sm italic"
            style={{ color: 'var(--text-muted)' }}
          >
            These steps reflect the most common Whop checkout behaviour. Minor interface variations
            exist depending on the seller.
          </p>
        </article>

        {/* CTA Section */}
        <section
          className="rounded-3xl border p-6 sm:p-8 text-center transition-theme"
          style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
        >
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-color)' }}>
            Ready to save?
          </h2>
          <p className="mb-5" style={{ color: 'var(--text-secondary)' }}>
            Browse our collection of verified Whop promo codes for courses, memberships, and digital products.
          </p>
          <Link
            href="/offers"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:shadow-md"
            style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
          >
            Browse All Offers
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* Back Link */}
        <nav className="mt-8" aria-label="Back navigation">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent-color)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to home
          </Link>
        </nav>
      </div>
    </main>
  );
}
