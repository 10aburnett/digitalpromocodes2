'use client'
import { useState } from 'react'

export default function SubscribeFormClient() {
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/mailing-list/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          source: 'subscribe_page'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setFormData({ email: '', name: '' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to subscribe' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to subscribe. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="p-8 mb-12 rounded-xl border"
      style={{ backgroundColor: 'var(--background-color)', borderColor: 'var(--border-color)' }}
    >
      {/* Inline Alert */}
      {message && (
        <div
          className="mb-6 py-3 px-4 border-l-2"
          style={{
            borderLeftColor: message.type === 'success' ? 'var(--accent-color)' : '#ef4444',
            backgroundColor: message.type === 'success' ? 'rgba(22, 101, 52, 0.05)' : 'rgba(239, 68, 68, 0.05)'
          }}
        >
          <p className="text-sm" style={{ color: message.type === 'success' ? 'var(--accent-color)' : '#ef4444' }}>
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field - Underline Style */}
        <div className="relative">
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-transparent border-0 border-b-2 px-0 py-3 text-base focus:outline-none focus:ring-0 peer transition-colors"
            style={{
              borderBottomColor: 'var(--border-color)',
              color: 'var(--text-color)'
            }}
            placeholder=" "
            required
            disabled={isSubmitting}
          />
          <label
            htmlFor="name"
            className="absolute left-0 top-3 text-sm transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Name
          </label>
          <div
            className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 peer-focus:w-full"
            style={{ backgroundColor: 'var(--accent-color)' }}
          />
        </div>

        {/* Email Field - Underline Style */}
        <div className="relative">
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full bg-transparent border-0 border-b-2 px-0 py-3 text-base focus:outline-none focus:ring-0 peer transition-colors"
            style={{
              borderBottomColor: 'var(--border-color)',
              color: 'var(--text-color)'
            }}
            placeholder=" "
            required
            disabled={isSubmitting}
          />
          <label
            htmlFor="email"
            className="absolute left-0 top-3 text-sm transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Email
          </label>
          <div
            className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 peer-focus:w-full"
            style={{ backgroundColor: 'var(--accent-color)' }}
          />
        </div>

        {/* Submit Button - Wide Pill */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-md font-medium text-base transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: 'white'
          }}
        >
          {isSubmitting ? 'Subscribing...' : 'Join the mailing list'}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          You can unsubscribe at any time. No spam, ever.
        </p>
      </form>
    </div>
  )
}
