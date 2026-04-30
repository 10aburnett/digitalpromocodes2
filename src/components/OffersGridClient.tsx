// src/components/OffersGridClient.tsx
// Client component for interactive search, pagination, and filtering
// Uses API calls instead of triggering full SSR on every interaction

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import OfferCard from '@/components/OfferCard';
import FilterControls from '@/components/FilterControls';
import type { FilterState } from '@/types/offer';

interface PromoCode {
  id: string;
  title: string;
  description: string;
  code: string | null;
  type: string;
  value: string;
}

interface Offer {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string;
  rating: number;
  displayOrder: number;
  affiliateLink: string | null;
  price?: string | null;
  category?: string | null;
  PromoCode?: Array<{
    id: string;
    code: string | null;
    title: string;
    description: string;
    value: string;
    type: string;
  }>;
  _count?: { Review: number };
}

interface OffersGridClientProps {
  initialOffers: Offer[];
  initialTotal: number;
  initialPage: number;
  initialSearch?: string;
  initialCategory?: string;
  initialSort?: string;
}

// Transform API offer data to OfferCard promo format
function transformOfferToPromo(offer: Offer) {
  const firstPromo = offer.PromoCode?.[0];
  return {
    id: offer.id,
    whopName: offer.name,
    slug: offer.slug,
    promoType: firstPromo?.type || 'discount',
    promoValue: parseInt(firstPromo?.value || '0'),
    promoText: firstPromo?.title || 'Special access',
    logoUrl: offer.logo || '',
    promoCode: firstPromo?.code || null,
    affiliateLink: offer.affiliateLink || '',
    isActive: true,
    price: offer.price,
    priceText: offer.price || 'Free',
    priceBadge: offer.price || 'Free',
    offerId: offer.id,
    promoCodeId: firstPromo?.id,
  };
}

export default function OffersGridClient({
  initialOffers,
  initialTotal,
  initialPage,
  initialSearch = '',
  initialCategory = '',
  initialSort = '',
}: OffersGridClientProps) {
  // State
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 15));
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for tracking if this is the initial mount
  const isInitialMount = useRef(true);

  // Log on mount to confirm client hydration
  useEffect(() => {
    console.log('[OffersGridClient] Client component mounted/hydrated');
  }, []);

  // Fetch offers from API
  const fetchOffers = useCallback(async (
    p: number,
    s: string,
    cat: string,
    sort: string
  ) => {
    console.log('[OffersGridClient] fetchOffers called:', { page: p, search: s, category: cat, sort });
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '15');
      if (s) params.set('search', s);
      if (cat) params.set('category', cat);
      if (sort) params.set('sortBy', sort);

      console.log('[OffersGridClient] Calling API:', `/api/offers?${params}`);
      const res = await fetch(`/api/offers?${params}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch offers: ${res.status}`);
      }

      const data = await res.json();

      setOffers(data.offers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);

      // Update URL with pushState to enable back button navigation
      const urlParams = new URLSearchParams();
      if (p > 1) urlParams.set('page', String(p));
      if (s) urlParams.set('search', s);
      if (cat) urlParams.set('whopCategory', cat);
      if (sort) urlParams.set('sortBy', sort);

      const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
      // Use pushState to create history entries for back/forward navigation
      window.history.pushState({ page: p, search: s, category: cat, sortBy: sort }, '', newUrl);

    } catch (err) {
      console.error('Failed to fetch offers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state from URL on mount and back/forward navigation
  useEffect(() => {
    // Function to read URL params and update state
    const syncStateFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const urlPage = parseInt(params.get('page') || '1');
      const urlSearch = params.get('search') || '';
      const urlCategory = params.get('whopCategory') || params.get('category') || '';
      const urlSortBy = params.get('sortBy') || '';

      console.log('[OffersGridClient] syncStateFromURL:', { urlPage, urlSearch, urlCategory, urlSortBy });

      setPage(urlPage);
      setSearch(urlSearch);
      setCategory(urlCategory);
      setSortBy(urlSortBy);

      // Fetch offers with URL params
      fetchOffers(urlPage, urlSearch, urlCategory, urlSortBy);
    };

    // Check URL on mount - handles back navigation from offer pages
    const params = new URLSearchParams(window.location.search);
    const urlPage = parseInt(params.get('page') || '1');
    const urlSearch = params.get('search') || '';
    const urlCategory = params.get('whopCategory') || params.get('category') || '';
    const urlSortBy = params.get('sortBy') || '';

    // Only sync if URL differs from initial props (user navigated back)
    if (urlPage !== initialPage || urlSearch !== initialSearch || urlCategory !== initialCategory || urlSortBy !== initialSort) {
      console.log('[OffersGridClient] URL differs from initial props, syncing state');
      syncStateFromURL();
    }

    // Listen for back/forward navigation
    const handlePopState = () => {
      console.log('[OffersGridClient] popstate event - back/forward navigation detected');
      syncStateFromURL();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchOffers, initialPage, initialSearch, initialCategory, initialSort]);

  // Debounced search (300ms delay)
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setPage(1);
    fetchOffers(1, term, category, sortBy);
  }, 300);

  // Handle search input change
  const handleSearchChange = (term: string) => {
    setSearch(term);
    debouncedSearch(term);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log('[OffersGridClient] handlePageChange called:', { newPage, currentPage: page });
    setPage(newPage);
    fetchOffers(newPage, search, category, sortBy);
    // Scroll to top of grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle category change
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
    fetchOffers(1, search, cat, sortBy);
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
    fetchOffers(1, search, category, sort);
  };

  // Handle filter changes from FilterControls
  const onFilterChange = useCallback((next: Partial<FilterState>) => {
    if (next.searchTerm !== undefined) {
      handleSearchChange(next.searchTerm);
    }
    if (next.whopCategory !== undefined) {
      handleCategoryChange(next.whopCategory as string);
    }
    if (next.sortBy !== undefined) {
      handleSortChange(next.sortBy as string);
    }
  }, [search, category, sortBy]);

  // Handle form submit
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const searchTerm = (data.get('search') || '').toString().trim();
    handleSearchChange(searchTerm);
  }, []);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Filter state for FilterControls
  const filters: FilterState = {
    searchTerm: search,
    whopCategory: category as any,
    sortBy: sortBy as FilterState['sortBy'],
    promoType: '',
    whop: '',
  };

  return (
    <>
      {/* Search/Filter Section */}
      <section className="pb-6 md:pb-8">
        <div className="mx-auto w-[90%] md:w-[95%] max-w-[1200px]">
          <FilterControls
            filters={filters}
            onFilterChange={onFilterChange}
            onSubmit={onSubmit}
            casinos={[]}
            submitMode="auto"
            isLoading={loading}
          />
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto w-[90%] md:w-[95%] max-w-[1200px]">
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/10 dark:bg-black/20 z-40 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3"
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-color)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>Loading...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border" style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }}>
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {/* Top Pagination */}
        {totalPages > 1 && (
          <nav className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between" aria-label="Pagination">
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Displaying{' '}
              <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
                {((page - 1) * 15) + 1}
              </span>
              –
              <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
                {Math.min(page * 15, total)}
              </span>{' '}
              of{' '}
              <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
                {total}
              </span>{' '}
              Whop offers
            </p>

            <div className="flex items-center gap-1 md:gap-2">
              {/* Previous */}
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <span aria-hidden="true">&#8592;</span>
                <span>Previous</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    aria-current={pageNum === page ? 'page' : undefined}
                    className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs md:text-sm min-w-[28px] ${
                      pageNum === page ? 'font-semibold' : ''
                    }`}
                    style={{
                      backgroundColor: pageNum === page ? 'var(--accent-color)' : 'transparent',
                      color: pageNum === page ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next */}
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <span>Next</span>
                <span aria-hidden="true">&#8594;</span>
              </button>
            </div>
          </nav>
        )}

        {/* Offer Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6 mb-8">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              promo={transformOfferToPromo(offer)}
            />
          ))}
        </div>

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <nav className="mt-4 mb-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between" aria-label="Pagination">
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Displaying{' '}
              <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
                {((page - 1) * 15) + 1}
              </span>
              –
              <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
                {Math.min(page * 15, total)}
              </span>{' '}
              of{' '}
              <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
                {total}
              </span>{' '}
              Whop offers
            </p>

            <div className="flex items-center gap-1 md:gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <span aria-hidden="true">&#8592;</span>
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    aria-current={pageNum === page ? 'page' : undefined}
                    className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs md:text-sm min-w-[28px] ${
                      pageNum === page ? 'font-semibold' : ''
                    }`}
                    style={{
                      backgroundColor: pageNum === page ? 'var(--accent-color)' : 'transparent',
                      color: pageNum === page ? '#ffffff' : 'var(--text-secondary)',
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <span>Next</span>
                <span aria-hidden="true">&#8594;</span>
              </button>
            </div>
          </nav>
        )}

        {/* No results message */}
        {offers.length === 0 && !loading && (
          <div className="col-span-full text-center py-16">
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
