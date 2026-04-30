'use client';

import { SeoSettings } from '@/types/seo';
import {
  SeoBasicTab,
  SeoSocialTab,
  SeoSchemaTab,
  SeoAdvancedTab,
  SeoTocTab,
} from './seo-tabs';

type SeoTabType = 'basic' | 'social' | 'schema' | 'advanced' | 'toc';

interface SeoPanelProps {
  seoSettings: SeoSettings;
  onUpdate: <K extends keyof SeoSettings>(field: K, value: SeoSettings[K]) => void;
  post: { title: string; excerpt: string; slug: string; authorName: string };
  expanded: boolean;
  onToggleExpanded: () => void;
  activeTab: SeoTabType;
  onTabChange: (tab: SeoTabType) => void;
  content: string;
}

export function SeoPanel({
  seoSettings,
  onUpdate,
  post,
  expanded,
  onToggleExpanded,
  activeTab,
  onTabChange,
  content,
}: SeoPanelProps) {
  const tabs = [
    { id: 'basic' as const, label: 'Basic' },
    { id: 'social' as const, label: 'Social' },
    { id: 'schema' as const, label: 'Schema' },
    { id: 'advanced' as const, label: 'Advanced' },
    { id: 'toc' as const, label: 'TOC' },
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden mt-6">
      {/* Header */}
      <button
        type="button"
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-800">SEO Settings</span>
        <span className="text-gray-500">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 bg-white">
            {activeTab === 'basic' && (
              <SeoBasicTab
                seoSettings={seoSettings}
                onUpdate={onUpdate}
                post={post}
              />
            )}
            {activeTab === 'social' && (
              <SeoSocialTab
                seoSettings={seoSettings}
                onUpdate={onUpdate}
                post={post}
              />
            )}
            {activeTab === 'schema' && (
              <SeoSchemaTab
                seoSettings={seoSettings}
                onUpdate={onUpdate}
                post={post}
              />
            )}
            {activeTab === 'advanced' && (
              <SeoAdvancedTab seoSettings={seoSettings} onUpdate={onUpdate} />
            )}
            {activeTab === 'toc' && (
              <SeoTocTab
                seoSettings={seoSettings}
                onUpdate={onUpdate}
                content={content}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
