'use client';

import Image from 'next/image';

const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/promo-drop/okdgffccljcmmfmdikdbnchlnffcnahb';

interface PromoBannerProps {
  onDismiss: () => void;
}

export default function PromoBanner({ onDismiss }: PromoBannerProps) {
  return (
    <div
      className="sticky top-0 z-50 w-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
        boxShadow: '0 4px 12px rgba(109, 40, 217, 0.35)',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Desktop banner */}
      <div className="hidden md:flex relative items-center justify-center py-3.5 px-6">
        <a
          href={CHROME_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 no-underline"
          style={{ textDecoration: 'none' }}
        >
          <Image
            src="/promo-drop-icon.png"
            alt="Promo Drop"
            width={28}
            height={28}
            className="flex-shrink-0 rounded-md"
          />
          <span className="text-white text-base font-semibold">
            Never Search for Promo Codes Again — Get Them Automatically <span className="underline">here</span> (AND Cashback)
          </span>
          <span
            className="ml-2 flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105"
            style={{
              background: '#ffffff',
              color: '#6d28d9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            Install Free
          </span>
        </a>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss(); }}
          className="absolute right-4 flex items-center justify-center w-7 h-7 rounded-full transition-opacity opacity-60 hover:opacity-100"
          style={{ color: '#ffffff' }}
          aria-label="Dismiss banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile banner */}
      <div className="md:hidden relative flex items-center py-2.5 px-3">
        <a
          href={CHROME_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 no-underline min-w-0 flex-1 mr-7"
          style={{ textDecoration: 'none' }}
        >
          <Image
            src="/promo-drop-icon.png"
            alt="Promo Drop"
            width={24}
            height={24}
            className="flex-shrink-0 rounded"
          />
          <span className="text-white text-xs font-semibold leading-snug min-w-0">
            Never Search for Promo Codes Again — Get Them Automatically <span className="underline">here</span> (+ Cashback)
          </span>
          <span
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: '#ffffff',
              color: '#6d28d9',
            }}
          >
            Install
          </span>
        </a>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full transition-opacity opacity-60 hover:opacity-100"
          style={{ color: '#ffffff' }}
          aria-label="Dismiss banner"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
