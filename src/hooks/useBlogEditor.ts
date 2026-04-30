/**
 * Blog Editor State Management Hook
 * Handles SEO settings parsing/serialization and editor state
 */

import { useState, useEffect } from 'react';
import { SeoSettings, DEFAULT_SEO_SETTINGS } from '@/types/seo';
import { parseContentWithSeo, serializeContentWithSeo } from '@/lib/seo-parser';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  content: string;
  published: boolean;
  pinned?: boolean;
}

interface UseBlogEditorOptions {
  initialPost?: BlogPost;
}

export type SeoTabType = 'basic' | 'social' | 'schema' | 'advanced' | 'toc';

export function useBlogEditor(options: UseBlogEditorOptions = {}) {
  const { initialPost } = options;

  // Core post fields
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [authorName, setAuthorName] = useState(initialPost?.authorName || '');
  const [published, setPublished] = useState(initialPost?.published || false);
  const [pinned, setPinned] = useState(initialPost?.pinned || false);

  // Content (without SEO block)
  const [content, setContent] = useState('');

  // SEO settings (parsed from content)
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS);

  // SEO panel state
  const [seoExpanded, setSeoExpanded] = useState(true);
  const [seoTab, setSeoTab] = useState<SeoTabType>('basic');

  // Parse content on initial load
  useEffect(() => {
    if (initialPost?.content) {
      const { seoSettings: parsed, content: clean } = parseContentWithSeo(
        initialPost.content
      );
      setSeoSettings(parsed);
      setContent(clean);
    }
  }, [initialPost?.content]);

  // Helper to update single SEO field
  const updateSeoField = <K extends keyof SeoSettings>(
    field: K,
    value: SeoSettings[K]
  ) => {
    setSeoSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Get final content for saving (with SEO block prepended)
  const getFinalContent = (): string => {
    return serializeContentWithSeo(seoSettings, content);
  };

  // Get data for save
  const getPostData = (): BlogPost => ({
    id: initialPost?.id,
    title,
    slug,
    excerpt,
    authorName,
    content: getFinalContent(),
    published,
    pinned,
  });

  // Generate slug from title
  const generateSlug = (titleText: string) => {
    return titleText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle title change with auto-slug generation
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Only auto-generate slug if it matches the generated slug from current title
    if (slug === generateSlug(title) || !slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Reset to initial state
  const reset = () => {
    if (initialPost) {
      setTitle(initialPost.title);
      setSlug(initialPost.slug);
      setExcerpt(initialPost.excerpt);
      setAuthorName(initialPost.authorName);
      setPublished(initialPost.published);
      setPinned(initialPost.pinned || false);
      const { seoSettings: parsed, content: clean } = parseContentWithSeo(
        initialPost.content
      );
      setSeoSettings(parsed);
      setContent(clean);
    } else {
      setTitle('');
      setSlug('');
      setExcerpt('');
      setAuthorName('');
      setPublished(false);
      setPinned(false);
      setSeoSettings(DEFAULT_SEO_SETTINGS);
      setContent('');
    }
  };

  return {
    // Core fields
    title,
    setTitle,
    slug,
    setSlug,
    excerpt,
    setExcerpt,
    authorName,
    setAuthorName,
    published,
    setPublished,
    pinned,
    setPinned,

    // Content
    content,
    setContent,

    // SEO
    seoSettings,
    setSeoSettings,
    updateSeoField,

    // SEO panel state
    seoExpanded,
    setSeoExpanded,
    seoTab,
    setSeoTab,

    // Actions
    getFinalContent,
    getPostData,
    handleTitleChange,
    generateSlug,
    reset,
  };
}
