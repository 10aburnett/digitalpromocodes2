'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/layout/ErrorState';

export default function BlogAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Blog admin error:', error);
  }, [error]);

  return (
    <ErrorState
      variant="error"
      title="Blog admin error"
      description="An error occurred while loading the blog admin. The error has been logged."
      onRetry={reset}
      secondaryCta={{ href: '/admin', label: 'Back to admin' }}
      compact
    />
  );
}
