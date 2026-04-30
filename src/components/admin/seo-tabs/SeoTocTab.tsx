'use client';

import { useMemo } from 'react';
import { SeoSettings } from '@/types/seo';
import { extractTocHeadings } from '@/lib/toc-generator';

interface Props {
  seoSettings: SeoSettings;
  onUpdate: <K extends keyof SeoSettings>(field: K, value: SeoSettings[K]) => void;
  content: string;
}

export function SeoTocTab({ seoSettings, onUpdate, content }: Props) {
  // Parse headings from content
  const headings = useMemo(() => {
    return extractTocHeadings(content, seoSettings.tocIncludeH3);
  }, [content, seoSettings.tocIncludeH3]);

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={seoSettings.autoToc}
            onChange={(e) => onUpdate('autoToc', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Auto-generate table of contents
          </span>
        </label>
      </div>

      {seoSettings.autoToc && (
        <>
          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={seoSettings.tocIncludeH3}
                onChange={(e) => onUpdate('tocIncludeH3', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Include H3 headings</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Position:</span>
              <select
                value={seoSettings.tocPosition}
                onChange={(e) =>
                  onUpdate(
                    'tocPosition',
                    e.target.value as 'before_content' | 'after_intro'
                  )
                }
                className="px-2 py-1 text-sm rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="before_content">Before content</option>
                <option value="after_intro">After first paragraph</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-2 text-gray-500">
              Preview ({headings.length} headings detected)
            </label>

            {headings.length > 0 ? (
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-sm font-medium mb-2 text-gray-900">
                  Contents
                </p>
                <ol className="space-y-1">
                  {headings.map((h, i) => (
                    <li
                      key={i}
                      className="text-sm flex items-center justify-between text-gray-600"
                      style={{
                        paddingLeft: h.level === 3 ? '1rem' : 0,
                      }}
                    >
                      <span>
                        {h.level === 2 ? `${i + 1}. ` : '– '}
                        {h.text}
                      </span>
                      <code className="text-xs px-1 rounded bg-white text-gray-500">
                        #{h.id}
                      </code>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No H2{seoSettings.tocIncludeH3 ? '/H3' : ''} headings found in
                content
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
