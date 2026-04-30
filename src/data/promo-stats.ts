// src/data/promo-stats.ts
import 'server-only';
import { prisma } from '@/lib/prisma';
import { cache } from 'react';

// Shape matching PromoStatsDisplay component's initialStats prop
export type PromoUsageStats = {
  todayCount: number;
  totalCount: number;
  lastUsed: string | null;
  verifiedDate: string;
};

const startOfTodayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Server-side helper to fetch promo usage statistics for a Whop by slug.
 * OPTIMIZED: Uses whopId directly instead of slow path contains searches.
 * Cached with React cache() for deduplication within a single request.
 */
export const getPromoStatsForSlug = cache(async (slug: string): Promise<PromoUsageStats> => {
  try {
    // Get the whop to find its ID
    const whop = await prisma.deal.findFirst({
      where: { slug: { equals: slug.toLowerCase(), mode: 'insensitive' } },
      select: { id: true, updatedAt: true, createdAt: true }
    });

    if (!whop?.id) {
      return {
        todayCount: 0,
        totalCount: 0,
        lastUsed: null,
        verifiedDate: new Date().toISOString()
      };
    }

    const since = startOfTodayUTC();
    const whereBase = { whopId: whop.id, actionType: 'code_copy' as const };

    // Fetch all stats in parallel using indexed whopId field
    const [totalCount, todayCount, lastUsage] = await Promise.all([
      prisma.offerTracking.count({ where: whereBase }),
      prisma.offerTracking.count({ where: { ...whereBase, createdAt: { gte: since } } }),
      prisma.offerTracking.findFirst({
        where: whereBase,
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    const verifiedRaw = whop.updatedAt || whop.createdAt || new Date();

    return {
      todayCount,
      totalCount,
      lastUsed: lastUsage?.createdAt?.toISOString() ?? null,
      verifiedDate: verifiedRaw.toISOString()
    };

  } catch (error) {
    console.error('[getPromoStatsForSlug] error:', error);
    // Return zeros on error so page still renders
    return {
      todayCount: 0,
      totalCount: 0,
      lastUsed: null,
      verifiedDate: new Date().toISOString()
    };
  }
});
