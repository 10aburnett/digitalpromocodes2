/**
 * Cohort Fallback Links
 *
 * Guarantees every cohort offer page has internal links to other cohort pages,
 * even when the recommendation graph or category-based fallback returns empty.
 *
 * Uses deterministic circular selection from alphabetically sorted cohort slugs
 * to ensure stable, cacheable results.
 */

import { LAUNCH_COHORT_SLUGS, LAUNCH_MODE } from './launch-cohort';

// Cached sorted array for performance
let sortedCohortSlugs: string[] | null = null;

/**
 * Get alphabetically sorted array of cohort slugs (cached)
 */
function getSortedCohortSlugs(): string[] {
  if (!sortedCohortSlugs) {
    sortedCohortSlugs = Array.from(LAUNCH_COHORT_SLUGS).sort();
  }
  return sortedCohortSlugs;
}

/**
 * Get deterministic fallback slugs from the cohort set.
 *
 * Selection algorithm:
 * 1. Sort cohort slugs alphabetically
 * 2. Find index of currentSlug
 * 3. Take next `limit` slugs circularly (wrap around at end)
 * 4. If currentSlug not found, start from index 0
 *
 * @param currentSlug - The slug of the current offer page
 * @param limit - Maximum number of fallback slugs to return
 * @param excludeSlugs - Optional set of slugs to exclude (e.g., already shown recommendations)
 * @returns Array of fallback slugs (never includes currentSlug)
 */
export function getCohortFallbackSlugs(
  currentSlug: string,
  limit: number,
  excludeSlugs: Set<string> = new Set()
): string[] {
  // When not in launch mode, return empty (fallback not needed)
  if (!LAUNCH_MODE) return [];

  const sorted = getSortedCohortSlugs();
  if (sorted.length === 0) return [];

  const normalizedCurrent = currentSlug.toLowerCase();

  // Find index of current slug, or start from 0 if not found
  let startIndex = sorted.findIndex(s => s === normalizedCurrent);
  if (startIndex === -1) {
    // If slug not found, use hash-based starting point for variety
    startIndex = Math.abs(hashString(normalizedCurrent)) % sorted.length;
  } else {
    // Start from the next slug after current
    startIndex = (startIndex + 1) % sorted.length;
  }

  // Collect fallback slugs circularly
  const result: string[] = [];
  let checked = 0;
  let index = startIndex;

  while (result.length < limit && checked < sorted.length) {
    const slug = sorted[index];

    // Skip current slug and excluded slugs
    if (slug !== normalizedCurrent && !excludeSlugs.has(slug)) {
      result.push(slug);
    }

    index = (index + 1) % sorted.length;
    checked++;
  }

  return result;
}

/**
 * Simple hash function for deterministic starting point when slug not in cohort.
 * Uses djb2 algorithm.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash;
}

/**
 * Get the minimum number of internal links that should appear on each offer page.
 * This is used to determine when to apply the fallback.
 */
export const MIN_INTERNAL_LINKS = 6;
