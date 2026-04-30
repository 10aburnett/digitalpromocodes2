'use client';

import { useState } from 'react';
import { SeoSettings } from '@/types/seo';

interface Props {
  seoSettings: SeoSettings;
  onUpdate: <K extends keyof SeoSettings>(field: K, value: SeoSettings[K]) => void;
  post: { title: string; excerpt: string; slug: string };
}

export function SeoSocialTab({ seoSettings, onUpdate, post }: Props) {
  const [previewPlatform, setPreviewPlatform] = useState<
    'twitter' | 'facebook' | 'linkedin'
  >('twitter');

  // Computed values
  const effectiveTitle =
    seoSettings.ogTitle || seoSettings.seoTitle || post.title;
  const effectiveDescription =
    seoSettings.ogDescription || seoSettings.seoDescription || post.excerpt;
  const effectiveImage = seoSettings.featuredImage || '/og.png';

  return (
    <div className="space-y-6">
      {/* Platform Toggle */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2 text-gray-500">
          Social Card Preview
        </label>
        <div className="flex gap-2 mb-3">
          {(['twitter', 'facebook', 'linkedin'] as const).map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => setPreviewPlatform(platform)}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize ${
                previewPlatform === platform
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>

        {/* Card Preview */}
        <div className="rounded-lg border border-gray-200 overflow-hidden max-w-md">
          {/* Image */}
          <div
            className="aspect-[1.91/1] bg-cover bg-center bg-gray-200"
            style={{
              backgroundImage: effectiveImage ? `url(${effectiveImage})` : undefined,
            }}
          >
            {!effectiveImage && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No image
              </div>
            )}
          </div>
          {/* Content */}
          <div className="p-3 bg-gray-50">
            <div className="text-xs uppercase mb-1 text-gray-400">
              whoppromocodes.com
            </div>
            <div className="font-semibold text-sm mb-1 line-clamp-2 text-gray-900">
              {effectiveTitle || 'Page Title'}
            </div>
            <div className="text-xs line-clamp-2 text-gray-600">
              {effectiveDescription || 'Page description...'}
            </div>
          </div>
        </div>
      </div>

      {/* OG Title Override */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-gray-500">
          Social Title (optional override)
        </label>
        <input
          type="text"
          value={seoSettings.ogTitle || ''}
          placeholder={seoSettings.seoTitle || post.title}
          onChange={(e) => onUpdate('ogTitle', e.target.value || null)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* OG Description Override */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-gray-500">
          Social Description (optional override)
        </label>
        <textarea
          value={seoSettings.ogDescription || ''}
          placeholder={seoSettings.seoDescription || post.excerpt}
          onChange={(e) => onUpdate('ogDescription', e.target.value || null)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Featured Image */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-gray-500">
          Featured Image
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={seoSettings.featuredImage || ''}
            placeholder="/og.png (default)"
            onChange={(e) => onUpdate('featuredImage', e.target.value || null)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs mt-1 text-gray-500">
          Recommended: 1200x630px for optimal social sharing
        </p>
      </div>

      {/* Twitter Card Type */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-gray-500">
          Twitter Card Type
        </label>
        <select
          value={seoSettings.twitterCard}
          onChange={(e) =>
            onUpdate(
              'twitterCard',
              e.target.value as 'summary' | 'summary_large_image'
            )
          }
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="summary_large_image">Large Image</option>
          <option value="summary">Small Image</option>
        </select>
      </div>
    </div>
  );
}
