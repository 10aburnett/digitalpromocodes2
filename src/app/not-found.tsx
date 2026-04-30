import ErrorState from '@/components/layout/ErrorState';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page missing | WhopPromoCodes',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <ErrorState
      variant="not-found"
      title="This page could not be found"
      description="This address doesn't correspond to any current page on WhopPromoCodes. It may have changed, expired, or been entered incorrectly."
      primaryCta={{ href: '/', label: 'Go to the main page' }}
      secondaryCta={{ href: '/blog', label: 'Browse our blog' }}
    />
  );
}
