'use client';

import { useState } from 'react';
import { SeoSettings, FAQItem } from '@/types/seo';

interface Props {
  seoSettings: SeoSettings;
  onUpdate: <K extends keyof SeoSettings>(field: K, value: SeoSettings[K]) => void;
  post: { title: string; excerpt: string; slug: string; authorName: string };
}

export function SeoSchemaTab({ seoSettings, onUpdate, post }: Props) {
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Generate auto schema preview
  const autoSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: seoSettings.seoDescription || post.excerpt,
    author: {
      '@type': 'Person',
      name: post.authorName || 'WhopPromoCodes Team',
    },
    datePublished: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://whoppromocodes.com/blog/${post.slug}`,
    },
  };

  // FAQ schema if present
  const faqSchema =
    seoSettings.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: seoSettings.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const validateCustomSchema = (json: string) => {
    try {
      JSON.parse(json);
      setSchemaError(null);
      return true;
    } catch (e) {
      setSchemaError('Invalid JSON');
      return false;
    }
  };

  const addFaq = () => {
    onUpdate('faqs', [...seoSettings.faqs, { question: '', answer: '' }]);
  };

  const updateFaq = (
    index: number,
    field: 'question' | 'answer',
    value: string
  ) => {
    const updated = [...seoSettings.faqs];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate('faqs', updated);
  };

  const removeFaq = (index: number) => {
    onUpdate(
      'faqs',
      seoSettings.faqs.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      {/* Auto-generated Schema Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
            BlogPosting Schema (auto-generated)
          </label>
          <button
            type="button"
            onClick={() => copyToClipboard(JSON.stringify(autoSchema, null, 2))}
            className="text-xs px-2 py-1 rounded bg-gray-100 text-blue-600 hover:bg-gray-200"
          >
            Copy JSON
          </button>
        </div>
        <pre className="p-3 rounded-lg text-xs overflow-x-auto max-h-48 bg-gray-50 text-gray-700 border border-gray-200">
          {JSON.stringify(autoSchema, null, 2)}
        </pre>
      </div>

      {/* FAQ Builder */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2 text-gray-500">
          FAQ Schema (adds rich snippets)
        </label>

        <div className="space-y-3">
          {seoSettings.faqs.map((faq, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  FAQ {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="text-red-500 text-xs hover:text-red-600"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={faq.question}
                placeholder="Question..."
                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 mb-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={faq.answer}
                placeholder="Answer..."
                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 min-h-[60px] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addFaq}
          className="mt-2 px-3 py-1.5 text-sm rounded bg-gray-100 text-blue-600 border border-dashed border-gray-300 hover:bg-gray-200"
        >
          + Add FAQ
        </button>

        {/* FAQ Schema Preview */}
        {faqSchema && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                Generated FAQ Schema:
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(JSON.stringify(faqSchema, null, 2))
                }
                className="text-xs px-2 py-1 rounded bg-gray-100 text-blue-600 hover:bg-gray-200"
              >
                Copy JSON
              </button>
            </div>
            <pre className="p-3 rounded-lg text-xs overflow-x-auto max-h-32 bg-gray-50 text-gray-700 border border-gray-200">
              {JSON.stringify(faqSchema, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Custom Schema Override */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="useCustomSchema"
            checked={seoSettings.useCustomSchema}
            onChange={(e) => onUpdate('useCustomSchema', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="useCustomSchema" className="text-sm text-gray-700">
            Use custom schema (replaces auto-generated)
          </label>
        </div>

        {seoSettings.useCustomSchema && (
          <>
            <textarea
              value={seoSettings.customSchema || ''}
              onChange={(e) => {
                onUpdate('customSchema', e.target.value || null);
                if (e.target.value) validateCustomSchema(e.target.value);
              }}
              placeholder='{"@context": "https://schema.org", ...}'
              className={`w-full px-3 py-2 text-sm font-mono rounded-lg border min-h-[150px] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                schemaError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {schemaError && (
              <p className="text-xs text-red-500 mt-1">{schemaError}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
