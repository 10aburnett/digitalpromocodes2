// src/lib/gone.ts
// NOTE: Gone slugs are now tracked via RETIRED_PATHS in seo-indexes.ts
// This file is kept for backwards compatibility but returns empty set by design.
// The clean sitemap system does NOT generate gone.xml - retired offers just 404.

import fs from 'node:fs/promises';
import path from 'node:path';

let GONE_SLUGS_CACHE: Set<string> | null = null;

function extractSlugsFromXml(xml: string): Set<string> {
  const slugs = new Set<string>();
  // naive XML parse: pull all <loc>...</loc>
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    try {
      const u = new URL(m[1].trim());
      // Expect paths like /offer/some-slug
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'offer') {
        const slug = decodeURIComponent(parts[1]).toLowerCase();
        if (slug) slugs.add(slug);
      }
    } catch { /* ignore bad URLs */ }
  }
  return slugs;
}

export async function getGoneOfferSlugs(): Promise<Set<string>> {
  if (GONE_SLUGS_CACHE) return GONE_SLUGS_CACHE;

  // NOTE: We no longer generate gone.xml - this will return empty set
  // Retired offers are tracked via RETIRED_PATHS in seo-indexes.ts
  const filePath = path.join(process.cwd(), 'public', 'gone.xml');
  try {
    const xml = await fs.readFile(filePath, 'utf8');
    GONE_SLUGS_CACHE = extractSlugsFromXml(xml);
    return GONE_SLUGS_CACHE;
  } catch {
    // File not found is expected - we don't generate gone.xml anymore
    GONE_SLUGS_CACHE = new Set();
    return GONE_SLUGS_CACHE;
  }
}

export async function isGoneSlug(slug: string): Promise<boolean> {
  const set = await getGoneOfferSlugs();
  return set.has((slug || '').toLowerCase());
}