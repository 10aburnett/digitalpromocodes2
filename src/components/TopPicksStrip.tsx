// Server component — Top Picks strip on the homepage.
// 5 indexable offers ranked by displayOrder DESC (admin-curated signal).
// No timestamp framing — just "Top picks".

import { prisma } from '@/lib/prisma';
import { whereIndexable } from '@/lib/where-indexable';
import { LAUNCH_MODE, LAUNCH_COHORT_SLUGS } from '@/lib/launch-cohort';
import { dealToPromo } from '@/lib/promo-transform';
import OfferCardServer from './OfferCardServer';

export default async function TopPicksStrip() {
  const where: any = { ...whereIndexable() };
  if (LAUNCH_MODE && LAUNCH_COHORT_SLUGS.size > 0) {
    where.slug = { in: Array.from(LAUNCH_COHORT_SLUGS) };
  }

  const deals = await prisma.deal.findMany({
    where,
    orderBy: { displayOrder: 'desc' },
    take: 5,
    include: {
      PromoCode: {
        select: { id: true, code: true, title: true, description: true, value: true, type: true },
        take: 1,
      },
    },
  });

  if (deals.length === 0) return null;

  return (
    <section className="mb-10 md:mb-12" aria-labelledby="top-picks-heading">
      <div className="flex items-baseline justify-between mb-4">
        <h2
          id="top-picks-heading"
          className="text-lg md:text-xl font-bold tracking-tight"
          style={{ color: 'var(--text-color)' }}
        >
          Top picks
        </h2>
      </div>

      {/* Wide desktop: 5-up; mid: 3-up (1024–1279px column too narrow for 5); mobile: horizontal scroll */}
      <div className="hidden md:grid grid-cols-3 xl:grid-cols-5 gap-4">
        {deals.map((d) => (
          <OfferCardServer key={d.id} promo={dealToPromo(d as any)} priority />
        ))}
      </div>
      <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-3 w-max">
          {deals.map((d) => (
            <div key={d.id} className="w-64 flex-shrink-0">
              <OfferCardServer promo={dealToPromo(d as any)} priority />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
