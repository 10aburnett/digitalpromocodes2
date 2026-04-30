'use client';

import Link from 'next/link';
import React from 'react';

// SVG Icons for error states
const SearchIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const AlertIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

interface ErrorStateProps {
  title: string;
  description: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  onRetry?: () => void;
  variant?: 'not-found' | 'error';
  compact?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  primaryCta,
  secondaryCta,
  onRetry,
  variant = 'not-found',
  compact = false,
}) => {
  return (
    <main
      className={`flex items-center justify-center px-4 ${compact ? 'min-h-[50vh]' : 'min-h-[70vh]'}`}
      style={{ backgroundColor: 'var(--background-color)' }}
    >
      <div className="max-w-lg w-full text-center space-y-5">
        {/* Icon */}
        <div className="flex items-center justify-center">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor:
                variant === 'not-found'
                  ? 'rgba(8,145,178,0.10)'
                  : 'rgba(239,68,68,0.10)',
              color:
                variant === 'not-found'
                  ? 'var(--accent-color)'
                  : '#ef4444',
            }}
            aria-hidden="true"
          >
            {variant === 'not-found' ? <SearchIcon /> : <AlertIcon />}
          </div>
        </div>

        <div className="space-y-2">
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: 'var(--text-color)' }}
          >
            {title}
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'white',
              }}
            >
              Try again
            </button>
          )}
          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all"
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'white',
              }}
            >
              {primaryCta.label}
            </Link>
          )}
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold hover:-translate-y-[1px] transition-all"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-color)',
              }}
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
};

export default ErrorState;
