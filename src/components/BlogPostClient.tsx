'use client'
import { useState } from 'react'
import Link from 'next/link'
import CommentForm from '@/components/CommentForm'
import CommentsList from '@/components/CommentsList'
import RelatedPosts from '@/components/RelatedPosts'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  publishedAt: string | null
  slug: string
  readingTime: number
  headings: Array<{
    id: string
    text: string
    level: number
  }>
  authorName?: string | null
  author?: {
    name: string
  }
}

interface BlogPostClientProps {
  post: BlogPost
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const [refreshComments, setRefreshComments] = useState(0)
  const [replyTo, setReplyTo] = useState<{ parentId: string, parentAuthor: string } | null>(null)
  const [showToc, setShowToc] = useState(false)
  
  // Show table of contents for posts with 3+ headings
  const shouldShowToc = post.headings && post.headings.length >= 3

  const handleCommentSubmitted = () => {
    setRefreshComments(prev => prev + 1)
    setReplyTo(null) // Clear reply state after submission
  }

  const handleReply = (parentId: string, parentAuthor: string) => {
    setReplyTo({ parentId, parentAuthor })
    // Scroll to comment form
    setTimeout(() => {
      document.querySelector('[data-comment-form]')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleCancelReply = () => {
    setReplyTo(null)
  }

  return (
    <div className="min-h-screen py-12 transition-theme" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
      <div className="mx-auto w-[90%] md:w-[94%] max-w-[1100px]">
        <div className="space-y-8">
          {/* Breadcrumb Navigation - Simplified slash format */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li>
                <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-color)' }}>
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-color)' }}>
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="truncate max-w-[12rem]" style={{ color: 'var(--text-muted)' }}>
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Article */}
          <article>
            {/* Flat Editorial Header */}
            <header className="mb-8 md:mb-10">
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--accent-color)' }}
              >
                WhopPromoCodes blog
              </p>

              <h1
                className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold tracking-tight mb-4"
                style={{ color: 'var(--text-color)', lineHeight: 1.15 }}
              >
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm"
                   style={{ color: 'var(--text-secondary)' }}>
                {post.publishedAt && (
                  <time>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}

                {(post.authorName || post.author?.name) && (
                  <span>• {post.authorName || post.author?.name}</span>
                )}

                <span>• {post.readingTime} min read</span>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] md:text-xs"
                   style={{
                     backgroundColor: 'rgba(5,150,105,0.06)',
                     color: 'var(--accent-color)',
                   }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent-color)]" />
                Updated periodically as offers change
              </div>
            </header>

            {/* Mobile Table of Contents Toggle */}
            {shouldShowToc && (
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowToc(!showToc)}
                  className="flex w-full items-center justify-between rounded-xl border px-4 py-3"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-color)',
                  }}
                >
                  <span className="font-medium text-sm">{showToc ? 'Hide outline' : 'Show outline'}</span>
                  <svg
                    className={`h-5 w-5 transition-transform ${showToc ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showToc && (
                  <div className="mt-4 p-4 rounded-xl border" style={{
                    backgroundColor: 'var(--background-secondary)',
                    borderColor: 'var(--border-color)'
                  }}>
                    <nav className="space-y-1.5">
                      {post.headings.map((heading, index) => (
                        <a
                          key={index}
                          href={`#${heading.id}`}
                          onClick={() => setShowToc(false)}
                          className="block text-sm hover:opacity-80 transition-opacity"
                          style={{
                            color: 'var(--text-secondary)',
                            paddingLeft: `${(heading.level - 1) * 12}px`
                          }}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            )}

          </article>

          {/* Full-width green background band */}
          <section
            aria-label="Article content"
            className="py-10 md:py-14 relative"
            style={{
              marginLeft: 'calc(50% - 50vw)',
              marginRight: 'calc(50% - 50vw)',
              background:
                'radial-gradient(circle at 0% 0%, rgba(8, 150, 105, 0.10), transparent 55%)',
              borderTop: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {/* Content container matching page width */}
            <div className="mx-auto w-[90%] md:w-[94%] max-w-[1100px]">
              <div className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
                {/* Table of Contents - left rail (desktop) */}
                {shouldShowToc && (
                  <div className="hidden lg:block">
                    <div
                      className="sticky top-36 rounded-xl border p-5 shadow-sm"
                      style={{
                        backgroundColor: 'var(--background-secondary)',
                        borderColor: 'var(--border-color)',
                        maxHeight: 'calc(100vh - 160px)',
                        overflowY: 'auto',
                      }}
                    >
                      <h3
                        className="mb-3 text-sm font-semibold uppercase tracking-wide sticky top-0 pb-2"
                        style={{
                          color: 'var(--text-muted)',
                          backgroundColor: 'var(--background-secondary)',
                        }}
                      >
                        On this page
                      </h3>
                      <nav className="space-y-1.5">
                        {post.headings.map((heading, index) => (
                          <a
                            key={index}
                            href={`#${heading.id}`}
                            className="block text-sm transition-opacity hover:opacity-80"
                            style={{
                              color: 'var(--text-secondary)',
                              paddingLeft: `${(heading.level - 1) * 12}px`,
                            }}
                          >
                            {heading.text}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>
                )}

                {/* Main article content */}
                <div className={shouldShowToc ? '' : 'lg:col-span-2'}>
                  <div className="max-w-[820px]">
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                      Last updated for accuracy and clarity. Some details may change over time.
                    </p>

                    <div
                      className="relative mt-2 pl-4 md:pl-6 border-l"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div
                        className="prose prose-lg max-w-none blog-content"
                        style={{
                          color: 'var(--text-color)',
                          '--tw-prose-headings': 'var(--text-color)',
                          '--tw-prose-links': 'var(--accent-color)',
                        } as React.CSSProperties}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Comments Section – full width */}
          <div className="mt-12 space-y-8">
            <CommentsList
              blogPostId={post.id}
              refreshTrigger={refreshComments}
              onReply={handleReply}
            />
            <div data-comment-form>
              <CommentForm
                blogPostId={post.id}
                onCommentSubmitted={handleCommentSubmitted}
                parentId={replyTo?.parentId}
                parentAuthor={replyTo?.parentAuthor}
                onCancel={replyTo ? handleCancelReply : undefined}
              />
            </div>
          </div>

          {/* Related Posts – sits underneath the comment form */}
          <div className="mt-10">
            <RelatedPosts
              currentPostId={post.id}
              currentPostTitle={post.title}
            />
          </div>

          {/* Navigation */}
          <div className="mt-16 flex justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center rounded-full px-7 py-3 text-sm font-semibold shadow-sm hover:shadow-md transition"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'white',
              }}
            >
              Browse all posts
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}