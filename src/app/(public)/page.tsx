import { Suspense } from 'react';
import HomePageHybrid from '@/components/HomePageHybrid';
import { prisma } from '@/lib/prisma';
import { absoluteUrl, offerAbsoluteUrl } from '@/lib/urls';
import { SITE_BRAND } from '@/lib/brand';
import { LAUNCH_MODE, LAUNCH_COHORT_SLUGS } from '@/lib/launch-cohort';

// Cache pages for 60 seconds — pagination params still work dynamically
export const revalidate = 60;
export const dynamicParams = true;
export const runtime = 'nodejs'; // Required for Prisma

interface PromoCode {
  id: string;
  title: string;
  description: string;
  code: string | null;
  type: string;
  value: string;
}

interface DealWithPromos {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
  rating: number;
  displayOrder: number;
  affiliateLink: string | null;
  price?: string | null;
  promoCodes: PromoCode[];
  priceText?: string;
  priceBadge?: string;
}

// Helper to normalize search terms
function normalizeSearchTerm(term: string): string {
  return term.trim().replace(/[''`]/g, '').replace(/[^\w\s]/g, ' ');
}

// Generate search variations for possessives
function getWordVariations(word: string): string[] {
  const variations = [word];
  if (word.length > 2 && word.toLowerCase().endsWith('s')) {
    variations.push(word.slice(0, -1));
  }
  return variations;
}

// Relevance scorer for searches: name (highest) > aboutContent > featuresContent
function calculateRelevanceScore(whop: any, searchWords: string[]): number {
  let score = 0;
  const nameLower = normalizeSearchTerm(whop.name || '').toLowerCase();
  const aboutLower = (whop.aboutContent || '').toLowerCase();
  const featuresLower = (whop.featuresContent || '').toLowerCase();

  for (const word of searchWords) {
    const wordLower = word.toLowerCase();
    const variations = getWordVariations(wordLower);
    for (const variant of variations) {
      if (nameLower === variant) score += 1000;
      else if (nameLower.startsWith(variant)) score += 500;
      else if (nameLower.includes(variant)) score += 100;
      if (aboutLower.includes(variant)) score += 20;
      if (featuresLower.includes(variant)) score += 5;
    }
  }
  return score;
}

async function getPagedWhops({
  page = 1,
  q = '',
  category = '',
  sort = '',
}: {
  page?: number;
  q?: string;
  category?: string;
  sort?: string;
}) {
  try {
    const limit = 15;
    const where: any = {};

    if (LAUNCH_MODE && LAUNCH_COHORT_SLUGS.size > 0) {
      where.slug = { in: Array.from(LAUNCH_COHORT_SLUGS) };
    }

    const normalized = normalizeSearchTerm(q);
    const searchWords = normalized.split(/\s+/).filter((word) => word.length >= 2);
    const hasSearch = searchWords.length > 0;

    if (hasSearch) {
      if (searchWords.length > 1) {
        where.AND = searchWords.map((word) => {
          const variations = getWordVariations(word);
          return {
            OR: variations.map((v) => ({ name: { contains: v, mode: 'insensitive' as const } })),
          };
        });
      } else {
        const variations = getWordVariations(searchWords[0]);
        where.OR = variations.map((v) => ({ name: { contains: v, mode: 'insensitive' as const } }));
      }
    }

    if (category && category !== '' && category !== 'all') {
      where.whopCategory = category;
    }

    if (hasSearch) {
      const allWhops = await prisma.deal.findMany({
        where,
        take: 200,
        include: {
          PromoCode: {
            select: { id: true, title: true, description: true, code: true, type: true, value: true },
          },
        },
      });

      const scoredWhops = allWhops.map((whop) => ({
        ...whop,
        _relevanceScore: calculateRelevanceScore(whop, searchWords),
      }));
      scoredWhops.sort((a, b) => {
        if (b._relevanceScore !== a._relevanceScore) {
          return b._relevanceScore - a._relevanceScore;
        }
        return a.displayOrder - b.displayOrder;
      });

      const totalCount = scoredWhops.length;
      const skip = (page - 1) * limit;
      const paginatedWhops = scoredWhops.slice(skip, skip + limit);

      const formattedWhops = paginatedWhops.map((whop) => ({
        id: whop.id,
        name: whop.name,
        slug: whop.slug,
        logo: whop.logo,
        description: whop.description ?? '',
        rating: whop.rating,
        displayOrder: whop.displayOrder,
        affiliateLink: whop.affiliateLink,
        promoCodes: whop.PromoCode.map((c) => ({
          id: c.id, title: c.title, description: c.description, code: c.code, type: c.type, value: c.value,
        })),
        priceText: (whop as any).price || 'Free',
        price: (whop as any).price || 'Free',
        priceBadge: (whop as any).price || 'Free',
      }));

      return {
        items: formattedWhops,
        totalPages: Math.ceil(totalCount / limit),
        total: totalCount,
      };
    }

    let orderBy: any = { displayOrder: 'asc' };
    if (sort) {
      switch (sort) {
        case 'newest':       orderBy = { createdAt: 'desc' }; break;
        case 'highest-rated': orderBy = { rating: 'desc' }; break;
        case 'alpha-asc':    orderBy = { name: 'asc' }; break;
        case 'alpha-desc':   orderBy = { name: 'desc' }; break;
        default:             orderBy = { displayOrder: 'asc' }; break;
      }
    }

    const skip = (page - 1) * limit;
    const [whops, totalCount] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          PromoCode: {
            select: { id: true, title: true, description: true, code: true, type: true, value: true },
          },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    const formattedWhops = whops.map((whop) => ({
      id: whop.id,
      name: whop.name,
      slug: whop.slug,
      logo: whop.logo,
      description: whop.description ?? '',
      rating: whop.rating,
      displayOrder: whop.displayOrder,
      affiliateLink: whop.affiliateLink,
      promoCodes: whop.PromoCode.map((c) => ({
        id: c.id, title: c.title, description: c.description, code: c.code, type: c.type, value: c.value,
      })),
      priceText: (whop as any).price || 'Free',
      price: (whop as any).price || 'Free',
      priceBadge: (whop as any).price || 'Free',
    }));

    return {
      items: formattedWhops,
      totalPages: Math.ceil(totalCount / limit),
      total: totalCount,
    };
  } catch (error) {
    console.error('Error fetching paged whops:', error);
    return { items: [], totalPages: 1, total: 0 };
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    search?: string;
    whopCategory?: string;
    sortBy?: string;
  };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? '1') || 1);
  const search = (searchParams?.search ?? '').toString().trim();
  const whopCategory = (searchParams?.whopCategory ?? '').toString();
  const sortBy = (searchParams?.sortBy ?? '').toString();

  const data = await getPagedWhops({ page, q: search, category: whopCategory, sort: sortBy });

  // JSON-LD schemas — server-rendered for SEO. Title/description in title metadata is owned by layout.tsx.
  const currentYear = new Date().getFullYear();
  const siteUrl = absoluteUrl('/');
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#dpc-website`,
    name: SITE_BRAND,
    description: 'Directory of promo codes and discounts for digital products, software, and online services.',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#dpc-org`,
    name: SITE_BRAND,
    url: siteUrl,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.svg'), width: 400, height: 400 },
    description: 'An independent platform cataloguing promotional codes and pricing information for digital tools and services.',
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: absoluteUrl('/contact') },
  };
  const offersSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteUrl}#dpc-featured-list`,
    name: `Featured Digital Offers ${currentYear}`,
    description: `A curated selection of digital product discounts available in ${currentYear}`,
    numberOfItems: Math.min(data.items.length, 10),
    itemListElement: data.items.slice(0, 10).map((whop, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: offerAbsoluteUrl(whop.slug.toLowerCase()),
    })),
  };

  return (
    <main
      className="min-h-screen pb-16 transition-theme"
      style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
    >
      <script id="homepage-schema"     type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script id="offers-schema"       type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offersSchema) }} />

      <Suspense fallback={null}>
        <HomePageHybrid
          key={`p-${page}`}
          items={data.items}
          currentPage={page}
          totalPages={data.totalPages}
          total={data.total}
          searchParams={{ search, whopCategory, sortBy }}
        />
      </Suspense>
    </main>
  );
}
