// src/config/platformMetrics.ts
// Shared platform metrics configuration for consistent display across sections

export const PLATFORM_METRICS = {
  // Marketing numbers - used as fallbacks and for "Trusted by X users" pill
  activeUsers: 50_000,         // 50k+
  availableOffers: 8_000,      // 8000+
  claimedCodes: 6_000,         // 6k
  mostPopularOfferName: 'Scarface Trades Premium',
  mostPopularOfferSlug: 'scarface-trades-premium',
};

/**
 * Format a user count to compact display (e.g. 112000 -> "112k")
 * Consistent formatting for both Platform Stats and Trust Pill
 */
export function formatUserCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value >= 1_000_000) {
    const rounded = Math.round(value / 100_000) / 10;
    return `${rounded.toString().replace('.0', '')}M`;
  }
  if (value >= 1_000) {
    const rounded = Math.round(value / 100) / 10;
    return `${rounded.toString().replace('.0', '')}k`;
  }
  return value.toLocaleString();
}

/**
 * Format number with K/M suffix (floors to nearest thousand)
 */
export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K`;
  return `${Math.floor(n)}`;
}
