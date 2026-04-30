// Mobile/tablet category chips — horizontal-scrolling row at the top of the homepage.
// Sidebar (HomeSidebar) is `hidden lg:block`, so on smaller screens the user has no
// way to filter by category. This component fills that gap at <lg.

import Link from 'next/link';
import { getCategoryLabel } from '@/types/offer';
import type { WhopCategory } from '@prisma/client';

const MOBILE_CATEGORIES: WhopCategory[] = [
  'TRADING',
  'SPORTS_BETTING',
  'RESELLING',
  'BUSINESS',
  'SOCIAL_MEDIA',
  'ECOMMERCE',
  'AI',
];

interface HomeMobileCategoryRowProps {
  activeCategory?: string;
}

export default function HomeMobileCategoryRow({ activeCategory = '' }: HomeMobileCategoryRowProps) {
  const isAll = !activeCategory;

  return (
    <nav
      className="lg:hidden -mx-4 sm:-mx-0 overflow-x-auto scrollbar-hide"
      aria-label="Filter by category"
    >
      <ul className="flex gap-2 px-4 sm:px-0 pb-1 w-max">
        <li>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              borderColor: isAll ? 'var(--accent-color)' : 'var(--border-color)',
              backgroundColor: isAll ? 'var(--accent-color)' : 'var(--background-secondary)',
              color: isAll ? '#ffffff' : 'var(--text-secondary)',
            }}
            aria-current={isAll ? 'page' : undefined}
          >
            All offers
          </Link>
        </li>
        {MOBILE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <li key={cat}>
              <Link
                href={`/?whopCategory=${encodeURIComponent(cat)}`}
                className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  borderColor: isActive ? 'var(--accent-color)' : 'var(--border-color)',
                  backgroundColor: isActive ? 'var(--accent-color)' : 'var(--background-secondary)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                {getCategoryLabel(cat)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
