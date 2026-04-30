// Navy hero band — full-width, brand identity moment for the offer-detail page.
// Server component. Holds: logo, brand display name, tag pills, VerifiedChip.
// The reveal block lives elsewhere (right rail at xl, overlapping card at <xl).

import OfferLogo from '@/components/OfferLogo';
import VerifiedChip from '@/components/ui/VerifiedChip';

interface OfferHeroProps {
  offer: any; // OfferLogo's input shape varies — defer to it
  promoTitle?: string;
}

export default function OfferHero({ offer, promoTitle }: OfferHeroProps) {
  return (
    <section
      className="dpc-offer-hero relative w-full"
      style={{ backgroundColor: '#0F172A', color: '#F1F5F9' }}
      aria-labelledby="offer-hero-heading"
    >
      {/* Mobile pt is generous so the logo clears the sticky promo-banner + DPC header on slight scroll. */}
      <div className="mx-auto max-w-7xl px-4 lg:px-6 pt-14 pb-10 sm:pt-10 sm:pb-9 xl:pt-12 xl:pb-12">
        {/* Mobile: stack logo + title vertically so the brand name gets full-width and doesn't wrap into pills.
            sm+: logo and title sit side-by-side. */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Brand mark — slightly smaller on mobile so a brief sticky-header overlap during scroll doesn't decapitate it. */}
          <figure
            className="relative h-10 w-10 sm:h-16 sm:w-16 flex-shrink-0 rounded-lg border overflow-hidden shadow-md"
            style={{ borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#1E293B' }}
          >
            <OfferLogo offer={offer} />
          </figure>

          <div className="min-w-0 flex-1">
            <h1
              id="offer-hero-heading"
              className="text-xl sm:text-3xl xl:text-4xl font-bold tracking-tight leading-[1.15] break-words"
              style={{ color: '#FFFFFF' }}
            >
              {offer.name} <span style={{ color: '#94A3B8' }}>Promo Code</span>
            </h1>

            <div className="mt-3 sm:mt-2.5 flex flex-wrap items-center gap-2">
              {/* Light-on-dark Verified chip variant — overrides the default light-mode styling */}
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: '#F1F5F9',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }}
                aria-label="Verified by Digital Promo Codes"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Verified</span>
              </span>

              {promoTitle && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(34,211,238,0.12)',
                    color: '#22D3EE',
                  }}
                >
                  {promoTitle}
                </span>
              )}

              {offer.price && offer.price !== 'N/A' && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    color: '#F1F5F9',
                  }}
                >
                  {offer.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
