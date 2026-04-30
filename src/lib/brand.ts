// src/lib/brand.ts
// Centralised brand configuration for SEO metadata and JSON-LD

/**
 * Site brand name - used in titles, metadata, and JSON-LD
 */
export const SITE_BRAND = 'Digital Promo Codes';

/**
 * Site name (alias for SITE_BRAND)
 */
export const SITE_NAME = 'Digital Promo Codes';

/**
 * Site domain (without protocol)
 */
export const SITE_DOMAIN = 'digitalpromocodes.com';

/**
 * Full site URL with protocol
 */
export const SITE_URL = 'https://digitalpromocodes.com';

/**
 * Short tagline for the site - used in descriptions
 */
export const SITE_TAGLINE = 'Your directory for verified digital discounts and promotional offers';

/**
 * Longer description for home/about pages
 */
export const SITE_DESCRIPTION = 'Browse thousands of checked promo codes for software, online courses, and digital memberships. Independent reviews and regularly updated offers.';

/**
 * Default author/publisher name for content
 */
export const SITE_AUTHOR = 'Digital Promo Codes Team';

/**
 * Social media handles (without @)
 */
export const SOCIAL_HANDLES = {
  twitter: '',
  facebook: '',
};

/**
 * Contact email
 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'digitalpromocodes@gmail.com';
