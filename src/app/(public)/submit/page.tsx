import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import PromoCodeSubmissionForm from '@/components/PromoCodeSubmissionForm';

// Static generation - form shell is static, submission is dynamic
export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  title: 'Submit Your Whop Promo Code | Get Your Discount Featured',
  description: 'Share your Whop promo code with thousands of deal-seekers. Free submission, fast review, and instant exposure for creators in trading, sports betting, and reselling niches.',
  keywords: [
    'submit promo code',
    'share discount code',
    'whop promo code submission',
    'promote whop product',
    'submit coupon code',
    'whop creator promotion',
    'share whop discount',
    'get promo code featured',
    'whop affiliate promotion',
    'digital product promo code',
  ],
  openGraph: {
    title: 'Submit Your Whop Promo Code | Get Your Discount Featured',
    description: 'Share your Whop promo code with thousands of deal-seekers. Free submission, fast review, and instant exposure.',
    type: 'website',
    url: 'https://digitalpromocodes.com/submit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit Your Whop Promo Code | Digital Promo Codes',
    description: 'Share your Whop discount with thousands of buyers actively looking for deals.',
  },
  alternates: {
    canonical: '/submit',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Schema.org structured data for the page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Submit Your Whop Promo Code',
  description: 'Share your Whop promo code with thousands of deal-seekers. Free submission for creators.',
  url: 'https://digitalpromocodes.com/submit',
  mainEntity: {
    '@type': 'Service',
    name: 'Promo Code Submission',
    description: 'Free promo code listing service for Whop creators',
    provider: {
      '@type': 'Organization',
      name: 'Digital Promo Codes',
      url: 'https://digitalpromocodes.com',
    },
    areaServed: 'Worldwide',
    serviceType: 'Promotional Code Distribution',
  },
};

export default function SubmitCodePage() {
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        className="min-h-screen pt-4 transition-theme"
        style={{ backgroundColor: 'var(--background-color)' }}
      >
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Hero Section - SSR */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'var(--text-color)' }}
            >
              Submit Your Whop Promo Code
            </h1>
            <p
              className="text-base md:text-lg mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Get your Whop discount in front of thousands of buyers actively searching for deals.
              Free to submit, fast review, maximum exposure.
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Join 100+ creators already sharing their codes with our community
            </p>
          </div>

          {/* Benefits Section - SSR */}
          <div className="max-w-4xl mx-auto mb-14">
            <h2
              className="text-xl font-bold text-center mb-6"
              style={{ color: 'var(--text-color)' }}
            >
              Why Share Your Whop Promo Code With Us?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Benefit 1 - Instant Exposure */}
              <div
                className="p-6 rounded-xl border"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-color)' }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: 'var(--accent-color)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-color)' }}
                >
                  Instant Exposure
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your promo code gets seen by thousands of buyers actively searching for Whop discounts every month.
                </p>
              </div>

              {/* Benefit 2 - 100% Free */}
              <div
                className="p-6 rounded-xl border"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-color)' }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: 'var(--accent-color)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-color)' }}
                >
                  100% Free
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No fees, no catches. We list your promo code completely free. You keep all your earnings.
                </p>
              </div>

              {/* Benefit 3 - Fast Review */}
              <div
                className="p-6 rounded-xl border"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-color)' }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: 'var(--accent-color)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-color)' }}
                >
                  Fast Review
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  We review submissions quickly. Most codes go live within 24-48 hours of submission.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works Section - SSR */}
          <div className="max-w-3xl mx-auto mb-14">
            <h2
              className="text-xl font-bold text-center mb-6"
              style={{ color: 'var(--text-color)' }}
            >
              How It Works
            </h2>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  1
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Submit Your Code
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Fill out the form below with your promo code, the Whop product it applies to, and the discount details.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  2
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: 'var(--text-color)' }}
                  >
                    We Verify & Publish
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Our team verifies the code works and publishes it to our site, complete with your product details.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  3
                </div>
                <div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Get More Sales
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Buyers discover your code, use it at checkout, and you earn from every conversion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div id="form" className="max-w-2xl mx-auto mb-14 scroll-mt-4">
            <h2
              className="text-xl font-bold text-center mb-4"
              style={{ color: 'var(--text-color)' }}
            >
              Submit Your Whop Promo Code Now
            </h2>
            {/* Suspense boundary required for useSearchParams in client component */}
            <Suspense fallback={<div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading form...</div>}>
              <PromoCodeSubmissionForm inline />
            </Suspense>
          </div>

          {/* FAQ Section - SSR (great for SEO) */}
          <div className="max-w-3xl mx-auto mb-14">
            <h2
              className="text-xl font-bold text-center mb-6"
              style={{ color: 'var(--text-color)' }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div
                className="p-6 rounded-xl border"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-color)' }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: 'var(--text-color)' }}
                >
                  What types of promo codes can I submit?
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  We accept promo codes for any Whop product including trading communities, sports betting groups,
                  reselling memberships, courses, and other digital products. The code must provide a genuine discount.
                </p>
              </div>

              <div
                className="p-6 rounded-xl border"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-color)' }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: 'var(--text-color)' }}
                >
                  How long does review take?
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Most submissions are reviewed within 24-48 hours. We verify that the code works and
                  the product details are accurate before publishing.
                </p>
              </div>

              <div
                className="p-6 rounded-xl border"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-color)' }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: 'var(--text-color)' }}
                >
                  Is there a cost to submit?
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No, submitting your promo code is completely free. We don't charge creators anything
                  to list their discounts on our site.
                </p>
              </div>

              <div
                className="p-6 rounded-xl border"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background-color)' }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: 'var(--text-color)' }}
                >
                  Can I update my code later?
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Yes! Just <Link href="/contact" className="underline font-medium" style={{ color: 'var(--accent-color)' }}>contact us</Link> with
                  your code details and we'll make the updates within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA - SSR */}
          <div className="max-w-2xl mx-auto text-center">
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              Have questions before submitting?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
              }}
            >
              Contact
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
