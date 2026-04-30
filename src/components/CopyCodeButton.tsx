'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface CopyCodeButtonProps {
  code: string;
  size?: 'default' | 'large';
  offerId?: string;
  promoCodeId?: string;
  showUsageCount?: boolean;
  isSticky?: boolean;
}

export default function CopyCodeButton({
  code,
  size = 'default',
  offerId,
  promoCodeId,
  showUsageCount = false,
  isSticky = false,
}: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);

  // Truncate code for compact variants
  const displayCode =
    size === 'large'
      ? code
      : code.length > 10
      ? `${code.slice(0, 10)}..`
      : code;

  const fetchUsageCount = useCallback(async () => {
    if (!showUsageCount || !promoCodeId) return;

    try {
      const response = await fetch(`/api/tracking?bonusId=${promoCodeId}`);
      if (response.ok) {
        const data = await response.json();
        setUsageCount(data.usageCount);
      }
    } catch (error) {
      console.error('Error fetching usage count:', error);
    }
  }, [showUsageCount, promoCodeId]);

  // Fetch usage count when needed
  useEffect(() => {
    fetchUsageCount();
  }, [fetchUsageCount]);

  const trackCopyCode = useCallback(async () => {
    if (!offerId || !promoCodeId) return;

    try {
      const trackingData = JSON.stringify({
        casinoId: offerId,   // Using offerId as casinoId for API compatibility
        bonusId: promoCodeId, // Using promoCodeId as bonusId for API compatibility
        actionType: 'code_copy',
      });

      // Prefer sendBeacon for reliability on navigation
      if (navigator.sendBeacon) {
        const blob = new Blob([trackingData], { type: 'application/json' });
        const success = navigator.sendBeacon('/api/tracking', blob);
        if (success) return;
      }

      // Fallback to fetch
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: trackingData,
      });
    } catch (error) {
      console.error('Error tracking code copy:', error);
    }
  }, [offerId, promoCodeId]);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      trackCopyCode();

      // Reset copied state
      window.setTimeout(() => setCopied(false), 2000);

      // Refresh usage count shortly after copy
      if (showUsageCount) {
        window.setTimeout(() => {
          fetchUsageCount();
        }, 800);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Base visual style — use theme variables instead of hard-coded hex
  const baseButtonClasses =
    'inline-flex items-center justify-between gap-2 font-medium text-white transition-all duration-200 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-[var(--background-color)] group';

  // Size-specific layout
  const sizeClasses =
    size === 'large'
      ? 'w-full rounded-full px-5 py-3 text-lg md:text-xl'
      : isSticky
      ? 'min-w-[130px] h-[40px] md:h-[44px] rounded-full px-4 py-2 md:py-2.5 text-sm md:text-base'
      : 'min-w-[110px] rounded-full px-3.5 py-2 text-sm md:text-base';

  // Color mode – sticky vs normal (still using theme variables)
  const colorClasses = isSticky
    ? 'bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 shadow-theme-promo border border-transparent'
    : 'bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] shadow-theme-promo border border-[var(--border-color)]';

  // Motion: smooth, subtle lift instead of harsh scale jiggle
  const motionClasses = 'hover:-translate-y-0.5 active:translate-y-[1px]';

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={handleCopy}
        className={`${baseButtonClasses} ${sizeClasses} ${colorClasses} ${motionClasses}`}
        title={code}
        aria-label={copied ? 'Promo code copied' : `Copy promo code ${code}`}
      >
        <div className={`flex items-center justify-center ${size !== 'large' ? 'flex-1 mr-1.5' : 'flex-1'}`}>
          <span
            className={
              size === 'large'
                ? 'text-xl md:text-2xl font-semibold'
                : isSticky
                ? 'text-base md:text-lg font-semibold'
                : 'text-sm md:text-base font-medium'
            }
          >
            {copied ? 'Copied!' : displayCode}
          </span>
        </div>

        <div
          className={`${size === 'large' ? 'ml-2' : 'ml-2'} flex flex-col items-center ${
            isSticky ? 'min-w-[30px]' : ''
          }`}
        >
          {copied ? (
            <svg
              className="w-4 h-4"
              style={{ color: 'var(--success-color)' }}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          )}

          {showUsageCount && usageCount !== null && (
            <span className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              {usageCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
