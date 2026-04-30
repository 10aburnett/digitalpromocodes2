// src/data/recommendations.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { loadNeighbors, getNeighborSlugsFor, getExploreFor } from '@/lib/graph';
import { isOfferLaunchEligible, LAUNCH_MODE } from '@/lib/launch-cohort';
import { getCohortFallbackSlugs, MIN_INTERNAL_LINKS } from '@/lib/cohort-fallback-links';

interface PromoCode {
  id: string;
  title: string;
  type: string;
  value: string;
  code: string | null;
}

interface OfferItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  aboutContent: string | null;
  blurb: string | null;
  category: string | null;
  price: string | null;
  rating: number | null;
  ratingCount: number;
  promoCodes: PromoCode[];
}

interface ExploreLink {
  slug: string;
  name: string;
  logo?: string | null;
  blurb?: string | null;
  category?: string | null;
  rating?: number | null;
  ratingCount?: number;
}

/**
 * Extract the second sentence from text content.
 */
function getSecondSentence(text: string | null | undefined): string | null {
  if (!text || !text.trim()) return null;
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0);
  if (sentences.length === 0) return null;
  if (sentences.length === 1) return sentences[0];
  return sentences[1].trim();
}

// ============================================================================
// OPTIMIZED: Batch all DB queries to minimize round-trips
// ============================================================================

/**
 * OPTIMIZED: Build recommendations and alternatives with minimal DB queries.
 *
 * Instead of 6-8 separate queries, this uses 2-3 queries max:
 * 1. Get current offer category (if needed for fallbacks)
 * 2. Batch fetch ALL candidate items for recs + alts in ONE query
 * 3. Optionally fetch explore link
 */
export async function getRecsAndAlts(currentOfferSlug: string): Promise<{
  recommendations: { items: OfferItem[]; explore: ExploreLink | null };
  alternatives: { items: OfferItem[]; explore: ExploreLink | null };
}> {
  const canonicalSlug = currentOfferSlug.toLowerCase();
  const usedSlugs = new Set<string>();
  usedSlugs.add(canonicalSlug);

  try {
    const neighbors = await loadNeighbors();

    // Get candidate slugs from graph for both sections
    const recCandidates = getNeighborSlugsFor(neighbors, canonicalSlug, 'recommendations')
      .filter(Boolean)
      .filter(isOfferLaunchEligible)
      .filter(slug => !usedSlugs.has(slug));

    const altCandidates = getNeighborSlugsFor(neighbors, canonicalSlug, 'alternatives')
      .filter(Boolean)
      .filter(isOfferLaunchEligible)
      .filter(slug => !usedSlugs.has(slug) && !recCandidates.includes(slug));

    // Get explore slug
    const exploreSlug = getExploreFor(neighbors, canonicalSlug);
    const validExploreSlug = exploreSlug &&
      !usedSlugs.has(exploreSlug) &&
      !recCandidates.includes(exploreSlug) &&
      !altCandidates.includes(exploreSlug) &&
      isOfferLaunchEligible(exploreSlug) ? exploreSlug : null;

    // If we need category fallbacks, get current offer's category
    let currentCategory: string | null = null;
    if (recCandidates.length < 4 || altCandidates.length < 4) {
      const currentOffer = await prisma.deal.findFirst({
        where: { slug: canonicalSlug },
        select: { category: true }
      });
      currentCategory = currentOffer?.category ?? null;
    }

    // Collect all slugs we need to fetch (recs + alts + explore + category fallbacks)
    const allSlugsToFetch = new Set<string>();

    // Add rec candidates
    recCandidates.slice(0, 8).forEach(slug => allSlugsToFetch.add(slug));

    // Add alt candidates
    altCandidates.slice(0, 8).forEach(slug => allSlugsToFetch.add(slug));

    // Add explore
    if (validExploreSlug) allSlugsToFetch.add(validExploreSlug);

    // Add cohort fallbacks if needed
    if (LAUNCH_MODE && (recCandidates.length < MIN_INTERNAL_LINKS || altCandidates.length < MIN_INTERNAL_LINKS)) {
      const neededFallbacks = Math.max(0, MIN_INTERNAL_LINKS * 2 - recCandidates.length - altCandidates.length);
      const fallbackSlugs = getCohortFallbackSlugs(canonicalSlug, neededFallbacks, usedSlugs);
      fallbackSlugs.forEach(slug => allSlugsToFetch.add(slug));
    }

    // SINGLE BATCH QUERY: Fetch all whops we need in ONE database call
    const allWhops = allSlugsToFetch.size > 0 ? await prisma.deal.findMany({
      where: {
        slug: { in: Array.from(allSlugsToFetch) },
        NOT: { retirement: 'GONE' }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        aboutContent: true,
        category: true,
        price: true,
        rating: true,
        _count: { select: { Review: true } },
        PromoCode: {
          where: { NOT: { id: { startsWith: 'community_' } } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, title: true, type: true, value: true, code: true }
        }
      }
    }) : [];

    // Create lookup map for quick access
    const whopMap = new Map(allWhops.map(w => [w.slug, w]));

    // Build recommendation items
    const recItems: OfferItem[] = [];
    for (const slug of recCandidates) {
      if (recItems.length >= 4) break;
      const whop = whopMap.get(slug);
      if (whop && !usedSlugs.has(whop.slug)) {
        usedSlugs.add(whop.slug);
        recItems.push(transformWhop(whop));
      }
    }

    // If not enough recs, try category fallbacks from fetched whops
    if (recItems.length < 4 && currentCategory) {
      for (const whop of allWhops) {
        if (recItems.length >= 4) break;
        if (whop.category === currentCategory && !usedSlugs.has(whop.slug)) {
          usedSlugs.add(whop.slug);
          recItems.push(transformWhop(whop));
        }
      }
    }

    // Build alternative items
    const altItems: OfferItem[] = [];
    for (const slug of altCandidates) {
      if (altItems.length >= 4) break;
      const whop = whopMap.get(slug);
      if (whop && !usedSlugs.has(whop.slug)) {
        usedSlugs.add(whop.slug);
        altItems.push(transformWhop(whop));
      }
    }

    // If not enough alts, use remaining whops
    if (altItems.length < 4) {
      for (const whop of allWhops) {
        if (altItems.length >= 4) break;
        if (!usedSlugs.has(whop.slug)) {
          usedSlugs.add(whop.slug);
          altItems.push(transformWhop(whop));
        }
      }
    }

    // Build explore link
    let explore: ExploreLink | null = null;
    if (validExploreSlug) {
      const exploreWhop = whopMap.get(validExploreSlug);
      if (exploreWhop && !usedSlugs.has(exploreWhop.slug)) {
        usedSlugs.add(exploreWhop.slug);
        explore = {
          slug: exploreWhop.slug,
          name: exploreWhop.name,
          logo: exploreWhop.logo,
          blurb: getSecondSentence(exploreWhop.aboutContent) || exploreWhop.description,
          category: exploreWhop.category ?? undefined,
          rating: exploreWhop.rating,
          ratingCount: exploreWhop._count?.Review ?? 0
        };
      }
    }

    return {
      recommendations: { items: recItems, explore: null },
      alternatives: { items: altItems, explore },
    };
  } catch (error) {
    console.error('Error fetching recs/alts:', error);
    return {
      recommendations: { items: [], explore: null },
      alternatives: { items: [], explore: null },
    };
  }
}

/**
 * Transform a whop DB result to OfferItem
 */
function transformWhop(whop: {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  aboutContent: string | null;
  category: string | null;
  price: string | null;
  rating: number | null;
  _count: { Review: number } | null;
  PromoCode: { id: string; title: string; type: string; value: string; code: string | null }[];
}): OfferItem {
  return {
    id: whop.id,
    name: whop.name,
    slug: whop.slug,
    logo: whop.logo,
    description: whop.description,
    aboutContent: whop.aboutContent,
    blurb: getSecondSentence(whop.aboutContent) || whop.description,
    category: whop.category,
    price: whop.price,
    rating: whop.rating,
    ratingCount: whop._count?.Review ?? 0,
    promoCodes: whop.PromoCode || []
  };
}

// ============================================================================
// CACHED API - Uses unstable_cache for ISR caching across serverless invocations
// ============================================================================

/**
 * ISR-cached fetch for recommendations and alternatives.
 * This is the primary API - uses Next.js unstable_cache for proper caching.
 */
export const getRecsAndAltsCached = unstable_cache(
  async (slug: string) => {
    return getRecsAndAlts(slug);
  },
  ['recs-alts'],
  {
    revalidate: 300, // 5 minutes
    tags: ['recommendations']
  }
);

/**
 * Server-side fetch for recommendations.
 * @deprecated Use getRecsAndAltsCached() for guaranteed deduplication
 */
export async function getRecommendations(currentOfferSlug: string): Promise<{
  items: OfferItem[];
  explore: ExploreLink | null;
}> {
  const result = await getRecsAndAltsCached(currentOfferSlug);
  return result.recommendations;
}

/**
 * Server-side fetch for alternatives.
 * @deprecated Use getRecsAndAltsCached() for guaranteed deduplication
 */
export async function getAlternatives(currentOfferSlug: string): Promise<{
  items: OfferItem[];
  explore: ExploreLink | null;
}> {
  const result = await getRecsAndAltsCached(currentOfferSlug);
  return result.alternatives;
}
