import type { Metadata } from 'next';
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SearchLoadingProvider } from '@/context/SearchLoadingContext';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { absoluteUrl } from '@/lib/urls';
import { buildOrgSite } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';
import { siteOrigin } from '@/lib/site-origin';
import { SITE_BRAND, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/brand';

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

  const title = `Whop Promo Codes for Online Courses & Memberships ${currentYear}`;
  const description = `Browse Whop promo codes for digital products and services. Compare pricing on software, courses, and communities with regularly checked offers for ${currentYear}.`;

  return {
    title,
    description,
    keywords: 'promo codes, digital products, software discounts, course savings, membership deals, checked codes, online tools',
    metadataBase: new URL(siteOrigin()),
    openGraph: {
      title,
      description,
      url: siteOrigin(),
      type: 'website',
      siteName: SITE_BRAND,
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: `${SITE_BRAND} - Promo code directory for digital products and services`
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Whop Promo Codes for Online Courses & Memberships ${currentYear}`,
      description,
      images: ['/og.png'],
    },
    verification: {
      google: 'your-google-verification-code',
    },
    icons: {
      icon: [
        {
          url: faviconUrl,
          type: 'image/svg+xml',
        },
        {
          url: faviconUrl.replace('.svg', '.ico'),
          sizes: '32x32',
          type: 'image/x-icon',
        }
      ],
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let faviconUrl = '/favicon.ico'; // Default fallback

  try {
    faviconUrl = await getFaviconUrl();
  } catch (error) {
    console.error('Error in PublicLayout favicon fetch:', error);
    // Use default favicon if there's an error
    faviconUrl = `/favicon.ico?v=${STATIC_VERSION}`;
  }

  // Build Organization + WebSite JSON-LD (SSR only, no DB queries)
  const orgSiteSchema = buildOrgSite({
    org: {
      name: SITE_BRAND,
      url: absoluteUrl(),
      logo: absoluteUrl('/logo.svg'),
      // sameAs removed until new brand social accounts exist
    },
    site: {
      name: SITE_BRAND,
      url: absoluteUrl(),
      searchTarget: absoluteUrl('/?search={search_term_string}')
    }
  });

  return (
    <>
      <JsonLd data={orgSiteSchema[0]} />
      <JsonLd data={orgSiteSchema[1]} />
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <SearchLoadingProvider>
              <ConditionalLayout faviconUrl={faviconUrl}>
                {children}
              </ConditionalLayout>
            </SearchLoadingProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
      <Toaster position="top-right" />
    </>
  );
}
