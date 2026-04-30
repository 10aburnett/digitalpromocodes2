// src/components/OfferCardServer.tsx
// Server-first offer card - clickable IMMEDIATELY without hydration
// NO 'use client' - this is a pure server component

// Using Next.js Link with prefetch for instant perceived navigation.
// Pages preload on hover, so by the time user clicks, content is cached.
import Link from 'next/link';
import InitialsAvatar from './InitialsAvatar';
import { OfferLogoSSR } from './OfferLogoSSR';
import { offerHref } from '@/lib/paths';
import { resolveLogoUrl } from '@/lib/image-url';
import { getDiscountBadge } from '@/lib/promo-label';
import GetPromoButton from './GetPromoButton';

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

interface OfferCardServerProps {
  promo: Promo;
  priority?: boolean;
}

export default function OfferCardServer({ promo, priority = false }: OfferCardServerProps) {
  // Robust fallbacks for API shape variations
  const title =
    (promo as any).title ??
    promo.whopName ??
    (promo as any).name ??
    'Unlabelled offer';

  // Resolve logo URL
  const logoUrl = resolveLogoUrl(promo.logoUrl);

  const discountPercent =
    typeof (promo as any).discountPercent === 'number'
      ? (promo as any).discountPercent
      : typeof promo.promoValue === 'number'
      ? promo.promoValue
      : null;

  const detailHref = offerHref(promo.slug || promo.id);

  const previewText =
    (promo as any).preview ??
    (promo as any).promoText ??
    (promo as any).description ??
    (promo as any).excerpt ??
    '';

  // Get price badge
  const rawPriceBadge =
    (promo as any).priceBadge ??
    (promo as any).priceText ??
    (promo as any).price ??
    null;

  const priceBadge =
    rawPriceBadge && rawPriceBadge.toLowerCase() !== 'free'
      ? rawPriceBadge
      : null;

  // Discount label
  const discountLabel = getDiscountBadge({ discountPercent });

  return (
    <article
      className="relative group h-full rounded-lg border p-4 md:p-5 flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)',
      }}
    >
      {/*
        Next.js Link with prefetch - pages preload on hover for instant navigation.
        Positioned absolute with z-10, above card background but below CTAs.
      */}
      <Link
        href={detailHref}
        prefetch={true}
        className="absolute inset-0 z-10 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card-bg)]"
        style={{ outlineColor: 'var(--accent-color)' }}
        title={`${promo.whopName} discount – ${promo.promoText}`}
      >
        <span className="sr-only">View {title} promo details</span>
      </Link>

      {/* Content wrapper - z-20 pointer-events-none so clicks fall through to overlay */}
      <div className="relative z-20 pointer-events-none">
        {/* Header row: logo + title (border-first elevation, no accent bar) */}
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
      </div>

      {/* CTA stack — primary on top, secondary below, both full-width; z-30 so buttons clickable above overlay */}
      <div
        className="mt-auto pt-3 border-t flex flex-col gap-2 relative z-30 pointer-events-auto"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* Primary CTA — routes to detail page */}
        <Link
          href={detailHref}
          prefetch={true}
          className="w-full inline-flex items-center justify-center rounded-md px-3.5 py-2 text-xs md:text-sm font-semibold transition-shadow shadow-sm hover:shadow"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: '#ffffff',
          }}
        >
          Get Promo
        </Link>

        {/* Secondary CTA — outbound affiliate link via tracking client island */}
        <GetPromoButton
          affiliateLink={promo.affiliateLink}
          offerId={promo.offerId}
          promoCodeId={promo.promoCodeId}
          whopName={promo.whopName}
          promoCode={promo.promoCode}
          promoValue={promo.promoValue}
          promoType={promo.promoType}
          promoText={promo.promoText}
          className="w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-xs md:text-sm font-medium border hover:bg-[var(--background-tertiary)] transition-colors"
          style={{
            backgroundColor: 'var(--background-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-color)',
          }}
        />
      </div>
    </article>
  );
}
