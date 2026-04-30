'use client';

// Sticky mini-bar that pins to the top of the viewport once the user scrolls past
// the inline reveal block. Visible at <xl only — at xl+ the right rail handles persistence.
// Clicking "Reveal Code" scrolls back to the inline reveal block (which owns the
// reveal-code state machine, not us — NEW LOCK respected).

import { useEffect, useState } from 'react';

interface StickyRevealBarProps {
  brand: string;
  promoTitle?: string;
  /** CSS selector for the inline reveal anchor — bar shows after scroll past this. */
  triggerSelector?: string;
  /** Anchor href to scroll back to when clicked. */
  revealAnchor?: string;
}

export default function StickyRevealBar({
  brand,
  promoTitle,
  triggerSelector = '#offer-reveal-anchor',
  revealAnchor = '#offer-reveal-anchor',
}: StickyRevealBarProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const trigger = document.querySelector(triggerSelector);
    if (!trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Bar visible when the trigger has scrolled OFF the top of the viewport
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [triggerSelector, dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div
      className="xl:hidden fixed inset-x-0 top-0 z-50 border-b shadow-md"
      style={{
        backgroundColor: 'var(--background-color)',
        borderColor: 'var(--border-color)',
      }}
      role="region"
      aria-label="Quick reveal action"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-2.5 flex items-center gap-3">
        <div className="flex-1 min-w-0 text-sm">
          <span className="font-semibold truncate" style={{ color: 'var(--text-color)' }}>{brand}</span>
          {promoTitle && (
            <span className="ml-2 truncate" style={{ color: 'var(--text-secondary)' }}>{promoTitle}</span>
          )}
        </div>
        <a
          href={revealAnchor}
          className="flex-shrink-0 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold"
          style={{
            backgroundColor: 'var(--accent-color)',
            color: '#ffffff',
          }}
        >
          Reveal Code
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--background-tertiary)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
