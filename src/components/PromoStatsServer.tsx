// src/components/PromoStatsServer.tsx
// Renders all-time popularity for an offer. Hidden below the visibility threshold —
// "Used 3 times" reads worse than nothing. No timestamp framing (the underlying
// tracking data is stale, so any "today"/"last used"/"verified date" copy is
// either misleading or empty).

import type { PromoUsageStats } from '@/data/promo-stats';

interface Props {
  stats: PromoUsageStats;
}

const SHOW_THRESHOLD = 50;
const POPULAR_THRESHOLD = 1000;

export default function PromoStatsServer({ stats }: Props) {
  const { totalCount } = stats;

  if (!totalCount || totalCount < SHOW_THRESHOLD) return null;

  const isPopular = totalCount >= POPULAR_THRESHOLD;
  const formatted = totalCount.toLocaleString('en-US');

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--background-secondary)',
      }}
    >
      <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text-color)' }}>
        Popularity
      </h3>
      <div className="flex items-center gap-3 text-sm">
        {isPopular && (
          <span
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
            style={{
              borderColor: 'var(--accent-color)',
              color: 'var(--accent-color)',
              backgroundColor: 'rgba(8,145,178,0.08)',
            }}
          >
            Popular
          </span>
        )}
        <span style={{ color: 'var(--text-secondary)' }}>
          Used <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{formatted}</span> times
        </span>
      </div>
    </div>
  );
}
