// Shared "Verified" chip — Digital Promo Codes signature component.
// Static, dateless trust marker. Slate-900 border, teal-600 check, slate-900 label.
// One component, multiple consumers (offer cards, blog bylines, stat blocks).

import React from 'react';

type Size = 'sm' | 'md';

interface VerifiedChipProps {
  /** "sm" inline (16px icon, 12px label) or "md" anchor block (20px icon, 14px label). Default "sm". */
  size?: Size;
  /** Override the visible label. Default "Verified". */
  label?: string;
  className?: string;
}

const SIZE_STYLES: Record<Size, { icon: number; gap: string; padX: string; padY: string; text: string }> = {
  sm: { icon: 14, gap: 'gap-1', padX: 'px-2', padY: 'py-0.5', text: 'text-[11px]' },
  md: { icon: 18, gap: 'gap-1.5', padX: 'px-2.5', padY: 'py-1', text: 'text-xs' },
};

export default function VerifiedChip({ size = 'sm', label = 'Verified', className = '' }: VerifiedChipProps) {
  const s = SIZE_STYLES[size];
  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.padX} ${s.padY} rounded-full border font-semibold uppercase tracking-wide ${s.text} ${className}`}
      style={{
        borderColor: 'var(--text-color)',
        color: 'var(--text-color)',
        backgroundColor: 'var(--background-secondary)',
      }}
      aria-label="Verified by Digital Promo Codes"
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: 'var(--accent-color)' }}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{label}</span>
    </span>
  );
}
