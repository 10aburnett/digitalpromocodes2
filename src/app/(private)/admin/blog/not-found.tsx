import ErrorState from '@/components/layout/ErrorState';

export default function BlogAdminNotFound() {
  return (
    <ErrorState
      variant="not-found"
      title="Blog page not found"
      description="The blog admin page you're looking for doesn't exist or the post may have been deleted."
      primaryCta={{ href: '/admin/blog', label: 'Back to blog admin' }}
      compact
    />
  );
}
