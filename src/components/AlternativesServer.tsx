import 'server-only';
import OfferMiniPreview from './OfferMiniPreview';
import { resolveLogoUrl } from '@/lib/image-url';

type Item = {
  slug: string;
  name: string;
  logo?: string | null;
  blurb?: string | null;
  category?: string | null;
  rating?: number | null;
  ratingCount?: number;
};

type ExploreLink = {
  slug: string;
  name: string;
  logo?: string | null;
  blurb?: string | null;
  category?: string | null;
  rating?: number | null;
  ratingCount?: number;
};

export default function AlternativesServer({
  items,
  explore
}: {
  items?: Item[];
  explore?: ExploreLink | null;
}) {
  const list = (items ?? [])
    .filter((w): w is Item & { slug: string } => !!w && !!w.slug)
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug));

  if (!list.length && !explore) return null;

  return (
    <section
      aria-label="Similar offers"
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
          Why Not Try…
        </h2>
      </div>

      <div className="space-y-3" suppressHydrationWarning>
        {list.map((w, i) => (
          <OfferMiniPreview
            key={`${w.slug}#${i}`}
            slug={w.slug}
            name={w.name}
            logo={resolveLogoUrl(w.logo)}
            description={w.blurb}
            category={w.category}
            rating={w.rating}
            ratingCount={w.ratingCount ?? 0}
          />
        ))}

        {/* Render explore link as a special preview card */}
        {explore && (
          <OfferMiniPreview
            key={`explore-${explore.slug}`}
            slug={explore.slug}
            name={explore.name}
            logo={resolveLogoUrl(explore.logo)}
            description={explore.blurb}
            category={explore.category}
            rating={explore.rating}
            ratingCount={explore.ratingCount ?? 0}
            isExploreLink={true}
          />
        )}
      </div>
    </section>
  );
}
