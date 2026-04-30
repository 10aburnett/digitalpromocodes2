'use client';

import { SeoSettings } from '@/types/seo';

interface Props {
  seoSettings: SeoSettings;
  onUpdate: <K extends keyof SeoSettings>(field: K, value: SeoSettings[K]) => void;
}

export function SeoAdvancedTab({ seoSettings, onUpdate }: Props) {
  return (
    <div className="space-y-6">
      {/* Robots */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-3 text-gray-500">
          Search Engine Indexing
        </label>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={seoSettings.noIndex}
              onChange={(e) => onUpdate('noIndex', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">
              Hide from search engines (noindex)
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={seoSettings.noFollow}
              onChange={(e) => onUpdate('noFollow', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">
              Don&apos;t follow links (nofollow)
            </span>
          </label>
        </div>

        <p className="text-xs mt-2 text-gray-500">
          Current robots meta:{' '}
          <code className="bg-gray-100 px-1 rounded">
            {seoSettings.noIndex ? 'noindex' : 'index'},{' '}
            {seoSettings.noFollow ? 'nofollow' : 'follow'}
          </code>
        </p>
      </div>

      {/* Custom Head Code */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5 text-gray-500">
          Custom &lt;head&gt; Code
        </label>
        <textarea
          value={seoSettings.customHeadCode || ''}
          onChange={(e) => onUpdate('customHeadCode', e.target.value || null)}
          placeholder={'<meta name="custom" content="value">\n<script type="application/ld+json">...</script>'}
          className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-300 min-h-[120px] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs mt-1 flex items-center gap-1 text-yellow-600">
          <span>Warning:</span>
          Use with caution. Invalid code can break the page.
        </p>
      </div>
    </div>
  );
}
