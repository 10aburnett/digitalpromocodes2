'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/layout/ErrorState';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Blog page error:', error);
  }, [error]);

  return (
    <ErrorState
      variant="error"
      title="Blog content could not be loaded"
      description="An error occurred while loading blog content on Digital Promo Codes. Please try again or go back to the homepage."
      onRetry={reset}
      secondaryCta={{ href: '/', label: 'Return to homepage' }}
    />
  );
}
