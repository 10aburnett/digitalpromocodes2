import Link from 'next/link'

interface PromoCodeSubmissionButtonProps {
  offerId: string
  offerName: string
  offerSlug?: string
}

export default function PromoCodeSubmissionButton({ offerId, offerName, offerSlug }: PromoCodeSubmissionButtonProps) {
  // Build URL with slug (preferred) or fallback to name
  const params = new URLSearchParams()
  if (offerSlug) {
    params.set('slug', offerSlug)
  }
  params.set('product', offerName)

  return (
    <Link
      href={`/submit?${params.toString()}#form`}
      className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 hover:shadow-md"
      style={{
        backgroundColor: 'var(--accent-color)',
        color: 'white',
      }}
    >
      Share a code
    </Link>
  )
}
