// src/components/StatisticsSectionServer.tsx
import Link from 'next/link';
import type { StatisticsData } from '@/data/statistics';
import { formatUserCount } from '@/config/platformMetrics';

interface StatisticsServerProps {
  stats: StatisticsData;
}

// SVG Icons for each stat card
const UsersIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const OffersIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const TicketIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export default function StatisticsSectionServer({ stats }: StatisticsServerProps) {
  const StatCard = ({
    label,
    value,
    caption,
    link = null,
    icon,
    showLogo = false,
    logoUrl,
  }: {
    label: string;
    value: number | string;
    caption: string;
    link?: string | null;
    icon: React.ReactElement;
    showLogo?: boolean;
    logoUrl?: string;
  }) => {
    const displayValue = typeof value === 'number' ? formatUserCount(value) : value;

    const content = (
      <div
        className="rounded-xl border p-4 md:p-5 flex flex-col gap-1 transition-all hover:shadow-md"
        style={{
          borderColor: 'var(--card-border)',
          backgroundColor: 'var(--card-bg)',
        }}
      >
        {/* Label first - top aligned */}
        <div
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </div>

        {/* Large value */}
        <div
          className="text-2xl md:text-3xl font-bold"
          style={{ color: 'var(--text-color)' }}
        >
          {showLogo && logoUrl ? (
            <div className="flex items-center gap-2">
              <img
                src={
                  logoUrl.startsWith('http')
                    ? `/api/img?src=${encodeURIComponent(logoUrl)}`
                    : logoUrl
                }
                alt={`${value} logo`}
                width={24}
                height={24}
                className="h-6 w-6 rounded object-cover"
                loading="lazy"
              />
              <span className="text-lg md:text-xl font-semibold truncate">{displayValue}</span>
            </div>
          ) : (
            displayValue
          )}
        </div>

        {/* Caption / descriptor */}
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {caption}
        </p>

        {/* Icon moved to bottom */}
        <div
          className="mt-2 flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'rgba(8,145,178,0.08)',
            color: 'var(--accent-color)',
          }}
        >
          {icon}
        </div>
      </div>
    );

    if (link) {
      return (
        <Link href={link} className="block">
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <section
      id="platform-stats"
      className="
        stats-section
        -mt-8 md:mt-0
        pt-6 md:pt-16
        pb-10 md:pb-16
        mb-2 md:mb-12
        border-t-0 md:border-t
      "
      style={{
        background:
          'linear-gradient(180deg, var(--background-secondary), var(--background-tertiary))',
        borderColor: 'rgba(15,23,42,0.08)',
      }}
    >
      <div className="container mx-auto max-w-6xl px-3 md:px-4">
        <div className="mb-8 text-center md:mb-12">
          <h2
            className="text-2xl font-bold sm:text-3xl"
            style={{ color: 'var(--text-color)' }}
          >
            Real-time platform stats
          </h2>
          <p
            className="mt-2 text-sm sm:text-base max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            How the Digital Promo Codes community saves on digital products and memberships.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          <StatCard
            label="Active visitors"
            value={stats?.totalUsers || 0}
            caption="Visitors browsing offers this month"
            icon={<UsersIcon />}
          />
          <StatCard
            label="Curated offers"
            value={stats?.totalOffersAvailable || 0}
            caption="Hand-picked offers currently live"
            icon={<OffersIcon />}
          />
          <StatCard
            label="Codes used"
            value={stats?.promoCodesClaimed || 0}
            caption="Discount codes applied successfully"
            icon={<TicketIcon />}
          />
          <StatCard
            label="Trending offer"
            value={stats?.mostClaimedOffer?.name || 'N/A'}
            caption="Most popular this week"
            icon={<TrophyIcon />}
            link={
              stats?.mostClaimedOffer?.slug
                ? `/offer/${stats.mostClaimedOffer.slug.toLowerCase()}`
                : undefined
            }
            logoUrl={stats?.mostClaimedOffer?.logoUrl}
            showLogo={true}
          />
        </div>
      </div>
    </section>
  );
}
