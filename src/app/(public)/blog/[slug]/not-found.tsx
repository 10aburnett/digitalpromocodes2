import ErrorState from '@/components/layout/ErrorState';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post not available | Digital Promo Codes',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlogPostNotFound() {
  return (
    <ErrorState
      variant="not-found"
      title="This post can't be found"
      description="This blog post is not available on Digital Promo Codes. It may have been moved, renamed or removed."
      primaryCta={{ href: '/blog', label: 'View all posts' }}
      secondaryCta={{ href: '/', label: 'Return to homepage' }}
    />
  );
}
