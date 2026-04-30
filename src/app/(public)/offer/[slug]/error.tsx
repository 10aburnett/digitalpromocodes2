'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/layout/ErrorState';

export default function OfferError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Offer page error:', error);
  }, [error]);

  return (
    <ErrorState
      variant="error"
      title="We were unable to load this offer"
      description="Something went wrong while loading this offer page on WhopPromoCodes. Our team has been notified to review it."
      onRetry={reset}
      secondaryCta={{ href: '/', label: 'View all current deals' }}
    />
  );
}
