// Wrapper for offer-detail content sections.
// Alternating white / slate-50 background bands. Manrope-700 h2 with a 28px
// teal underline marker beneath (the "(b) signature" element from the design language).
// Generous vertical padding for clear section rhythm.

import { ReactNode } from 'react';

interface OfferSectionProps {
  id: string;
  title?: ReactNode;
  /** Tone determines background; alternation is the caller's responsibility. */
  tone?: 'white' | 'slate';
  /** Drop the title block (used when the section's child renders its own header). */
  hideTitle?: boolean;
  children: ReactNode;
}

export default function OfferSection({
  id,
  title,
  tone = 'white',
  hideTitle = false,
  children,
}: OfferSectionProps) {
  const bg =
    tone === 'slate' ? 'var(--background-tertiary)' : 'var(--background-secondary)';

  return (
    <section
      id={id}
      className="dpc-offer-section scroll-mt-24"
      style={{ backgroundColor: bg }}
      aria-labelledby={title ? `${id}-heading` : undefined}
    >
      <div className="mx-auto max-w-3xl xl:max-w-none px-4 lg:px-6 py-12 sm:py-16 xl:py-20">
        {!hideTitle && title && (
          <header className="mb-6 sm:mb-8">
            <h2
              id={`${id}-heading`}
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: 'var(--text-color)', lineHeight: 1.2 }}
            >
              {title}
            </h2>
            {/* Locked signature (a) — short teal underline marker beneath section heading.
                Pure Tailwind utilities (no inline style) so SSR + RSC cache + hydration are bit-identical. */}
            <span
              aria-hidden="true"
              className="block mt-3 h-[2px] w-7 rounded-full bg-[var(--accent-color)]"
              suppressHydrationWarning
            />
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
