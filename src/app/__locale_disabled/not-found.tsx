import ErrorState from '@/components/layout/ErrorState';

export default function NotFound() {
  return (
    <ErrorState
      variant="not-found"
      title="We couldn't find that page"
      description="This link doesn't match any promo or product on WhopPromoCodes. It might have moved, expired, or never existed."
      primaryCta={{ href: '/', label: 'Back to homepage' }}
      secondaryCta={{ href: '/blog', label: 'Read our blog' }}
    />
  );
}
