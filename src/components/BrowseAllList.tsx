'use client';

// List-mode "Browse All" client component for the homepage.
// Mirrors OffersGridClient's fetch/pagination pattern (NEW LOCK respected —
// OffersGridClient itself is untouched). Renders offers as a vertical list.
//
// Search and category come from `useSearchParams()` (live) instead of useState.
// Why: when the sidebar's <Link> navigates, page.tsx re-renders with new initialOffers,
// but useState locks at first mount. useSearchParams + a prop-sync effect keeps both
// the URL-derived filter and the offers list in sync without remount or popstate hacks.

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resolveLogoUrl } from '@/lib/image-url';
import { offerHref } from '@/lib/paths';
import { getDiscountBadge } from '@/lib/promo-label';
import { OfferLogoSSR } from './OfferLogoSSR';
import InitialsAvatar from './InitialsAvatar';

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
  PromoCode?: PromoCode[];
}

interface BrowseAllListProps {
  initialOffers: Offer[];
  initialTotal: number;
  initialPage: number;
  /** Optional initial sort — search/category come from URL via useSearchParams, not props. */
  initialSort?: string;
}

export default function BrowseAllList({
  initialOffers,
  initialTotal,
  initialPage,
  initialSort = '',
}: BrowseAllListProps) {
  // Search + category derived live from URL — no local state to drift from props.
  const searchParams = useSearchParams();
  const search = searchParams?.get('search') ?? '';
  const category = searchParams?.get('whopCategory') ?? searchParams?.get('category') ?? '';

  // Local state for offers + pagination (the parts that change via in-component actions).
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 15));
  const [sortBy, setSortBy] = useState(initialSort);
  const [loading, setLoading] = useState(false);

  // When the URL changes (sidebar Link click → server re-renders page.tsx →
  // BrowseAllList receives new initialOffers/initialTotal/initialPage), reset
  // local state to match. This is the canonical fix for the previous bug where
  // stale useState(initialCategory) ignored prop changes.
  useEffect(() => {
    setOffers(initialOffers);
    setTotal(initialTotal);
    setPage(initialPage);
    setTotalPages(Math.ceil(initialTotal / 15));
  }, [initialOffers, initialTotal, initialPage]);

  const fetchOffers = useCallback(async (p: number, s: string, cat: string, sort: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '15');
      if (s) params.set('search', s);
      if (cat) params.set('category', cat);
      if (sort) params.set('sortBy', sort);

      const res = await fetch(`/api/offers?${params}`);
      if (!res.ok) throw new Error(`Failed to fetch offers: ${res.status}`);
      const data = await res.json();
      setOffers(data.offers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);

      const urlParams = new URLSearchParams();
      if (p > 1) urlParams.set('page', String(p));
      if (s) urlParams.set('search', s);
      if (cat) urlParams.set('whopCategory', cat);
      if (sort) urlParams.set('sortBy', sort);
      const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/';
      window.history.pushState({ page: p, search: s, category: cat, sortBy: sort }, '', newUrl);
    } catch (err) {
      console.error('BrowseAllList fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePage = (next: number) => {
    setPage(next);
    fetchOffers(next, search, category, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (next: string) => {
    setSortBy(next);
    setPage(1);
    fetchOffers(1, search, category, next);
  };

  const pageNumbers = (() => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, page - Math.floor(max / 2));
    const end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  return (
    <section className="mt-2" aria-labelledby="browse-all-heading">
      <div className="flex items-baseline justify-between mb-4">
        <h2
          id="browse-all-heading"
          className="text-lg md:text-xl font-bold tracking-tight"
          style={{ color: 'var(--text-color)' }}
        >
          Browse all
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{((page - 1) * 15) + 1}</span>
            –
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{Math.min(page * 15, total)}</span>
            {' of '}
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{total}</span>
          </span>
          <select
            aria-label="Sort offers"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="rounded-md border px-2.5 py-1.5 text-xs md:text-sm"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-color)',
            }}
          >
            <option value="">Default</option>
            <option value="newest">Newest</option>
            <option value="alpha-asc">A – Z</option>
            <option value="alpha-desc">Z – A</option>
          </select>
        </div>
      </div>

      {/* Vertical list */}
      <ul
        className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}
        aria-busy={loading}
      >
        {offers.length === 0 && !loading && (
          <li
            className="rounded-lg border p-6 text-center text-sm"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-secondary)',
            }}
          >
            No offers match these filters. Try clearing filters or using a different search term.
          </li>
        )}
        {offers.map((offer) => {
          const firstPromo = offer.PromoCode?.[0];
          const discountPercent =
            firstPromo?.value ? parseInt(firstPromo.value, 10) || null : null;
          const discountLabel = getDiscountBadge({ discountPercent });
          const detailHref = offerHref(offer.slug || offer.id);
          const logoUrl = resolveLogoUrl(offer.logo || '');

          return (
            <li key={offer.id}>
              <article
                className="group rounded-lg border p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)',
                }}
              >
                {/* Logo */}
                <div
                  className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center border"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--background-secondary)',
                  }}
                >
                  {!logoUrl || logoUrl.includes('placeholder') ? (
                    <InitialsAvatar name={offer.name} size="md" shape="square" className="w-full h-full" />
                  ) : (
                    <OfferLogoSSR src={logoUrl} alt={`${offer.name} logo`} width={56} height={56} />
                  )}
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={detailHref}
                    className="block"
                    title={`${offer.name} promo codes`}
                  >
                    <h3
                      className="text-sm md:text-base font-semibold truncate"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {offer.name}
                    </h3>
                    {offer.description && (
                      <p
                        className="hidden md:block text-xs mt-0.5 line-clamp-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {offer.description}
                      </p>
                    )}
                  </Link>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {offer.category && (
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-medium border"
                        style={{
                          backgroundColor: 'var(--background-secondary)',
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border-color)',
                        }}
                      >
                        {offer.category}
                      </span>
                    )}
                    {discountLabel && (
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: 'rgba(8,145,178,0.08)',
                          color: 'var(--accent-color)',
                        }}
                      >
                        {discountLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={detailHref}
                  className="flex-shrink-0 inline-flex items-center justify-center rounded-md px-3 py-2 text-xs md:text-sm font-semibold transition-shadow shadow-sm hover:shadow"
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: '#ffffff',
                  }}
                >
                  Get →
                </Link>
              </article>
            </li>
          );
        })}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-1.5" aria-label="Pagination">
          <button
            type="button"
            onClick={() => handlePage(page - 1)}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs md:text-sm transition-colors hover:bg-[var(--background-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
              backgroundColor: 'var(--background-secondary)',
            }}
          >
            ← Prev
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handlePage(n)}
              disabled={loading}
              aria-current={n === page ? 'page' : undefined}
              className="inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs md:text-sm min-w-[34px]"
              style={{
                backgroundColor: n === page ? 'var(--accent-color)' : 'transparent',
                color: n === page ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: n === page ? 600 : 500,
              }}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handlePage(page + 1)}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs md:text-sm transition-colors hover:bg-[var(--background-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
              backgroundColor: 'var(--background-secondary)',
            }}
          >
            Next →
          </button>
        </nav>
      )}
    </section>
  );
}
