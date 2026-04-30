/**
 * i18n Lock Configuration
 *
 * EN-only lock: During trust-building phase, the entire site is English-only
 * at the URL + SEO surface level. This prevents accidental creation or indexing
 * of locale subpaths (e.g. /es/...).
 *
 * Non-negotiables:
 * - No locale routes: /es, /fr, /de, etc. return 404
 * - No hreflang output anywhere
 * - All canonicals are EN-only
 * - All sitemaps contain EN-only URLs
 *
 * ============================================================================
 * WARNING: NEVER ENABLE TRANSLATIONS - NOT EVEN "JUST TO TEST"
 * ============================================================================
 *
 * DO NOT:
 * - Toggle EN_ONLY_MODE to false
 * - Add /es experiments "temporarily"
 * - Enable hreflang "just to see"
 * - Say "we'll remove it later"
 *
 * WHY: Google remembers. Once locale URLs are crawled and indexed, they
 * become part of your site's history. Removing them creates soft-404s,
 * confuses the crawler, and damages domain trust during the critical
 * launch period.
 *
 * The EN-only lock stays ON until explicit business decision to expand
 * to international markets with proper translated content.
 * ============================================================================
 */

// Master switch for EN-only mode
// DO NOT CHANGE TO FALSE - SEE WARNING ABOVE
export const EN_ONLY_MODE = true;

// Only English is allowed when EN_ONLY_MODE is true
export const ALLOWED_LOCALES = new Set(['en']);

// Common locale codes to detect and block
const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;
const KNOWN_LOCALES = new Set([
  'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'zh', 'ja', 'ko', 'ru', 'ar',
  'en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'zh-CN', 'zh-TW'
]);

/**
 * Check if a locale is allowed
 * In EN_ONLY_MODE, only 'en' returns true (but we still 404 /en/* paths)
 */
export function isLocaleAllowed(locale: string | null | undefined): boolean {
  if (!locale) return true; // No locale = allowed (default EN)
  if (!EN_ONLY_MODE) return true; // If not locked, allow all
  return false; // In EN_ONLY_MODE, reject ALL locale prefixes including /en/
}

/**
 * Extract locale from pathname's first segment
 * Returns null if no locale detected
 *
 * Examples:
 *   /es/offers -> 'es'
 *   /fr/offer/foo -> 'fr'
 *   /en/offers -> 'en'
 *   /offers -> null
 *   /offer/foo -> null
 */
export function getLocaleFromPathname(pathname: string): string | null {
  if (!pathname || pathname === '/') return null;

  // Remove leading slash and get first segment
  const segments = pathname.replace(/^\//, '').split('/');
  const firstSegment = segments[0]?.toLowerCase();

  if (!firstSegment) return null;

  // Check if it looks like a locale code
  if (KNOWN_LOCALES.has(firstSegment)) {
    return firstSegment;
  }

  // Also check pattern for any 2-letter code that might be a locale
  if (firstSegment.length === 2 && LOCALE_PATTERN.test(firstSegment)) {
    return firstSegment;
  }

  return null;
}

/**
 * Check if a path should be blocked as a locale path
 * Returns true if the path starts with a locale prefix and should 404
 */
export function shouldBlockLocalePath(pathname: string): boolean {
  if (!EN_ONLY_MODE) return false;

  const locale = getLocaleFromPathname(pathname);
  if (!locale) return false;

  // Block ALL locale prefixes, including /en/*
  // This is strict mode: no locale paths allowed at all
  return true;
}

/**
 * Check if hreflang should be included
 * Always returns false in EN_ONLY_MODE
 */
export function shouldIncludeHreflang(): boolean {
  // EN-only lock: hreflang disabled by design during trust phase
  return !EN_ONLY_MODE;
}

/**
 * Get the canonical URL (always EN, no locale prefix)
 */
export function getCanonicalUrl(path: string, baseUrl: string = 'https://whoppromocodes.com'): string {
  // Strip any locale prefix from the path
  const locale = getLocaleFromPathname(path);
  let cleanPath = path;

  if (locale) {
    // Remove the locale prefix
    cleanPath = path.replace(new RegExp(`^/${locale}(/|$)`), '/');
  }

  // Ensure path starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  // Remove trailing slash except for root
  if (cleanPath !== '/' && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  return `${baseUrl}${cleanPath}`;
}
