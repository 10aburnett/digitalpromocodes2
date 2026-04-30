// Sticky homepage sidebar — categories + search + Submit CTA.
// Server component; selection driven by URL searchParams.
// (Discount-range slider deferred — current /api/offers does not accept a discount filter.)

import Link from 'next/link';
import { getCategoryLabel } from '@/types/offer';
import type { WhopCategory } from '@prisma/client';

const SIDEBAR_CATEGORIES: WhopCategory[] = [
  'TRADING',
  'SPORTS_BETTING',
  'RESELLING',
  'BUSINESS',
  'SOCIAL_MEDIA',
  'ECOMMERCE',
  'AI',
];

interface HomeSidebarProps {
  activeCategory?: string;
  currentSearch?: string;
}

export default function HomeSidebar({ activeCategory = '', currentSearch = '' }: HomeSidebarProps) {
  const isAll = !activeCategory;

  return (
    <aside
      className="hidden lg:block w-[260px] flex-shrink-0 sticky top-[88px] self-start"
      aria-label="Filter offers"
    >
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3
            className="text-xs font-semibold tracking-wide uppercase mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Categories
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="block px-2 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  color: isAll ? 'var(--text-color)' : 'var(--text-secondary)',
                  backgroundColor: isAll ? 'var(--background-tertiary)' : 'transparent',
                  fontWeight: isAll ? 600 : 500,
                }}
                aria-current={isAll ? 'page' : undefined}
              >
                All offers
              </Link>
            </li>
            {SIDEBAR_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <li key={cat}>
                  <Link
                    href={`/?whopCategory=${encodeURIComponent(cat)}`}
                    className="block px-2 py-1.5 rounded-md text-sm transition-colors"
                    style={{
                      color: isActive ? 'var(--text-color)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--background-tertiary)' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {getCategoryLabel(cat)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar search (mirrors header — submits via GET to /) */}
        <div>
          <h3
            className="text-xs font-semibold tracking-wide uppercase mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Search
          </h3>
          <form action="/" method="GET" role="search">
            <label htmlFor="sidebar-search" className="sr-only">Search offers</label>
            <input
              id="sidebar-search"
              name="search"
              type="search"
              placeholder="Filter…"
              defaultValue={currentSearch}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-color)',
              }}
            />
          </form>
        </div>

        {/* Submit a code CTA */}
        <div className="pt-2">
          <Link
            href="/submit"
            className="flex w-full items-center justify-center rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--background-tertiary)]"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
              backgroundColor: 'var(--background-secondary)',
            }}
          >
            Submit a code ↗
          </Link>
        </div>
      </div>
    </aside>
  );
}
