'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocialProof, createSocialProofFromOffer } from '@/contexts/SocialProofContext';
import InitialsAvatar from './InitialsAvatar';
import { OfferLogoSSR } from './OfferLogoSSR';
import { offerHref } from '@/lib/paths';
import { resolveLogoUrl } from '@/lib/image-url';
import { getDiscountBadge } from '@/lib/promo-label';

// Define the promo type directly here to avoid import issues
interface Promo {
  id: string;
  whopName: string;
  slug?: string;
  promoType: string;
  promoValue: number;
  promoText: string;
  logoUrl: string;
  promoCode?: string | null;
  affiliateLink: string;
  isActive: boolean;
  price?: string | null;
  priceText?: string;
  priceBadge?: string;
  offerId?: string;
  promoCodeId?: string;
}

interface OfferCardProps {
  promo: Promo;
  priority?: boolean; // For prioritizing above-the-fold images
}

export default function OfferCard({ promo, priority = false }: OfferCardProps) {
  const { t, language, isHydrated } = useLanguage();
  const { addNotification } = useSocialProof();
  const pathname = usePathname();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Robust fallbacks for API shape variations
  const title =
    (promo as any).title ??
    promo.whopName ??
    (promo as any).name ??
    'Unlabelled offer';

  // Resolve logo URL to absolute path for SSR-safe rendering
  const logoUrl = resolveLogoUrl(promo.logoUrl);

  const discountPercent =
    typeof (promo as any).discountPercent === 'number'
      ? (promo as any).discountPercent
      : typeof promo.promoValue === 'number'
      ? promo.promoValue
      : null;

  const detailHref =
    (promo as any).href ??
    (promo.slug
      ? `/offer/${encodeURIComponent(promo.slug)}`
      : promo.id
      ? `/offer/${encodeURIComponent(promo.id)}`
      : '#');

  const previewText =
    (promo as any).preview ??
    (promo as any).promoText ??
    (promo as any).description ??
    (promo as any).excerpt ??
    '';

  // Get price badge from API
  const rawPriceBadge =
    (promo as any).priceBadge ??
    (promo as any).priceText ??
    (promo as any).price ??
    null;

  // Only show pill if we have a real price (not "Free")
  const priceBadge =
    rawPriceBadge && rawPriceBadge.toLowerCase() !== 'free'
      ? rawPriceBadge
      : null;

  // Helper function to get the correct detail page URL based on language
  const getDetailPageUrl = () => {
    // Use slug if available, otherwise fall back to id
    const identifier = promo.slug || promo.id;

    // Use canonical offerHref helper - handles encoding properly
    return offerHref(identifier);
  };

  const handleGetPromoClick = (e: React.MouseEvent) => {
    console.log('🔥 OfferCard: Get Promo button clicked!', {
      offerName: promo.whopName,
      offerId: promo.offerId,
      promoCodeId: promo.promoCodeId,
      hasOfferId: !!promo.offerId,
      hasPromoCodeId: !!promo.promoCodeId,
      timestamp: new Date().toISOString(),
    });

    // Track the click event - now works even without promo code ID
    if (promo.offerId) {
      console.log(
        '✅ OfferCard: Offer ID present, calling trackOfferClick',
      );
      trackOfferClick(promo.offerId, promo.promoCodeId || null);
    } else {
      console.warn('⚠️ OfferCard: Missing offer ID:', promo.offerId);
    }

    // Trigger social proof notification
    const socialProofData = createSocialProofFromOffer({
      whopName: promo.whopName,
      promoCode: promo.promoCode,
      promoValue: promo.promoValue,
      promoType: promo.promoType,
      promoText: promo.promoText,
    });
    addNotification(socialProofData);
  };

  const handleViewDealClick = (e: React.MouseEvent) => {
    // Only navigation to deal page, no social proof notification
  };

  const trackOfferClick = async (offerId: string, promoCodeId: string | null) => {
    console.log('🔥 OfferCard: trackOfferClick called with:', {
      offerId,
      promoCodeId,
      offerName: promo.whopName,
      timestamp: new Date().toISOString(),
    });

    try {
      const requestBody = {
        casinoId: offerId, // Using offerId as casinoId for compatibility
        bonusId: promoCodeId, // Using promoCodeId as bonusId for compatibility (can be null)
        actionType: 'code_copy',
      };

      console.log('📤 OfferCard: Sending tracking request:', requestBody);

      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ OfferCard: Tracking successful:', result);
      } else {
        const errorData = await response.text();
        console.error(
          '❌ OfferCard: Tracking failed:',
          response.status,
          errorData,
        );
      }
    } catch (error) {
      console.error('❌ OfferCard: Error tracking offer click:', error);
    }
  };

  // Intersection Observer for prefetching
  useEffect(() => {
    if (!cardRef.current) return;

    const cardElement = cardRef.current;
    let didPrefetch = false;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !didPrefetch) {
            const linkElement = cardElement.querySelector(
              'a[href^="/offer/"], a[href*="/offer/"]',
            ) as HTMLAnchorElement;
            if (linkElement) {
              linkElement.dispatchEvent(
                new MouseEvent('mouseover', { bubbles: true }),
              );
              didPrefetch = true;
            }
          }
        });
      },
      { rootMargin: '200px' },
    );

    io.observe(cardElement);
    return () => io.disconnect();
  }, []);

  // Derive discount label for meta strip using centralized logic
  // Rule: show "X% off" if percent exists, otherwise "Special Access"
  const discountLabel = getDiscountBadge({ discountPercent });

  return (
    <div ref={cardRef} className="relative h-full">
      <article
        className="group h-full rounded-lg border p-4 md:p-5 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)',
        }}
      >
        {/* Header row: logo + title (border-first elevation, no accent bar) */}
        <Link
          href={getDetailPageUrl()}
          prefetch={true}
          onMouseEnter={() => router.prefetch(getDetailPageUrl())}
          onTouchStart={() => router.prefetch(getDetailPageUrl())}
          className="block"
          title={`${promo.whopName} discount – ${promo.promoText}`}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div
                className="h-12 w-12 rounded-lg overflow-hidden flex items-center justify-center border flex-shrink-0"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                {!logoUrl ||
                logoUrl.includes('Simplified Logo') ||
                logoUrl.includes('placeholder') ? (
                  <InitialsAvatar
                    name={title}
                    size="md"
                    shape="square"
                    className="w-full h-full"
                  />
                ) : (
                  <OfferLogoSSR
                    src={logoUrl}
                    alt={`${promo.whopName} logo`}
                    width={48}
                    height={48}
                  />
                )}
              </div>
            </div>

            {/* Title + subtitle */}
            <div className="flex-1 min-w-0">
              <h2
                className="text-sm md:text-base font-semibold truncate group-hover:opacity-90"
                style={{ color: 'var(--text-color)' }}
              >
                {title}
              </h2>
              {previewText && (
                <p
                  className="text-xs md:text-sm mt-0.5 line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                  title={previewText}
                >
                  {previewText}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Meta strip — tag pills stay rounded-full (different semantic from buttons) */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Discount badge */}
          {discountLabel && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: 'rgba(8,145,178,0.08)',
                color: 'var(--accent-color)',
              }}
            >
              {discountLabel}
            </span>
          )}

          {/* Price + cadence */}
          {priceBadge && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              {priceBadge}
            </span>
          )}
        </div>

        {/* CTA stack — primary on top, secondary below, both full-width to fit narrow card grids */}
        <div
          className="mt-auto pt-3 border-t flex flex-col gap-2"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Primary CTA — routes to detail page (teal fill) */}
          <Link
            href={getDetailPageUrl()}
            prefetch={true}
            onMouseEnter={() => router.prefetch(getDetailPageUrl())}
            onTouchStart={() => router.prefetch(getDetailPageUrl())}
            className="w-full inline-flex items-center justify-center rounded-md px-3.5 py-2 text-xs md:text-sm font-semibold transition-shadow shadow-sm hover:shadow"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: '#ffffff',
            }}
            onClick={handleViewDealClick}
          >
            Get Promo
          </Link>

          {/* Secondary CTA — outbound affiliate link (slate ghost) */}
          <a
            href={promo.affiliateLink || '#'}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-xs md:text-sm font-medium border hover:bg-[var(--background-tertiary)] transition-colors"
            style={{
              backgroundColor: 'var(--background-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)',
            }}
            onClick={handleGetPromoClick}
          >
            Visit offer ↗
          </a>
        </div>
      </article>
    </div>
  );
}
