import ErrorState from '@/components/layout/ErrorState';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offer unavailable | WhopPromoCodes',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfferNotFound() {
  return (
    <ErrorState
      variant="not-found"
      title="We can't locate this offer"
      description="There's no active promo page for this product on WhopPromoCodes. It may have ended, been removed by the creator, or the link may be inaccurate."
      primaryCta={{ href: '/', label: 'See available deals' }}
      secondaryCta={{ href: '/blog', label: 'Visit our blog' }}
    />
  );
}
