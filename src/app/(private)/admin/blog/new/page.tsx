'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SeoSettings, DEFAULT_SEO_SETTINGS } from '@/types/seo'
import { serializeContentWithSeo } from '@/lib/seo-parser'
import { SeoPanel } from '@/components/admin/SeoPanel'
import { CustomEditor } from '@/components/admin/CustomEditor'

type SeoTabType = 'basic' | 'social' | 'schema' | 'advanced' | 'toc'

export default function NewBlogPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false,
    pinned: false,
    authorName: ''
  })

  // SEO state
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS)
  const [seoExpanded, setSeoExpanded] = useState(true)
  const [seoTab, setSeoTab] = useState<SeoTabType>('basic')

  // Helper to update single SEO field
  const updateSeoField = <K extends keyof SeoSettings>(field: K, value: SeoSettings[K]) => {
    setSeoSettings(prev => ({ ...prev, [field]: value }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Serialize SEO settings into content before saving
      const finalContent = serializeContentWithSeo(seoSettings, formData.content)

      const payload = {
        title: formData.title,
        slug: formData.slug || undefined, // let server generate from title if empty
        excerpt: formData.excerpt || undefined,
        content: finalContent, // Content WITH SEO block
        published: formData.published,
        pinned: formData.pinned,
        authorName: formData.authorName || undefined,
      }

      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      let data: any = {};
      try { 
        data = await response.json(); 
      } catch { 
        /* ignore */ 
      }

      if (!response.ok) {
        // SEE THE ACTUAL ERROR
        console.error('Create post failed:', data);
        const msg =
          data?.code === 'SLUG_EXISTS' ? 'Slug already exists.'
          : data?.code === 'P2003'     ? 'Invalid author (foreign key).'
          : data?.code === 'P2011'     ? 'DB requires a non-null field (likely authorId).'
          : data?.code === 'P2000'     ? 'One of the values is too long for its column.'
          : data?.code === 'BAD_JSON' || data?.code === 'UNSUPPORTED_CONTENT_TYPE'
                                      ? 'Admin form is not sending JSON.'
          : data?.code === 'VALIDATION_FAILED'
                                      ? 'Validation failed. Check title/slug/booleans.'
          : data?.error || 'Failed to create post';
        throw new Error(msg);
      }

      // success: redirect to the new post
      if (data.post?.slug) {
        router.push(`/blog/${data.post.slug}`);
      } else {
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert(error instanceof Error ? error.message : 'Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">New Blog Post</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-200 hover:text-white border border-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /blog/{formData.slug}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author Name
            </label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Will Smith, Alex Burnett, etc."
            />
            <p className="text-xs text-gray-500 mt-1">
              The name that will appear as &quot;By [Author Name]&quot; on the blog post
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description for the blog listing page..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <CustomEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the toolbar above to format your text. What you see is exactly what will appear on the frontend.
            </p>
          </div>

          {/* SEO Settings Panel */}
          <SeoPanel
            seoSettings={seoSettings}
            onUpdate={updateSeoField}
            post={{
              title: formData.title,
              excerpt: formData.excerpt,
              slug: formData.slug,
              authorName: formData.authorName,
            }}
            expanded={seoExpanded}
            onToggleExpanded={() => setSeoExpanded(!seoExpanded)}
            activeTab={seoTab}
            onTabChange={setSeoTab}
            content={formData.content}
          />

          <div className="mt-6 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Publish immediately
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pinned"
                checked={formData.pinned}
                onChange={(e) => setFormData(prev => ({ ...prev, pinned: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="pinned" className="ml-2 block text-sm text-gray-700">
                Pin to top
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-200 hover:text-white hover:border-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  )
}