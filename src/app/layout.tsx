import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import Script from 'next/script';
import { GA_TRACKING_ID } from '@/lib/analytics';
import ForceDebugClient from './_force-debug-client';
import { SITE_BRAND, SITE_DESCRIPTION, SITE_AUTHOR } from '@/lib/brand';
import { siteOrigin } from '@/lib/site-origin';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true,
  fallback: ['system-ui', 'arial'],
});
const currentYear = new Date().getFullYear();

// Use a static version for cache busting to prevent hydration mismatches
const STATIC_VERSION = '1.0.0';

// Cache the favicon fetching for 1 hour with better error handling
const getFaviconUrl = unstable_cache(
  async () => {
    try {
      const settings = await prisma.settings.findFirst();
      const baseUrl = settings?.faviconUrl || '/favicon.ico';
      // Use static version to prevent hydration mismatches
      return `${baseUrl}?v=${STATIC_VERSION}`;
    } catch (error) {
      console.error('Error fetching favicon from settings:', error);
      return `/favicon.ico?v=${STATIC_VERSION}`;
    }
  },
  ['favicon-url'],
  { 
    revalidate: 3600, // Cache for 1 hour
    tags: ['favicon']
  }
);

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.ico'; // Default fallback
  
  try {
    faviconUrl = await getFaviconUrl();
  } catch (error) {
    console.error('Error in generateMetadata favicon fetch:', error);
    // Use default favicon if there's an error
    faviconUrl = `/favicon.ico?v=${STATIC_VERSION}`;
  }

  const origin = siteOrigin();

  const pageTitle = `${SITE_BRAND} — Verified codes for digital tools, courses & memberships ${currentYear}`;
  const pageDescription = `${SITE_DESCRIPTION} Updated for ${currentYear}.`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: 'promo codes, digital discounts, software savings, course deals, membership offers, online tools',
    metadataBase: new URL(origin),
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: origin,
      type: 'website',
      siteName: SITE_BRAND,
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: `${SITE_BRAND} — Directory of digital product discounts and promo codes`
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: ['/og.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    verification: {
      google: 'oznYkbOdYzQFT2YwQpfLswKFGdBeVKrPKWj5RiYKG4s',
    },
    icons: {
      icon: [
        {
          url: '/favicon.ico',
          sizes: '48x48',
          type: 'image/x-icon',
        },
        {
          url: '/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        {
          url: '/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        }
      ],
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

// Export viewport separately (Next.js 14+ best practice)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    // Light mode: DPC brand teal
    { media: '(prefers-color-scheme: light)', color: '#0891B2' },
    // Dark mode: slate-900, matches --background-color in dark theme
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let faviconUrl = '/favicon.ico'; // Default fallback
  
  try {
    faviconUrl = await getFaviconUrl();
  } catch (error) {
    console.error('Error in RootLayout favicon fetch:', error);
    // Use default favicon if there's an error
    faviconUrl = `/favicon.ico?v=${STATIC_VERSION}`;
  }

  return (
    <html lang="en">
      <head>
        {/* viewport and robots now managed via viewport export and generateMetadata */}
        <meta name="author" content={SITE_AUTHOR} />
        <meta name="language" content="en" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="safe for all audiences" />
        <meta name="revisit-after" content="7 days" />
        <meta property="og:locale" content="en_US" />
        <meta name="geo.region" content="GB" />
        <meta name="geo.placename" content="United Kingdom" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://assets.whop.com" crossOrigin="" />
        <link rel="preconnect" href="https://img-v2-prod.whop.com" crossOrigin="" />
        {/* dns-prefetch for dynamic origin handled by siteOrigin() */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preload" href="/og.png" as="image" />
        {/* Favicon setup from RealFaviconGenerator */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#0891B2" />
        <meta name="theme-color" content="#0891B2" />
        {/* Only include manifest in production to avoid 401s on Vercel protected previews */}
        {process.env.VERCEL_ENV === 'production' && (
          <link rel="manifest" href="/site.webmanifest" />
        )}
      </head>
      <body className={`${manrope.className} overflow-x-hidden`} style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
        <ForceDebugClient />
        {children}

        {/* Google Analytics – load once at root */}
        {GA_TRACKING_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="lazyOnload"
            />
            <Script id="ga-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
} 