// Server-safe list of recommended whops (no next/link, no client state)
import 'server-only';
import OfferMiniPreview from './OfferMiniPreview';
import { resolveLogoUrl } from '@/lib/image-url';

type Item = {
  slug: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  blurb?: string | null;
  category?: string | null;
  rating?: number | null;
  ratingCount?: number;
};

export default function RecommendedOffersServer({ items }: { items?: Item[] }) {
  const list = (items ?? [])
    .filter((w): w is Item & { slug: string } => !!w && !!w.slug)
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug));

  if (!list.length) return null;

  return (
    <section
      aria-label="More ways to save"
      className="rounded-3xl border px-5 sm:px-6 py-5 sm:py-6 transition-theme"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--background-tertiary)',
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--text-color)' }}
        >
          More ways to save
        </h2>
      </div>

      <div className="space-y-3" suppressHydrationWarning>
        {list.map((w, i) => (
          <OfferMiniPreview
            key={`${w.slug}#${i}`}
            slug={w.slug}
            name={w.name}
            logo={resolveLogoUrl(w.logo)}
            description={w.blurb || w.description}
            category={w.category}
            rating={w.rating}
            ratingCount={w.ratingCount ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
