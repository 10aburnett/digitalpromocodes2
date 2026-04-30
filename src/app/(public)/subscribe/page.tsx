import type { Metadata } from 'next'
import Link from 'next/link'
import SubscribeFormClient from '@/components/SubscribeFormClient'
import { SITE_BRAND } from '@/lib/brand'
import { siteOrigin } from '@/lib/site-origin'

// SSG configuration
export const dynamic = 'force-static'
export const revalidate = 86400 // 24h

const title = `Subscribe to ${SITE_BRAND} Newsletter | Get Promo Code Alerts`
const description = `Receive periodic emails featuring recently added promo codes, seasonal discounts, and useful buying guides. No spam, unsubscribe anytime.`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://digitalpromocodes.com/subscribe',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    url: `${siteOrigin()}/subscribe`,
    type: 'website',
    siteName: SITE_BRAND,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

const faqs = [
  {
    question: 'How often do you send emails?',
    answer: 'Typically once a week with a digest of new codes. During busy promotional seasons, you might see up to two or three emails per week.'
  },
  {
    question: 'Can I opt out later?',
    answer: 'Yes. Every email contains an unsubscribe link, or you can use the opt-out page on this site whenever you like.'
  },
  {
    question: 'Will my email be shared?',
    answer: "No. We never sell or share your address with third parties. It's used only for sending deal updates."
  }
]

export default function SubscribePage() {
  return (
    <div className="min-h-screen py-16 transition-theme" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
      <div className="mx-auto w-[90%] md:w-[95%] max-w-[640px]">

        {/* SSR Header */}
        <header className="mb-12">
          <span className="text-xs font-medium tracking-wider uppercase mb-3 block" style={{ color: 'var(--text-muted)' }}>
            Newsletter
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
            Stay informed on new deals
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Receive periodic emails featuring recently added promo codes, seasonal discounts, and useful buying guides.
          </p>
        </header>

        {/* SSR Benefits */}
        <div className="mb-12 space-y-4">
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center"
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Checked codes</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Every code is reviewed for accuracy before it reaches your inbox.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center"
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Timely alerts</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Hear about time-sensitive promotions while they&apos;re still active.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center"
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-color)' }}>Buying tips</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Occasional advice on getting more value from digital tools and courses.
              </p>
            </div>
          </div>
        </div>

        {/* Client-side Form */}
        <SubscribeFormClient />

        {/* SSR FAQ - Using native details/summary for no-JS accessibility */}
        <section>
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-color)' }}>
            Frequently asked
          </h2>

          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="border-b group"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <summary
                  className="w-full py-4 flex items-center justify-between text-left cursor-pointer list-none"
                  style={{ color: 'var(--text-color)' }}
                >
                  <span className="text-sm font-medium pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                    style={{ color: 'var(--text-muted)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="pb-4">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* SSR Footer Links */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already on the list?{' '}
            <Link
              href="/unsubscribe"
              className="hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-color)' }}
            >
              Manage your subscription
            </Link>
          </p>
          <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
            Can&apos;t wait? Browse{' '}
            <Link
              href="/offers"
              className="font-medium underline hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-color)' }}
            >
              all available promo codes
            </Link>
            {' '}now.
          </p>
        </div>

      </div>
    </div>
  )
}
