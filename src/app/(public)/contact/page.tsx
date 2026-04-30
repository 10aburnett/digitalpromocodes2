import type { Metadata } from 'next';
import Link from 'next/link';
import { siteOrigin } from '@/lib/site-origin';
import ContactClient from '@/components/ContactClient';
import { SITE_BRAND, CONTACT_EMAIL } from '@/lib/brand';

// SSG configuration - form is client component but page shell is static
export const dynamic = 'force-static'
export const fetchCache = 'force-cache'
export const revalidate = 86400 // 24h

const title = `Contact ${SITE_BRAND} - Questions, Feedback & Partnership Enquiries`;
const description = `Reach out to ${SITE_BRAND} for support, listing enquiries or feedback. We aim to reply within 24-48 hours.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://digitalpromocodes.com/contact',
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
    url: `${siteOrigin()}/contact`,
    type: 'website',
    siteName: SITE_BRAND,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function ContactPage() {
  const origin = siteOrigin();

  return (
    <>
      {/* ContactPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": `${origin}/contact#dpc-contact`,
            name: `Contact ${SITE_BRAND}`,
            description: "Send us a message for support, partnership requests, or general feedback.",
            url: `${origin}/contact`,
            mainEntity: {
              "@type": "Organization",
              "@id": `${origin}#dpc-org`,
              name: SITE_BRAND,
              url: origin,
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: CONTACT_EMAIL,
                url: `${origin}/contact`
              }
            }
          })
        }}
      />

      <ContactClient />

      {/* SSR Contextual Links for SEO */}
      <div className="mx-auto w-[90%] md:w-[92%] max-w-[1040px] pb-12">
        <div className="pt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Want to learn more about us? Visit our{' '}
            <Link href="/about" className="font-medium underline" style={{ color: 'var(--accent-color)' }}>
              About page
            </Link>
            {' '}or read the latest on our{' '}
            <Link href="/blog" className="font-medium underline" style={{ color: 'var(--accent-color)' }}>
              Blog
            </Link>.
          </p>
        </div>
      </div>
    </>
  );
}
