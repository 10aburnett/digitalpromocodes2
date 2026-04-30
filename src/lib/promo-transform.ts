// Tiny helper that maps a Prisma Deal (with PromoCode included) to the `Promo`
// shape consumed by OfferCard / OfferCardServer. Used by the homepage strip
// components and BrowseAllList so we don't repeat the same shape juggling.

import type { PromoCode } from '@prisma/client';

interface DealLike {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  rating: number;
  displayOrder: number;
  affiliateLink: string;
  price?: string | null;
  PromoCode?: Pick<PromoCode, 'id' | 'code' | 'title' | 'description' | 'value' | 'type'>[];
}

export function dealToPromo(deal: DealLike) {
  const firstPromo = deal.PromoCode?.[0];
  const priceText = deal.price && deal.price.toLowerCase() !== 'free' ? deal.price : 'Free';

  return {
    id: deal.id,
    whopName: deal.name,
    slug: deal.slug,
    promoType: firstPromo?.type ?? 'discount',
    promoValue: parseInt(firstPromo?.value ?? '0', 10) || 0,
    promoText: firstPromo?.title ?? 'Special access',
    logoUrl: deal.logo ?? '',
    promoCode: firstPromo?.code ?? null,
    affiliateLink: deal.affiliateLink ?? '',
    isActive: true,
    price: deal.price ?? null,
    priceText,
    priceBadge: priceText,
    offerId: deal.id,
    promoCodeId: firstPromo?.id,
  };
}
