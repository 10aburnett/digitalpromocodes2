// src/app/api/offers/route.ts
// Optimized API route for client-side fetching (search, pagination, filtering)
// This route is designed to be fast and lightweight for interactive use

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { whereIndexable } from '@/lib/where-indexable';
import { LAUNCH_MODE, LAUNCH_COHORT_SLUGS } from '@/lib/launch-cohort';

export const runtime = 'nodejs';

// Cache headers for client-side requests
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

// Cached query function - revalidates every 60 seconds
const fetchOffersCached = unstable_cache(
  async (page: number, search: string, category: string, sortBy: string, limit: number) => {
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const baseWhere = whereIndexable();
    const where: any = { ...baseWhere };

    // Launch cohort gate
    if (LAUNCH_MODE && LAUNCH_COHORT_SLUGS.size > 0) {
      where.slug = { in: Array.from(LAUNCH_COHORT_SLUGS) };
    }

    // Search filter (name and slug only - fast indexed queries)
    if (search) {
      const searchTerms = search.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
      if (searchTerms.length > 0) {
        where.AND = [
          ...(where.AND || []),
          ...searchTerms.map(term => ({
            OR: [
              { name: { contains: term, mode: 'insensitive' as const } },
              { slug: { contains: term, mode: 'insensitive' as const } },
            ]
          }))
        ];
      }
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Build ORDER BY clause — always include `id` as a deterministic tiebreaker
    // to prevent rows from shuffling between paginated requests when the
    // primary sort field has duplicates (e.g. many rows share displayOrder=0).
    let orderBy: any = [{ displayOrder: 'asc' }, { rating: 'desc' }, { id: 'asc' }];
    switch (sortBy) {
      case 'newest':
        orderBy = [{ createdAt: 'desc' }, { id: 'asc' }];
        break;
      case 'rating':
      case 'highest-rated':
        orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }];
        break;
      case 'alpha-asc':
        orderBy = [{ name: 'asc' }, { id: 'asc' }];
        break;
      case 'alpha-desc':
        orderBy = [{ name: 'desc' }, { id: 'asc' }];
        break;
      // 'default' uses displayOrder + rating + id
    }

    // Parallel queries: fetch offers + count total
    const [offers, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          category: true,
          price: true,
          rating: true,
          affiliateLink: true,
          displayOrder: true,
          createdAt: true,
          PromoCode: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              code: true,
              title: true,
              description: true,
              value: true,
              type: true,
            }
          },
          _count: {
            select: { Review: true }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { offers, total, page, totalPages };
  },
  ['offers-list'],
  { revalidate: 60, tags: ['offers'] }
);

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const sortBy = searchParams.get('sortBy') || 'default';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    console.log('[API /offers] Request received:', { page, search, category, sortBy, limit });

    // Use cached query
    const { offers, total, totalPages } = await fetchOffersCached(page, search, category, sortBy, limit);

    const queryTime = Date.now() - startTime;

    return NextResponse.json({
      offers,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
      queryTime,
    }, { headers: CACHE_HEADERS });

  } catch (error) {
    console.error('[API /offers] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
