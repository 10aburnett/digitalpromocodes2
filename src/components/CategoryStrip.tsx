// Server component — homepage category strip.
// 6 indexable offers in a given WhopCategory, ordered by displayOrder DESC.
// "View all <Label> →" link routes to /?whopCategory=<enum> which OffersGridClient picks up.

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { whereIndexable } from '@/lib/where-indexable';
import { LAUNCH_MODE, LAUNCH_COHORT_SLUGS } from '@/lib/launch-cohort';
import { dealToPromo } from '@/lib/promo-transform';
import { getCategoryLabel } from '@/types/offer';
import type { WhopCategory } from '@prisma/client';
import OfferCardServer from './OfferCardServer';

interface CategoryStripProps {
  category: WhopCategory;
  /** Override the default label from `getCategoryLabel(category)`. */
  label?: string;
}

export default async function CategoryStrip({ category, label }: CategoryStripProps) {
  const where: any = {
    ...whereIndexable(),
    whopCategory: category,
  };
  if (LAUNCH_MODE && LAUNCH_COHORT_SLUGS.size > 0) {
    where.slug = { in: Array.from(LAUNCH_COHORT_SLUGS) };
  }

  const deals = await prisma.deal.findMany({
    where,
    orderBy: { displayOrder: 'desc' },
    take: 6,
    include: {
      PromoCode: {
        select: { id: true, code: true, title: true, description: true, value: true, type: true },
        take: 1,
      },
    },
  });

  if (deals.length === 0) return null;

  const displayLabel = label ?? getCategoryLabel(category);
  const headingId = `category-${category.toLowerCase()}-heading`;

  return (
    <section className="mb-10 md:mb-12" aria-labelledby={headingId}>
      <div className="flex items-baseline justify-between mb-4">
        <h2
          id={headingId}
          className="text-lg md:text-xl font-bold tracking-tight"
          style={{ color: 'var(--text-color)' }}
        >
          {displayLabel}
        </h2>
        <Link
          href={`/?whopCategory=${encodeURIComponent(category)}`}
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--accent-color)' }}
        >
          View all {displayLabel} →
        </Link>
      </div>

      {/* Desktop: 3-up grid; mobile: horizontal scroll */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map((d) => (
          <OfferCardServer key={d.id} promo={dealToPromo(d as any)} />
        ))}
      </div>
      <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-3 w-max">
          {deals.map((d) => (
            <div key={d.id} className="w-64 flex-shrink-0">
              <OfferCardServer promo={dealToPromo(d as any)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
