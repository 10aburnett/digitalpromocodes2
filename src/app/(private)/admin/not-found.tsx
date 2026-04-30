import ErrorState from '@/components/layout/ErrorState';

export default function AdminNotFound() {
  return (
    <ErrorState
      variant="not-found"
      title="Admin page not found"
      description="The admin page you're looking for doesn't exist or has been moved. Check the URL or navigate back to the dashboard."
      primaryCta={{ href: '/admin', label: 'Back to dashboard' }}
      compact
    />
  );
}
