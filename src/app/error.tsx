'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/layout/ErrorState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <ErrorState
      variant="error"
      title="Something went wrong while loading this page"
      description="We ran into an unexpected issue loading this area of WhopPromoCodes. Our team has been alerted so we can investigate."
      onRetry={reset}
      secondaryCta={{ href: '/', label: 'Return to the main page' }}
    />
  );
}
