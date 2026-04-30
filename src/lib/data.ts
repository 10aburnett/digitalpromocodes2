import { unstable_noStore as noStore } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { whereIndexable } from '@/lib/where-indexable';
import { toIso } from '@/lib/hydration-debug';

/**
 * Normalize a slug for consistent lookup
 * Handles URL encoding/decoding and case normalization
 */
function normalizeSlug(slug: string): string {
  if (!slug) return '';
  try {
    // Decode any URL encoding, then lowercase
    return decodeURIComponent(slug).toLowerCase().trim();
  } catch {
    // If decoding fails, just lowercase
    return slug.toLowerCase().trim();
  }
}

const startOfTodayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export async function getOfferBySlug(slug: string, locale: string = 'en') {
  noStore();

  const normalizedSlug = normalizeSlug(slug);

  // Simplified query: try exact match first, then case-insensitive
  // Most slugs are already normalized in the database
  const whop = await prisma.deal.findFirst({
    where: {
      AND: [
        whereIndexable(),
        {
          OR: [
            { slug: normalizedSlug },
            { slug: { equals: normalizedSlug, mode: 'insensitive' } },
            // Fallback: sometimes cards link by ID
            { id: slug },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      rating: true,
      displayOrder: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      affiliateLink: true,
      screenshots: true,
      website: true,
      price: true,
      category: true,
      aboutContent: true,
      howToRedeemContent: true,
      promoDetailsContent: true,
      featuresContent: true,
      termsContent: true,
      faqContent: true,
      whopCategory: true,
      indexingStatus: true,
      retired: true,
      locale: true,
      PromoCode: {
        where: {
          NOT: { id: { startsWith: 'community_' } }
        },
        orderBy: { displayOrder: 'asc' }
      },
      Review: {
        where: { verified: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!whop) return null;

  // Get community-submitted promo codes that have been approved for this whop
  // Run in parallel with usage stats for better performance
  const since = startOfTodayUTC();

  const [communityPromoCodes, totalCount, todayCount, lastUsage] = await Promise.all([
    prisma.promoCode.findMany({
      where: {
        whopId: whop.id,
        id: { startsWith: 'community_' }
      },
      orderBy: { displayOrder: 'asc' }
    }),
    // Use whopId directly instead of slow path contains search
    prisma.offerTracking.count({
      where: {
        whopId: whop.id,
        actionType: 'code_copy'
      }
    }).catch(() => 0),
    prisma.offerTracking.count({
      where: {
        whopId: whop.id,
        actionType: 'code_copy',
        createdAt: { gte: since }
      }
    }).catch(() => 0),
    prisma.offerTracking.findFirst({
      where: {
        whopId: whop.id,
        actionType: 'code_copy'
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    }).catch(() => null)
  ]);

  // Combine all promo codes and sort by displayOrder
  const allPromoCodes = [
    ...communityPromoCodes,
    ...whop.PromoCode.filter(code => !code.id.startsWith('community_'))
  ].sort((a, b) => a.displayOrder - b.displayOrder);

  // Fetch verification/freshness data (for Verification Status section)
  let freshnessData: any = null;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const freshnessPath = path.join(process.cwd(), 'public', 'data', 'pages', `${whop.slug}.json`);
    const freshnessFile = await fs.readFile(freshnessPath, 'utf-8');
    freshnessData = JSON.parse(freshnessFile);
  } catch {
    // Fallback: consistent object so UI/hydration is stable
    freshnessData = { lastUpdated: new Date().toISOString(), ledger: [] };
  }

  // Return whop with combined promo codes + usage stats + verification data
  const verifiedRaw = whop.updatedAt || whop.createdAt || new Date(0);
  const usageStats = {
    todayCount: todayCount ?? 0,
    totalCount: totalCount ?? 0,
    lastUsed: lastUsage?.createdAt ? lastUsage.createdAt.toISOString() : null,
    verifiedDate: verifiedRaw ? verifiedRaw.toISOString() : new Date(0).toISOString(),
  };

  let freshness: any = null;
  try {
    freshness = freshnessData ? {
      ...freshnessData,
      lastUpdated: toIso(freshnessData.lastUpdated),
      ledger: (freshnessData.ledger ?? []).map((r: any) => ({
        ...r,
        checkedAt: toIso(r.checkedAt ?? null),
        verifiedAt: toIso(r.verifiedAt ?? null),
      })),
    } : null;
  } catch {}

  return {
    ...whop,
    PromoCode: allPromoCodes,
    usageStats,
    freshnessData: freshness,
  };
}

/**
 * Unfiltered version for page rendering - fetches whop regardless of indexingStatus/retired.
 * Used for pages that should be visible to users but have noindex meta tag.
 * For lists/sitemap, use getOfferBySlug() which applies whereIndexable().
 */
export async function getOfferBySlugUnfiltered(slug: string, locale: string = 'en') {
  noStore();

  const normalizedSlug = normalizeSlug(slug);

  // Simplified query: try exact match first, then case-insensitive
  const whop = await prisma.deal.findFirst({
    where: {
      OR: [
        { slug: normalizedSlug },
        { slug: { equals: normalizedSlug, mode: 'insensitive' } },
        // Fallback: sometimes cards link by ID
        { id: slug },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      rating: true,
      displayOrder: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      affiliateLink: true,
      screenshots: true,
      website: true,
      price: true,
      category: true,
      aboutContent: true,
      howToRedeemContent: true,
      promoDetailsContent: true,
      featuresContent: true,
      termsContent: true,
      faqContent: true,
      whopCategory: true,
      indexingStatus: true,
      retired: true,
      locale: true,
      PromoCode: {
        where: {
          NOT: { id: { startsWith: 'community_' } }
        },
        orderBy: { displayOrder: 'asc' }
      },
      Review: {
        where: { verified: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!whop) return null;

  // Get community-submitted promo codes and usage stats in parallel
  const since = startOfTodayUTC();

  const [communityPromoCodes, totalCount, todayCount, lastUsage] = await Promise.all([
    prisma.promoCode.findMany({
      where: {
        whopId: whop.id,
        id: { startsWith: 'community_' }
      },
      orderBy: { displayOrder: 'asc' }
    }),
    // Use whopId directly instead of slow path contains search
    prisma.offerTracking.count({
      where: {
        whopId: whop.id,
        actionType: 'code_copy'
      }
    }).catch(() => 0),
    prisma.offerTracking.count({
      where: {
        whopId: whop.id,
        actionType: 'code_copy',
        createdAt: { gte: since }
      }
    }).catch(() => 0),
    prisma.offerTracking.findFirst({
      where: {
        whopId: whop.id,
        actionType: 'code_copy'
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    }).catch(() => null)
  ]);

  // Combine all promo codes and sort by displayOrder
  const allPromoCodes = [
    ...communityPromoCodes,
    ...whop.PromoCode.filter(code => !code.id.startsWith('community_'))
  ].sort((a, b) => a.displayOrder - b.displayOrder);

  // Fetch verification/freshness data (for Verification Status section)
  let freshnessData: any = null;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const freshnessPath = path.join(process.cwd(), 'public', 'data', 'pages', `${whop.slug}.json`);
    const freshnessFile = await fs.readFile(freshnessPath, 'utf-8');
    freshnessData = JSON.parse(freshnessFile);
  } catch {
    // Fallback: consistent object so UI/hydration is stable
    freshnessData = { lastUpdated: new Date().toISOString(), ledger: [] };
  }

  // Return whop with combined promo codes + usage stats + verification data
  const verifiedRaw = whop.updatedAt || whop.createdAt || new Date(0);
  const usageStats = {
    todayCount: todayCount ?? 0,
    totalCount: totalCount ?? 0,
    lastUsed: lastUsage?.createdAt ? lastUsage.createdAt.toISOString() : null,
    verifiedDate: verifiedRaw ? verifiedRaw.toISOString() : new Date(0).toISOString(),
  };

  let freshness: any = null;
  try {
    freshness = freshnessData ? {
      ...freshnessData,
      lastUpdated: toIso(freshnessData.lastUpdated),
      ledger: (freshnessData.ledger ?? []).map((r: any) => ({
        ...r,
        checkedAt: toIso(r.checkedAt ?? null),
        verifiedAt: toIso(r.verifiedAt ?? null),
      })),
    } : null;
  } catch {}

  return {
    ...whop,
    PromoCode: allPromoCodes,
    usageStats,
    freshnessData: freshness,
  };
}

export async function getIndexableWhops(limit = 5000) {
  return prisma.deal.findMany({
    where: {
      indexingStatus: 'INDEX',
      retirement: 'NONE',
      publishedAt: { not: null }
    },
    select: {
      slug: true,
      locale: true,
      updatedAt: true
    },
    take: limit,
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getNoindexWhops(limit = 50000) {
  return prisma.deal.findMany({
    where: {
      indexingStatus: 'NOINDEX',
      retirement: 'NONE',
      publishedAt: { not: null }
    },
    select: {
      slug: true,
      locale: true,
      updatedAt: true
    },
    take: limit,
    orderBy: { updatedAt: 'desc' }
  });
}
