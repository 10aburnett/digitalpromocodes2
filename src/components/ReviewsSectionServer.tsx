// Server component for reviews - renders in HTML without JS
import 'server-only';

interface Review {
  id: string;
  author?: string;
  content?: string;
  rating: number;
  createdAt?: string;
  verified?: boolean;
}

interface ReviewsSectionServerProps {
  offerId: string;
  whopName: string;
  reviews?: Review[];
}

// Helper function to calculate average rating
function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// StarRow component for consistent star display
function StarRow({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <div className={`inline-flex items-center gap-0.5 ${textSize}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ color: star <= Math.round(rating) ? 'var(--accent-color)' : 'var(--border-color)' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// Format date for display
function formatReviewDate(createdAt?: string): string {
  if (!createdAt) return 'Recently';
  try {
    const date = new Date(createdAt);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  } catch {
    return 'Recently';
  }
}

export default function ReviewsSectionServer({
  offerId,
  whopName,
  reviews = []
}: ReviewsSectionServerProps) {
  const averageRating = calculateAverageRating(reviews);
  const reviewCount = reviews.length;

  // Show first 2 reviews in SSR (rest can be revealed with JS)
  const visibleReviews = reviews.slice(0, 2);

  return (
    <section
      className="rounded-3xl border px-5 sm:px-6 py-6 sm:py-7 transition-theme"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--background-secondary)',
      }}
    >
      {/* Two-zone header: Rating block left, Form trigger right */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8 lg:items-start mb-6">
        {/* Left: Rating summary block */}
        <div
          className="rounded-2xl border p-4 sm:p-5 transition-theme"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--background-tertiary)',
          }}
        >
          <h2
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--text-color)' }}
          >
            Community feedback
          </h2>
          {reviewCount > 0 ? (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-bold"
                  style={{ color: 'var(--text-color)' }}
                >
                  {averageRating}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  /5.0
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StarRow rating={averageRating} size="md" />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Based on {reviewCount} rating{reviewCount !== 1 ? 's' : ''} from our community.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No reviews yet
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Be the first to share your experience with this offer.
              </p>
            </div>
          )}
        </div>

        {/* Right: Form zone - link to interactive version */}
        <div className="space-y-4">
          <div>
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--text-color)' }}
            >
              Share your experience
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Help others decide if this offer is right for them.
            </p>
          </div>
          {/* Note: Form button requires JS - this is a server-rendered placeholder */}
          <noscript>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Enable JavaScript to write a review.
            </p>
          </noscript>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold transition-all"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--background-tertiary)',
              color: 'var(--accent-color)',
            }}
            data-review-form-trigger="true"
          >
            Write a review
          </button>
        </div>
      </div>

      {/* Reviews List - Server rendered */}
      {reviewCount > 0 && (
        <div
          className="mt-5 pt-5 border-t transition-theme"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="space-y-3">
            {visibleReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border px-4 py-3.5 transition-all"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--background-tertiary)',
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    {/* Avatar - rounded square */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
                      style={{
                        backgroundColor: 'var(--background-tertiary)',
                        color: 'var(--accent-color)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {(review.author || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-color)' }}
                      >
                        {review.author || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRow rating={review.rating} size="sm" />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.verified && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: 'var(--background-tertiary)',
                        color: 'var(--accent-color)',
                      }}
                    >
                      Verified
                    </span>
                  )}
                </div>
                {/* Body text */}
                <p
                  className="text-sm leading-relaxed pl-11"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {review.content || ''}
                </p>
              </div>
            ))}
          </div>

          {reviews.length > 2 && (
            <div className="text-center pt-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {reviews.length - 2} more review{reviews.length - 2 !== 1 ? 's' : ''} available
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
