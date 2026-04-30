/**
 * Server-only site origin configuration
 * Provides the canonical base URL for SEO metadata and absolute URLs
 */

import { SITE_URL } from './brand';

/**
 * Normalize an origin value: always include a protocol, never have a trailing slash.
 * Defends against env-var misconfigurations like `SITE_ORIGIN=digitalpromocodes.com`
 * (no protocol) that would produce non-absolute URLs and break schema-guard.
 */
function normalizeOrigin(raw: string | undefined): string | null {
  const trimmed = raw?.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Bare host (e.g. "digitalpromocodes.com") — assume https in production-like envs
  return `https://${trimmed}`;
}

const fromEnv = normalizeOrigin(process.env.SITE_ORIGIN);

export function siteOrigin(): string {
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === 'production') {
    // Fall back to brand constant in production if env not set
    return SITE_URL;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}
