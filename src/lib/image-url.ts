// src/lib/image-url.ts
// Safe, server-friendly logo URL resolver (NO event handlers needed on server)

import { coerceOfferLogoUrl } from './offerImage';

export function resolveLogoUrl(input?: string | null): string {
  // Return fallback for empty/null input
  if (!input || input.trim() === '') {
    return '/logo.svg';
  }

  // Remove leading/trailing whitespace
  const trimmedInput = input.trim();

  // If it's already a full external URL (http:// or https://), coerce ImgProxy URLs and return
  if (/^https?:\/\//i.test(trimmedInput)) {
    // Handle Whop's ImgProxy CDN URLs by extracting the real asset URL
    const coerced = coerceOfferLogoUrl(trimmedInput);
    return coerced || trimmedInput;
  }

  // Remove ALL leading slashes to normalize the path
  const cleanPath = trimmedInput.replace(/^\/+/, '');

  // Handle empty result after cleaning
  if (!cleanPath) {
    return '/logo.svg';
  }

  // IMPORTANT: Keep local paths relative (no origin prefix) so they work on any host
  // (vercel.app previews, production domain, localhost, etc.)
  // The browser/proxy will resolve them against the current host.

  // If path starts with known directories, return as relative path
  if (cleanPath.startsWith('uploads/') ||
      cleanPath.startsWith('data/') ||
      cleanPath.startsWith('logos/')) {
    return `/${cleanPath}`;
  }

  // For paths that don't start with known directories, assume they're in data/logos/
  return `/data/logos/${cleanPath}`;
}
