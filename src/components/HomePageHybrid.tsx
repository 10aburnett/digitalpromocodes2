// src/components/HomePageHybrid.tsx
// Homepage layout: sidebar + Top Picks + 3 category strips + Browse All.
// Server component composing static strips with a client list at the bottom.

import HomeSidebar from '@/components/HomeSidebar';
import HomeMobileCategoryRow from '@/components/HomeMobileCategoryRow';
import TopPicksStrip from '@/components/TopPicksStrip';
import CategoryStrip from '@/components/CategoryStrip';
import BrowseAllList from '@/components/BrowseAllList';

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

interface HomePageHybridProps {
  items: DealItem[];
  currentPage: number;
  totalPages: number;
  total: number;
  searchParams?: { search?: string; whopCategory?: string; sortBy?: string };
}

// Match BrowseAllList's expected `Offer` shape from the server payload
function transformToApiFormat(items: DealItem[]) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    logo: item.logo,
    description: item.description,
    rating: item.rating,
    displayOrder: item.displayOrder,
    affiliateLink: item.affiliateLink,
    price: item.price,
    category: null,
    PromoCode: item.promoCodes.map((pc) => ({
      id: pc.id,
      code: pc.code,
      title: pc.title,
      description: pc.description,
      value: pc.value,
      type: pc.type,
    })),
    _count: { Review: 0 },
  }));
}

export default function HomePageHybrid({
  items,
  currentPage,
  total,
  searchParams = {},
}: HomePageHybridProps) {
  const apiOffers = transformToApiFormat(items);
  const filteredByCategory = !!searchParams.whopCategory;
  const filteredBySearch = !!searchParams.search;
  const isFiltered = filteredByCategory || filteredBySearch;

  return (
    <div className="mx-auto w-[92%] max-w-7xl pt-6 md:pt-8">
      <div className="flex gap-8">
        <HomeSidebar
          activeCategory={searchParams.whopCategory || ''}
          currentSearch={searchParams.search || ''}
        />

        <div className="flex-1 min-w-0">
          {/* Mobile/tablet category chip row — fills in for the sidebar at <lg */}
          <div className="mb-6">
            <HomeMobileCategoryRow activeCategory={searchParams.whopCategory || ''} />
          </div>

          {/* Curated strips only on the unfiltered view — when user is filtering or searching, focus on results */}
          {!isFiltered && (
            <>
              <TopPicksStrip />
              <CategoryStrip category="TRADING" />
              <CategoryStrip category="SPORTS_BETTING" />
              <CategoryStrip category="RESELLING" />
            </>
          )}

          <BrowseAllList
            initialOffers={apiOffers}
            initialTotal={total}
            initialPage={currentPage}
            initialSort={searchParams.sortBy || ''}
          />
        </div>
      </div>
    </div>
  );
}
