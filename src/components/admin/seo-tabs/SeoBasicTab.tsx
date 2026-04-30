'use client';

import { SeoSettings } from '@/types/seo';

interface Props {
  seoSettings: SeoSettings;
  onUpdate: <K extends keyof SeoSettings>(field: K, value: SeoSettings[K]) => void;
  post: { title: string; excerpt: string; slug: string };
}

export function SeoBasicTab({ seoSettings, onUpdate, post }: Props) {
  // Computed values for preview
  const effectiveTitle =
    seoSettings.seoTitle || `${post.title} - WhopPromoCodes Blog`;
  const effectiveDescription = seoSettings.seoDescription || post.excerpt;
  const effectiveUrl =
    seoSettings.canonicalUrl ||
    `https://whoppromocodes.com/blog/${post.slug}`;

  return (
    <div className="space-y-6">
      {/* Google Preview */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2 text-gray-500">
          Google Search Preview
        </label>
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="text-lg text-blue-600 hover:underline cursor-pointer truncate">
            {effectiveTitle || 'Page Title'}
          </div>
          <div className="text-sm text-green-700 truncate">
            {effectiveUrl}
          </div>
          <div className="text-sm mt-1 text-gray-600 line-clamp-2">
            {effectiveDescription || 'Page description will appear here...'}
          </div>
        </div>
      </div>

      {/* SEO Title */}
      <SeoField
        label="SEO Title"
        value={seoSettings.seoTitle}
        placeholder={`${post.title} - WhopPromoCodes Blog`}
        onChange={(val) => onUpdate('seoTitle', val || null)}
        maxLength={60}
        showCount
      />

      {/* SEO Description */}
      <SeoField
        label="SEO Description"
        value={seoSettings.seoDescription}
        placeholder={post.excerpt || 'Enter a meta description...'}
        onChange={(val) => onUpdate('seoDescription', val || null)}
        maxLength={155}
        minLength={70}
        showCount
        multiline
      />

      {/* Canonical URL */}
      <SeoField
        label="Canonical URL"
        value={seoSettings.canonicalUrl}
        placeholder={`https://whoppromocodes.com/blog/${post.slug}`}
        onChange={(val) => onUpdate('canonicalUrl', val || null)}
      />

      {/* Keywords */}
      <SeoField
        label="Keywords"
        value={seoSettings.keywords}
        placeholder="paid communities, discord monetization, creator economy"
        onChange={(val) => onUpdate('keywords', val || null)}
        hint="Comma-separated. Low SEO impact but some users prefer it."
      />
    </div>
  );
}

// Reusable field component with character count
function SeoField({
  label,
  value,
  placeholder,
  onChange,
  maxLength,
  minLength,
  showCount,
  multiline,
  hint,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  onChange: (val: string) => void;
  maxLength?: number;
  minLength?: number;
  showCount?: boolean;
  multiline?: boolean;
  hint?: string;
}) {
  const displayValue = value || '';
  const length = displayValue.length;
  const isUsingPlaceholder = !value;

  // Color logic for count
  let countColor = 'text-gray-400';
  if (showCount && maxLength) {
    if (length > maxLength) countColor = 'text-red-500';
    else if (length > maxLength - 10) countColor = 'text-yellow-500';
    else if (length > 0) countColor = 'text-green-500';
  }

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </label>
        {isUsingPlaceholder && (
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
            Auto
          </span>
        )}
      </div>
      <InputComponent
        type="text"
        value={displayValue}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          multiline ? 'min-h-[80px] resize-y' : ''
        }`}
      />
      <div className="flex items-center justify-between mt-1">
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
        {showCount && maxLength && (
          <span className={`text-xs ml-auto ${countColor}`}>
            {length}/{maxLength}
            {minLength && length > 0 && length < minLength && (
              <span className="ml-1">(min {minLength})</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
