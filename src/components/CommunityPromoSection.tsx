'use client'
import React from 'react'
import OfferPageClient from './OfferPageClient'

interface PromoCode {
  id: string
  title: string
  description: string
  code: string | null
  type: string
  value: string
  createdAt: Date
}

interface CommunityPromoSectionProps {
  offer: {
    id: string
    name: string
    affiliateLink: string | null
  }
  promoCodes: PromoCode[]
  slug?: string
}

export default function CommunityPromoSection({ offer, promoCodes, slug }: CommunityPromoSectionProps) {

  // Use promoCodes as-is — already sorted by displayOrder from the server
  const allCodes = promoCodes

  // Handle tracking completion to refresh stats
  const handleTrackingComplete = () => {
    const compactStatsElements = document.querySelectorAll('[data-compact-stats]');
    compactStatsElements.forEach((element) => {
      const event = new CustomEvent('refreshStats');
      element.dispatchEvent(event);
    });
  };

  if (allCodes.length === 0) {
    // Create a fake promo code entry for whops without codes
    const fakePromo = {
      id: 'no-code',
      title: 'Special access',
      description: 'This creator doesn\'t allow promo codes at this time.',
      code: null,
      type: 'exclusive',
      value: '',
      createdAt: new Date()
    }

    return (
      <div className="space-y-4">
        <div
          className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-theme"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--background-tertiary)',
          }}
        >
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                }}
              >
                Top pick
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Click to access this offer directly.
            </p>
          </div>
          <div className="flex-shrink-0">
            <OfferPageClient
              offer={offer}
              firstPromo={fakePromo}
              promoCode={null}
              promoTitle="Special access"
              onTrackingComplete={handleTrackingComplete}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {allCodes.map((promo, index) => {
        const isPrimary = index === 0
        const isCommunity = promo.id.startsWith('community_')

        return (
          <div
            key={promo.id}
            className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-theme"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: isPrimary ? 'var(--background-tertiary)' : 'var(--card-bg)',
            }}
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: isPrimary ? 'var(--accent-color)' : 'var(--background-tertiary)',
                    color: isPrimary ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {isPrimary ? 'Top pick' : 'Alternative'}
                </span>
                {isCommunity && (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'var(--background-tertiary)',
                      color: 'var(--accent-color)',
                    }}
                  >
                    Community
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isPrimary
                  ? 'Best discount currently available.'
                  : 'Use if the primary code has expired.'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <OfferPageClient
                offer={offer}
                firstPromo={promo}
                promoCode={promo.code}
                promoTitle={promo.title}
                onTrackingComplete={handleTrackingComplete}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}