'use client'
import { useState, useEffect } from 'react'
import MailingListPopup from './MailingListPopup'

interface CommentFormProps {
  blogPostId: string
  onCommentSubmitted: () => void
  parentId?: string
  parentAuthor?: string
  onCancel?: () => void
}

export default function CommentForm({ blogPostId, onCommentSubmitted, parentId, parentAuthor, onCancel }: CommentFormProps) {
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    content: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showMailingListPopup, setShowMailingListPopup] = useState(false)

  // Auto-fill with @username when replying
  useEffect(() => {
    if (parentId && parentAuthor) {
      setFormData(prev => ({
        ...prev,
        content: `@${parentAuthor} `
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        content: ''
      }))
    }
  }, [parentId, parentAuthor])

  const checkEmailSubscription = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/mailing-list/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const data = await response.json()
        return data.isSubscribed || false
      }
      return false
    } catch (error) {
      console.error('Error checking email subscription:', error)
      return false // If check fails, show popup to be safe
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          blogPostId,
          parentId: parentId || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        onCommentSubmitted()

        // Check if user is already subscribed before showing popup (for both comments and replies)
        const isAlreadySubscribed = await checkEmailSubscription(formData.authorEmail)

        if (!isAlreadySubscribed) {
          // Show mailing list popup if user is not already subscribed
          console.log('User not subscribed, showing mailing list popup')
          setTimeout(() => {
            setShowMailingListPopup(true)
          }, 1500) // Small delay to let user see success message
        } else {
          console.log('User already subscribed, skipping mailing list popup')
        }

      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit comment' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit comment. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetFormData = () => {
    setFormData({
      authorName: '',
      authorEmail: '',
      content: parentId && parentAuthor ? `@${parentAuthor} ` : ''
    })
  }

  const handleMailingListClose = () => {
    setShowMailingListPopup(false)
    // Clear form data after mailing list interaction
    resetFormData()
  }

  const handleMailingListSubmit = (subscribed: boolean) => {
    // Popup component handles the API call, we just need to cleanup
    setShowMailingListPopup(false)
    resetFormData()
  }

  return (
    <>
      {showMailingListPopup && (
        <MailingListPopup
          isOpen={showMailingListPopup}
          onClose={handleMailingListClose}
          userEmail={formData.authorEmail}
          userName={formData.authorName}
          onSubmit={handleMailingListSubmit}
        />
      )}

      <section className="mt-12">
        <div
          className="rounded-xl border border-dashed px-5 py-6 md:px-7 md:py-7"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--background-color)',
          }}
        >
          {/* Header */}
          <div className="mb-6 md:mb-7 flex flex-col md:flex-row md:items-baseline md:justify-between gap-3">
            <div>
              <h3
                className="text-xl md:text-2xl font-semibold tracking-tight"
                style={{ color: 'var(--text-color)' }}
              >
                Add your perspective
              </h3>
              <p className="text-sm md:text-xs mt-1 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                Thoughtful comments give other readers real-world context on how these tools and promos work in practice.
              </p>
            </div>

            {/* Reply pill if active */}
            {parentId && parentAuthor && (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs"
                  style={{
                    backgroundColor: 'rgba(5,150,105,0.08)',
                    color: 'var(--accent-color)',
                  }}
                >
                  Replying to {parentAuthor}
                </span>
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs px-3 py-1 rounded-full border transition-colors hover:opacity-80"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--background-secondary)',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name..."
                  required
                  disabled={isSubmitting}
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, authorName: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--background-secondary)',
                    color: 'var(--text-color)',
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  disabled={isSubmitting}
                  value={formData.authorEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, authorEmail: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--background-secondary)',
                    color: 'var(--text-color)',
                  }}
                />
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Your email won&apos;t be shown publicly.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Your comment
              </label>
              <textarea
                placeholder="Share your experience, question, or takeaway…"
                required
                disabled={isSubmitting}
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full min-h-[120px] rounded-lg border px-3 py-2 text-sm leading-relaxed"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--background-secondary)',
                  color: 'var(--text-color)',
                }}
              />
            </div>

            {/* Status message */}
            {message && (
              <p
                className="text-xs"
                style={{
                  color:
                    message.type === 'success'
                      ? 'var(--accent-color)'
                      : '#ef4444',
                }}
              >
                {message.text}
              </p>
            )}

            <div className="flex flex-col gap-3 items-start sm:flex-row sm:items-center sm:justify-between pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                }}
              >
                {isSubmitting
                  ? 'Publishing…'
                  : parentId
                  ? 'Publish reply'
                  : 'Publish comment'}
              </button>

              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                By commenting, you agree to keep the discussion constructive and on-topic.
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
