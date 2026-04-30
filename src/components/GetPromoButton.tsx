'use client';

// Client island for the affiliate-link button — handles tracking + social proof
// Tiny client component so the parent card stays server-rendered. Tracking logic locked.

import React from 'react';
import { useSocialProof, createSocialProofFromOffer } from '@/contexts/SocialProofContext';

interface GetPromoButtonProps {
  affiliateLink: string;
  offerId?: string;
  promoCodeId?: string;
  whopName: string;
  promoCode?: string | null;
  promoValue: number;
  promoType: string;
  promoText: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export default function GetPromoButton({
  affiliateLink,
  offerId,
  promoCodeId,
  whopName,
  promoCode,
  promoValue,
  promoType,
  promoText,
  className,
  style,
  label = 'Visit offer ↗',
}: GetPromoButtonProps) {
  const { addNotification } = useSocialProof();

  const trackOfferClick = async (offerId: string, promoCodeId: string | null) => {
    try {
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          casinoId: offerId,
          bonusId: promoCodeId,
          actionType: 'code_copy',
        }),
      });

      if (!response.ok) {
        console.error('Tracking failed:', response.status);
      }
    } catch (error) {
      console.error('Error tracking offer click:', error);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // IMPORTANT: Stop propagation so the parent card link doesn't trigger navigation
    e.stopPropagation();
    // Note: Don't preventDefault - we want the <a> to navigate to affiliateLink

    // Track the click
    if (offerId) {
      trackOfferClick(offerId, promoCodeId || null);
    }

    // Trigger social proof notification
    const socialProofData = createSocialProofFromOffer({
      whopName,
      promoCode,
      promoValue,
      promoType,
      promoText,
    });
    addNotification(socialProofData);
  };

  return (
    <a
      href={affiliateLink || '#'}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={className}
      style={style}
      onClick={handleClick}
    >
      {label}
    </a>
  );
}
