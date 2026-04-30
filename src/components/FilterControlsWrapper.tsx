'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, Suspense, useEffect, useRef, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import FilterControls from '@/components/FilterControls';
import { useSearchLoading } from '@/context/SearchLoadingContext';
import type { FilterState } from '@/types/offer';

function FilterControlsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrlSearchRef = useRef<string>('');
  const [isPending, startTransition] = useTransition();
  const { setIsSearching } = useSearchLoading();

  // Sync loading state with context
  useEffect(() => {
    setIsSearching(isPending);
  }, [isPending, setIsSearching]);

  // Get current filter values from URL (single source of truth)
  const urlSearchTerm = searchParams.get('search') || '';
  const filters: FilterState = {
    searchTerm: urlSearchTerm,
    whopCategory: (searchParams.get('whopCategory') || '') as any,
    sortBy: (searchParams.get('sortBy') || '') as FilterState['sortBy'],
    promoType: '',
    whop: '',
  };

  // Sync input value with URL when navigating (back/forward), but only if input isn't focused
  useEffect(() => {
    const input = document.getElementById('main-search-input') as HTMLInputElement;
    if (!input) return;

    // Only sync if URL changed externally (not from typing)
    if (urlSearchTerm !== lastUrlSearchRef.current) {
      // Don't sync if user is actively typing (input is focused)
      if (document.activeElement !== input) {
        input.value = urlSearchTerm;
      }
      lastUrlSearchRef.current = urlSearchTerm;
    }
  }, [urlSearchTerm]);

  // Debounced search - only updates URL after user stops typing
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    // Reset to page 1 when search changes
    params.delete('page');

    // Use startTransition to track pending state
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, 300);

  // Handle all filter changes
  const onFilterChange = useCallback((next: Partial<FilterState>) => {
    // Search is debounced
    if (next.searchTerm !== undefined) {
      debouncedSearch(next.searchTerm);
      return;
    }

    // Category/sort changes are immediate
    const params = new URLSearchParams(searchParams.toString());

    if (next.whopCategory !== undefined) {
      if (next.whopCategory) {
        params.set('whopCategory', String(next.whopCategory));
      } else {
        params.delete('whopCategory');
      }
    }

    if (next.sortBy !== undefined) {
      if (next.sortBy) {
        params.set('sortBy', String(next.sortBy));
      } else {
        params.delete('sortBy');
      }
    }

    // Reset to page 1 when filters change
    params.delete('page');

    // Use startTransition to track pending state
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [router, pathname, searchParams, debouncedSearch]);

  // Handle form submit (Enter key)
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const search = (data.get('search') || '').toString().trim();

    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page');

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [router, pathname, searchParams]);

  return (
    <FilterControls
      filters={filters}
      onFilterChange={onFilterChange}
      onSubmit={onSubmit}
      casinos={[]}
      submitMode="auto"
      isLoading={isPending}
    />
  );
}

// Wrap in Suspense as required by useSearchParams
export default function FilterControlsWrapper() {
  return (
    <Suspense fallback={<div className="h-14 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl" />}>
      <FilterControlsInner />
    </Suspense>
  );
}
