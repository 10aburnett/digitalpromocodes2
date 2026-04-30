'use client';

import { useSearchLoading } from '@/context/SearchLoadingContext';

interface SearchResultsOverlayProps {
  children: React.ReactNode;
}

export default function SearchResultsOverlay({ children }: SearchResultsOverlayProps) {
  const { isSearching } = useSearchLoading();

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isSearching && (
        <div
          className="absolute inset-0 z-10 flex items-start justify-center pt-20 rounded-2xl transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(var(--background-rgb, 255, 255, 255), 0.7)' }}
        >
          <div
            className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl border shadow-lg"
            style={{
              backgroundColor: 'var(--background-color)',
              borderColor: 'var(--border-color)',
            }}
          >
            {/* Animated loading spinner */}
            <div className="relative">
              <svg
                className="animate-spin h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                style={{ color: 'var(--accent-color)' }}
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-color)' }}
            >
              Finding matching offers...
            </p>
          </div>
        </div>
      )}

      {/* Content with reduced opacity when loading */}
      <div
        className={`transition-opacity duration-200 ${isSearching ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
      >
        {children}
      </div>
    </div>
  );
}
