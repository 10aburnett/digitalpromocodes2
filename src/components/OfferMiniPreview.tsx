import 'server-only';

interface OfferMiniPreviewProps {
  slug: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  category?: string | null;
  rating?: number | null;
  ratingCount?: number;
  isExploreLink?: boolean;
}

export default function OfferMiniPreview({
  slug,
  name,
  logo,
  description,
  category,
  rating,
  ratingCount = 0,
  isExploreLink = false,
}: OfferMiniPreviewProps) {
  const href = `/offer/${encodeURIComponent(slug)}`;

  // Compute display values with safe fallbacks
  const badge = category && category.trim() ? category : 'Special access';
  // Clamp rating between 0-5 for display consistency
  const r = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--card-bg)',
      }}
      aria-label={isExploreLink ? `Explore another: ${name}` : name}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Left accent rail */}
        <div
          className="w-1 h-10 rounded-full flex-shrink-0 transition-all group-hover:h-12"
          style={{ backgroundColor: 'var(--accent-color)', opacity: 0.3 }}
        />

        {/* Thumbnail */}
        <img
          src={logo || '/logo.svg'}
          alt={`${name} logo`}
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          className="h-11 w-11 rounded-xl object-contain p-1 border flex-shrink-0 transition-theme"
          style={{
            backgroundColor: 'var(--background-secondary)',
            borderColor: 'var(--border-color)',
          }}
        />

        {/* Name + Summary */}
        <div className="min-w-0">
          <h3
            className="text-sm font-semibold line-clamp-1 transition-colors"
            style={{ color: 'var(--text-color)' }}
          >
            {isExploreLink ? <>Discover: {name}</> : name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {category && category.trim() && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap flex-shrink-0"
                style={{
                  backgroundColor: 'var(--background-tertiary)',
                  color: 'var(--accent-color)',
                }}
              >
                {category}
              </span>
            )}
            {description && (
              <p className="text-xs line-clamp-1 min-w-0" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: View offer CTA - text + arrow style */}
      <div
        className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0 transition-colors"
        style={{ color: 'var(--accent-color)' }}
      >
        <span className="hidden sm:inline border-b border-transparent group-hover:border-current transition-all">
          View offer
        </span>
        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200">→</span>
      </div>
    </a>
  );
}
