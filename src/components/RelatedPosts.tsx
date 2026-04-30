'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string | null
  authorName?: string | null
  author?: { name?: string | null } | null
}

interface RelatedPostsProps {
  currentPostId: string
  currentPostTitle: string
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function RelatedPosts({ currentPostId, currentPostTitle }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const response = await fetch(`/api/blog/related?postId=${currentPostId}&title=${encodeURIComponent(currentPostTitle)}`)
        if (response.ok) {
          const data = await response.json()
          setRelatedPosts(data.posts || [])
        }
      } catch (error) {
        console.error('Error fetching related posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedPosts()
  }, [currentPostId, currentPostTitle])

  if (loading) {
    return (
      <section aria-label="Related reading" className="space-y-4">
        <h3 className="text-lg font-semibold mb-4 tracking-tight" style={{ color: 'var(--text-color)' }}>
          Related reading
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2].map(i => (
            <div
              key={i}
              className="rounded-xl border p-4 flex gap-4 animate-pulse"
              style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex-1 space-y-2">
                <div
                  className="h-3 w-1/3 rounded"
                  style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }}
                />
                <div
                  className="h-4 w-full rounded"
                  style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }}
                />
                <div
                  className="h-3 w-3/4 rounded"
                  style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (relatedPosts.length === 0) {
    return null
  }

  // Only show first 2 posts for compact sidebar layout
  const displayPosts = relatedPosts.slice(0, 2)

  return (
    <section aria-label="Related reading">
      <h3
        className="text-lg font-semibold mb-4 tracking-tight"
        style={{ color: 'var(--text-color)' }}
      >
        Related reading
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {displayPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <article
              className="group flex gap-4 rounded-xl border p-4 hover:shadow-sm transition-all duration-200"
              style={{
                backgroundColor: 'var(--background-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex-1 space-y-1.5">
                <time
                  className="text-[11px] uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatDate(post.publishedAt)}
                </time>

                <h4
                  className="text-sm font-semibold line-clamp-2 group-hover:opacity-90"
                  style={{ color: 'var(--text-color)' }}
                >
                  {post.title}
                </h4>

                {post.excerpt && (
                  <p
                    className="text-xs line-clamp-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {post.excerpt}
                  </p>
                )}
              </div>

              <span
                className="self-end mb-1 inline-flex items-center text-[11px] font-medium"
                style={{ color: 'var(--accent-color)' }}
              >
                Read
                <svg
                  className="ml-1 h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </span>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
