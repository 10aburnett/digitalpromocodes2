// src/components/HomePageServer.tsx
// Server component for homepage - no client state, pure server rendering
import { Suspense } from 'react';
import Link from 'next/link';
import OfferCardServer from '@/components/OfferCardServer';
import FilterControlsWrapper from '@/components/FilterControlsWrapper';
import SearchResultsOverlay from '@/components/SearchResultsOverlay';
import { SITE_BRAND, SITE_TAGLINE } from '@/lib/brand';

// Filter skeleton for Suspense fallback
const FilterSkeleton = () => (
  <div className="flex flex-wrap gap-3 animate-pulse">
    <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
  </div>
);

interface PromoCode {
  id: string;
  title: string;
  description: string;
  code: string | null;
  type: string;
  value: string;
}

interface DealItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
  rating: number;
  displayOrder: number;
  affiliateLink: string | null;
  promoCodes: PromoCode[];
  price?: string | null;
  priceText?: string;
  priceBadge?: string;
}

interface HomePageServerProps {
  items: DealItem[];
  currentPage: number;
  totalPages: number;
  total: number;
  searchParams?: { [key: string]: string | undefined };
}

export default function HomePageServer({
  items,
  currentPage,
  totalPages,
  total,
  searchParams = {},
}: HomePageServerProps) {
  // Build page URL preserving all current search params
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    // Preserve existing params (search, category, sort, etc.)
    if (searchParams.search) params.set('search', searchParams.search);
    if (searchParams.whopCategory) params.set('whopCategory', searchParams.whopCategory);
    if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
    // Set the page number
    if (n > 1) params.set('page', n.toString());
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      {/* HERO - Left-aligned blog-style layout */}
      <section
        className="pt-8 md:pt-10 pb-6 transition-theme"
        style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
      >
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1200px]">
          <header className="mb-6 md:mb-8">
            <p
              className="text-xs font-semibold tracking-wide uppercase mb-3"
              style={{ color: 'var(--accent-color)' }}
            >
              {SITE_BRAND} – verified digital savings
            </p>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3"
              style={{ color: 'var(--text-color)', lineHeight: 1.1 }}
            >
              Whop promo codes for digital tools, courses &amp; memberships.
            </h1>
            <p
              className="text-sm md:text-base max-w-2xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              Reliable discounts on SaaS, trading communities, AI tools and more – hand-checked before you buy.
            </p>
          </header>
        </div>
      </section>

      {/* Search/Filter Section - Separate from hero with Suspense for faster hydration */}
      <section className="pb-6 md:pb-8">
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1200px] pointer-events-none">
          <div className="pointer-events-auto">
            <Suspense fallback={<FilterSkeleton />}>
              <FilterControlsWrapper />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Main content container - pointer-events-none to prevent hit-testing on wrapper */}
      <div className="mx-auto w-[90%] md:w-[95%] max-w-[1200px] pointer-events-none">

      {/* Top Pagination - Compact left-aligned bar */}
      {/* IMPORTANT: pointer-events-none on nav, pointer-events-auto only on actual links */}
      {totalPages > 1 && (
        <nav
          className="mb-6 inline-flex flex-col gap-3 md:flex-row md:items-center md:justify-between self-start pointer-events-none"
          aria-label="Pagination"
          style={{ contain: 'layout paint' }}
        >
          {/* Left: summary */}
          <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Displaying{' '}
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
              {((currentPage - 1) * 15) + 1}
            </span>
            –
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
              {Math.min(currentPage * 15, total)}
            </span>{' '}
            of{' '}
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
              {total}
            </span>{' '}
            Whop offers
          </p>

          {/* Right: controls */}
          <div className="inline-flex items-center gap-1 md:gap-2">
            {/* Previous */}
            {currentPage > 1 ? (
              <Link
                href={pageHref(currentPage - 1)}
                prefetch={false}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all hover:opacity-85 pointer-events-auto"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <span aria-hidden="true">←</span>
                <span>Previous</span>
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm opacity-50 cursor-not-allowed"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
                aria-disabled="true"
              >
                <span aria-hidden="true">←</span>
                <span>Previous</span>
              </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1 pointer-events-none">
              {getPageNumbers().map((pageNum) => (
                <Link
                  key={pageNum}
                  href={pageHref(pageNum)}
                  prefetch={false}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                  className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs md:text-sm min-w-[28px] pointer-events-auto ${
                    pageNum === currentPage ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: pageNum === currentPage ? 'var(--accent-color)' : 'transparent',
                    color: pageNum === currentPage ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {pageNum}
                </Link>
              ))}
            </div>

            {/* Next */}
            {currentPage < totalPages ? (
              <Link
                href={pageHref(currentPage + 1)}
                prefetch={false}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all hover:opacity-85 pointer-events-auto"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <span>Next</span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm opacity-50 cursor-not-allowed"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
                aria-disabled="true"
              >
                <span>Next</span>
                <span aria-hidden="true">→</span>
              </span>
            )}
          </div>
        </nav>
      )}

      {/* Offer Cards Grid - Using sm + xl breakpoints for fingerprint differentiation */}
      {/* IMPORTANT: pointer-events-auto to re-enable clicks on the grid (parent has pointer-events-none) */}
      <SearchResultsOverlay>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-8 pointer-events-auto">
          {items.map((whop) => (
            <OfferCardServer
              key={whop.id}
              promo={{
                id: whop.id,
                whopName: whop.name,
                slug: whop.slug,
                promoType: whop.promoCodes[0]?.type || 'discount',
                promoValue: parseInt(whop.promoCodes[0]?.value || '0'),
                promoText: whop.promoCodes[0]?.title || 'Special access',
                logoUrl: whop.logo || '',
                promoCode: whop.promoCodes[0]?.code || null,
                affiliateLink: whop.affiliateLink || '',
                isActive: true,
                price: whop.price,
                priceText: whop.priceText,
                priceBadge: whop.priceBadge,
                offerId: whop.id,
                promoCodeId: whop.promoCodes[0]?.id,
              }}
            />
          ))}
        </div>
      </SearchResultsOverlay>

      {/* Bottom Pagination - Compact left-aligned bar */}
      {/* IMPORTANT: pointer-events-none on nav, pointer-events-auto only on actual links */}
      {totalPages > 1 && (
        <nav
          className="mt-4 mb-10 inline-flex flex-col gap-3 md:flex-row md:items-center md:justify-between self-start pointer-events-none"
          aria-label="Pagination"
          style={{ contain: 'layout paint' }}
        >
          {/* Left: summary */}
          <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Displaying{' '}
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
              {((currentPage - 1) * 15) + 1}
            </span>
            –
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
              {Math.min(currentPage * 15, total)}
            </span>{' '}
            of{' '}
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
              {total}
            </span>{' '}
            Whop offers
          </p>

          {/* Right: controls */}
          <div className="inline-flex items-center gap-1 md:gap-2">
            {/* Previous */}
            {currentPage > 1 ? (
              <Link
                href={pageHref(currentPage - 1)}
                prefetch={false}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all hover:opacity-85 pointer-events-auto"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <span aria-hidden="true">←</span>
                <span>Previous</span>
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm opacity-50 cursor-not-allowed"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
                aria-disabled="true"
              >
                <span aria-hidden="true">←</span>
                <span>Previous</span>
              </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1 pointer-events-none">
              {getPageNumbers().map((pageNum) => (
                <Link
                  key={pageNum}
                  href={pageHref(pageNum)}
                  prefetch={false}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                  className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs md:text-sm min-w-[28px] pointer-events-auto ${
                    pageNum === currentPage ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: pageNum === currentPage ? 'var(--accent-color)' : 'transparent',
                    color: pageNum === currentPage ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {pageNum}
                </Link>
              ))}
            </div>

            {/* Next */}
            {currentPage < totalPages ? (
              <Link
                href={pageHref(currentPage + 1)}
                prefetch={false}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all hover:opacity-85 pointer-events-auto"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <span>Next</span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm opacity-50 cursor-not-allowed"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
                aria-disabled="true"
              >
                <span>Next</span>
                <span aria-hidden="true">→</span>
              </span>
            )}
          </div>
        </nav>
      )}

      {/* No results message */}
      {items.length === 0 && (
        <div className="col-span-full text-center py-16 pointer-events-auto">
          <div className="max-w-md mx-auto space-y-4">
            <div
              className="h-12 w-12 mx-auto rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(5,150,105,0.10)',
                color: 'var(--accent-color)',
              }}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
              We couldn&apos;t find any offers for that search
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Update your filters or try searching for a different digital product, tool or creator name.
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
