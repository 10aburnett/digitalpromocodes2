'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/layout/ErrorState';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <ErrorState
      variant="error"
      title="Admin panel error"
      description="An error occurred in the admin panel. The error has been logged and our team will investigate."
      onRetry={reset}
      secondaryCta={{ href: '/admin', label: 'Back to dashboard' }}
      compact
    />
  );
}
