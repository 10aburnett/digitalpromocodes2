// src/data/statistics.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { PLATFORM_METRICS } from '@/config/platformMetrics';

export interface StatisticsData {
  totalUsers: number;
  totalOffersAvailable: number;
  promoCodesClaimed: number;
  mostClaimedOffer: {
    name: string;
    slug: string;
    claimCount: number;
    logoUrl?: string;
  } | null;
}

/**
 * Cached, server-side statistics fetch for homepage.
 * Tags: stats (can be revalidated via /api/revalidate with tag: stats)
 */
export const getStatisticsCached = () =>
  unstable_cache(
    async (): Promise<StatisticsData> => {
      try {
        // Use marketing values from shared config
        const totalUsers = PLATFORM_METRICS.activeUsers;
        const promoCodesClaimed = PLATFORM_METRICS.claimedCodes;
        const totalOffersAvailable = PLATFORM_METRICS.availableOffers;

        // Get the configured most popular whop's logo from the database
        const configuredWhop = await prisma.deal.findFirst({
          where: {
            slug: PLATFORM_METRICS.mostPopularOfferSlug,
          },
          select: {
            logo: true
          }
        });

        const mostClaimedOffer = {
          name: PLATFORM_METRICS.mostPopularOfferName,
          slug: PLATFORM_METRICS.mostPopularOfferSlug,
          claimCount: 50,
          logoUrl: configuredWhop?.logo || undefined
        };

        return {
          totalUsers,
          promoCodesClaimed,
          totalOffersAvailable,
          mostClaimedOffer
        };
      } catch (error) {
        console.error('Error fetching statistics:', error);

        // Return marketing values from config on error
        return {
          totalUsers: PLATFORM_METRICS.activeUsers,
          promoCodesClaimed: PLATFORM_METRICS.claimedCodes,
          totalOffersAvailable: PLATFORM_METRICS.availableOffers,
          mostClaimedOffer: {
            name: PLATFORM_METRICS.mostPopularOfferName,
            slug: PLATFORM_METRICS.mostPopularOfferSlug,
            claimCount: 50,
            logoUrl: undefined
          }
        };
      }
    },
    ['statistics:homepage'],
    {
      tags: ['stats'],
      revalidate: 300 // 5 minutes
    }
  )();
