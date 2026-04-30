'use client';

import { useRef } from 'react';
import OfferPageClient from './OfferPageClient';
import PromoStatsDisplay, { PromoStatsDisplayHandle } from './PromoStatsDisplay';

interface OfferPageInteractiveProps {
  offer: {
    id: string;
    name: string;
    slug: string;
    affiliateLink: string | null;
  };
  firstPromo: {
    id: string;
    code: string | null;
    title: string;
    type?: string;
    value?: string;
  } | null;
  promoCode: string | null;
  promoTitle: string;
}

// Standalone compact stats component
export function OfferPageCompactStats({ offerId, promoCodeId, slug }: { offerId: string; promoCodeId: string; slug?: string }) {
  return (
    <PromoStatsDisplay
      offerId={offerId}
      promoCodeId={promoCodeId}
      slug={slug}
      compact={true}
    />
  );
}

export default function OfferPageInteractive({ offer, firstPromo, promoCode, promoTitle }: OfferPageInteractiveProps) {
  return (
    <>
      {/* Interactive Button */}
      <OfferPageClient
        offer={offer}
        firstPromo={firstPromo}
        promoCode={promoCode}
        promoTitle={promoTitle}
        onTrackingComplete={() => {
          // Stats are now server-rendered via OfferMetaServer, no need to refresh client component
          console.log('🔄 Tracking complete - stats will update on next page load');
        }}
      />
    </>
  );
}
