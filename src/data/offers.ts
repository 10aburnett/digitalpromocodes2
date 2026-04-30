// src/data/offers.ts
// Optimized caching for offer pages
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { whereIndexable } from '@/lib/where-indexable';
import { TAG_HUBS } from '@/lib/cacheTags';

// Optional: tiny debug helper (no-op unless env set)
const logCache = (...args: any[]) => {
  if (process.env.DEBUG_CACHE === '1') {
    console.log('[cache]', ...args);
  }
};

const startOfTodayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Direct fetch for a single offer by slug.
 * Uses select instead of include to reduce payload size.
 * Includes usage stats for SEO.
 */
async function fetchOfferDirect(slug: string) {
  const decoded = decodeURIComponent(slug);
  const dbSlug = decoded.toLowerCase();

  const t0 = Date.now();

  const whop = await prisma.deal.findFirst({
    where: { slug: dbSlug },
    select: {
      // Core fields needed for render
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      rating: true,
      displayOrder: true,
      affiliateLink: true,
      website: true,
      price: true,
      category: true,
      // Content fields
      aboutContent: true,
      howToRedeemContent: true,
      promoDetailsContent: true,
      featuresContent: true,
      termsContent: true,
      faqContent: true,
      // Timestamps
      createdAt: true,
      updatedAt: true,
      // Retirement/indexing status
      retired: true,
      retirement: true,
      redirectToPath: true,
      indexingStatus: true,
      // Relations - only select needed fields
      PromoCode: {
        select: {
          id: true,
          title: true,
          description: true,
          code: true,
          type: true,
          value: true,
          displayOrder: true,
          createdAt: true,
        },
        orderBy: { displayOrder: 'asc' },
        take: 10, // Limit promo codes
      },
      Review: {
        select: {
          id: true,
          author: true,
          content: true,
          rating: true,
          createdAt: true,
          verified: true,
        },
        take: 20, // Limit reviews
      },
    },
  });

  console.log('[PERF] prisma.deal.findFirst', Date.now() - t0, 'ms', { slug: dbSlug });

  if (!whop) return null;

  // Fetch usage stats using whopId (fast indexed query)
  const since = startOfTodayUTC();
  const whereBase = { whopId: whop.id, actionType: 'code_copy' as const };

  const [totalCount, todayCount, lastUsage] = await Promise.all([
    prisma.offerTracking.count({ where: whereBase }).catch(() => 0),
    prisma.offerTracking.count({ where: { ...whereBase, createdAt: { gte: since } } }).catch(() => 0),
    prisma.offerTracking.findFirst({
      where: whereBase,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    }).catch(() => null)
  ]);

  const verifiedRaw = whop.updatedAt || whop.createdAt || new Date(0);
  const usageStats = {
    todayCount: todayCount ?? 0,
    totalCount: totalCount ?? 0,
    lastUsed: lastUsage?.createdAt ? lastUsage.createdAt.toISOString() : null,
    verifiedDate: verifiedRaw.toISOString(),
  };

  return {
    ...whop,
    usageStats,
  };
}

/**
 * Cached fetch for a single offer by slug.
 * FIX: unstable_cache wrapper is created once, not on every call.
 * Tags: offers
 */
export const getOfferBySlugCached = unstable_cache(
  async (slug: string) => {
    logCache('MISS fetchOfferDirect', { slug });
    return await fetchOfferDirect(slug);
  },
  ['offer-by-slug'],
  {
    revalidate: 300, // 5 minutes
    tags: ['offers']
  }
);

/**
 * Cached, tagged fetch for homepage/hubs list.
 * Tags: hubs
 */
export const getOffersOptimizedCached = (page = 1, limit = 15) =>
  unstable_cache(
    async () => {
      logCache('MISS getOffersOptimized', { page, limit });

      const whops = await prisma.deal.findMany({
        where: whereIndexable(),
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          rating: true,
          displayOrder: true,
          affiliateLink: true,
          price: true,
          PromoCode: {
            select: {
              id: true,
              title: true,
              description: true,
              code: true,
              type: true,
              value: true,
              displayOrder: true,
            },
            orderBy: { displayOrder: 'asc' }
          }
        },
        orderBy: { displayOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      });

      return whops;
    },
    [`whops:list:page=${page}:limit=${limit}`],
    {
      tags: [TAG_HUBS],
      revalidate: 300
    }
  )();

/**
 * Cached fetch for ALL offers (no quality gate).
 * Used for homepage to show total count and list.
 */
export const getOffersAllCached = (page = 1, limit = 15) =>
  unstable_cache(
    async () => {
      logCache('MISS getOffersAll', { page, limit });

      const whops = await prisma.deal.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          rating: true,
          displayOrder: true,
          affiliateLink: true,
          price: true,
          PromoCode: {
            select: {
              id: true,
              title: true,
              description: true,
              code: true,
              type: true,
              value: true,
              displayOrder: true,
            },
            orderBy: { displayOrder: 'asc' }
          }
        },
        orderBy: { displayOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      });

      return whops;
    },
    [`whops:all:page=${page}:limit=${limit}`],
    {
      tags: [TAG_HUBS],
      revalidate: 300
    }
  )();
