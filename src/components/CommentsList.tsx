'use client'
import { useState, useEffect } from 'react'

interface Comment {
  id: string
  content: string
  authorName: string
  createdAt: string
  upvotes: number
  downvotes: number
  userVote: 'UPVOTE' | 'DOWNVOTE' | null
  replies: Comment[]
}

interface CommentsListProps {
  blogPostId: string
  refreshTrigger: number
  onReply?: (parentId: string, parentAuthor: string) => void
}

const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export default function CommentsList({ blogPostId, refreshTrigger, onReply }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({})

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?blogPostId=${blogPostId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(Array.isArray(data) ? data : [])
      } else {
        setComments([])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [blogPostId, refreshTrigger])

  const handleVote = async (commentId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (votingStates[commentId]) return // Prevent double-clicking

    setVotingStates(prev => ({ ...prev, [commentId]: true }))

    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      })

      if (response.ok) {
        const data = await response.json()

        // Update the comment in state with new vote counts and user vote
        setComments(prevComments =>
          updateCommentVotes(prevComments, commentId, {
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            userVote: data.userVote
          })
        )
      }
    } catch (error) {
      console.error('Error voting on comment:', error)
    } finally {
      setVotingStates(prev => ({ ...prev, [commentId]: false }))
    }
  }

  // Helper function to recursively update vote counts in nested comments
  const updateCommentVotes = (comments: Comment[], targetId: string, voteData: { upvotes: number, downvotes: number, userVote: 'UPVOTE' | 'DOWNVOTE' | null }): Comment[] => {
    return comments.map(comment => {
      if (comment.id === targetId) {
        return {
          ...comment,
          upvotes: voteData.upvotes,
          downvotes: voteData.downvotes,
          userVote: voteData.userVote
        }
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentVotes(comment.replies, targetId, voteData)
        }
      }
      return comment
    })
  }

  const renderComment = (comment: Comment, depth = 0) => {
    const netScore = comment.upvotes - comment.downvotes
    const isVoting = votingStates[comment.id]

    return (
      <>
        {/* Header: name + timestamp */}
        <div className="mb-1 flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>
            {comment.authorName || 'Anonymous'}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatTimestamp(comment.createdAt)}
          </span>
        </div>

        {/* Comment text */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
          {comment.content}
        </p>

        {/* Footer actions */}
        <div className="mt-3 flex items-center gap-4">
          {/* Vote buttons - compact inline */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote(comment.id, 'UPVOTE')}
              disabled={isVoting}
              className={`p-1 rounded transition-colors ${
                comment.userVote === 'UPVOTE'
                  ? 'text-green-500'
                  : 'hover:text-green-500'
              } ${isVoting ? 'opacity-50' : ''}`}
              style={{ color: comment.userVote === 'UPVOTE' ? undefined : 'var(--text-muted)' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <span
              className={`text-xs font-medium min-w-[1.5rem] text-center ${
                netScore > 0 ? 'text-green-500' :
                netScore < 0 ? 'text-red-500' : ''
              }`}
              style={{ color: netScore === 0 ? 'var(--text-muted)' : undefined }}
            >
              {netScore}
            </span>

            <button
              onClick={() => handleVote(comment.id, 'DOWNVOTE')}
              disabled={isVoting}
              className={`p-1 rounded transition-colors ${
                comment.userVote === 'DOWNVOTE'
                  ? 'text-red-500'
                  : 'hover:text-red-500'
              } ${isVoting ? 'opacity-50' : ''}`}
              style={{ color: comment.userVote === 'DOWNVOTE' ? undefined : 'var(--text-muted)' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Reply button as pill */}
          {onReply && (
            <button
              onClick={() => onReply(comment.id, comment.authorName)}
              className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
              style={{
                backgroundColor: 'rgba(5,150,105,0.1)',
                color: 'var(--accent-color)',
              }}
            >
              Reply
            </button>
          )}
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 pl-4 border-l" style={{ borderColor: 'var(--border-color)' }}>
            {comment.replies.map(reply => (
              <div key={reply.id} className="pt-3">
                {renderComment(reply, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  if (loading) {
    return (
      <section
        className="border-t pt-10"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-color)' }}>
            Comments
          </h3>
          <div
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: 'var(--background-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            Loading…
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="relative pl-8">
              <div
                className="absolute left-0 top-3 h-full w-px"
                style={{ backgroundColor: 'var(--border-color)', opacity: 0.7 }}
              />
              <div
                className="rounded-xl border animate-pulse"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                <div className="flex gap-3 px-4 py-3">
                  <div
                    className="h-9 w-9 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--text-muted)', opacity: 0.2 }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 w-1/4 rounded"
                      style={{ backgroundColor: 'var(--text-muted)', opacity: 0.25 }}
                    />
                    <div
                      className="h-3 w-3/4 rounded"
                      style={{ backgroundColor: 'var(--text-muted)', opacity: 0.25 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      className="border-t pt-10"
      style={{ borderColor: 'var(--border-color)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-xl md:text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--text-color)' }}
        >
          Comments
        </h3>
        <div
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: 'var(--background-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          {(comments?.length || 0) === 1
            ? '1 comment'
            : `${comments?.length || 0} comments`}
        </div>
      </div>

      {/* Empty state */}
      {!comments || comments.length === 0 ? (
        <div className="py-10">
          <p
            className="text-sm md:text-base text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            No comments yet. Be the first to share your take on this article.
          </p>
        </div>
      ) : (
        // Timeline-style list (no big inner card)
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="relative pl-9">
              {/* Vertical line */}
              <div
                className="absolute left-3 top-4 bottom-0 w-px"
                style={{ backgroundColor: 'var(--border-color)', opacity: 0.7 }}
              />
              {/* Avatar */}
              <div
                className="absolute left-0 top-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(5,150,105,0.1)',
                  color: 'var(--accent-color)',
                }}
              >
                {comment.authorName?.[0]?.toUpperCase() ?? '•'}
              </div>

              {/* Comment card – flatter, no heavy shadow */}
              <div
                className="rounded-xl border px-4 py-3 md:px-5 md:py-4"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--background-secondary)',
                }}
              >
                {renderComment(comment)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
