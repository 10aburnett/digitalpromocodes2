// src/components/OfferLogoSSR.tsx
// Fully SSR-safe + design system aligned

export function OfferLogoSSR({
  src = '',
  alt,
  width = 56,
  height = 56,
  priority = false
}: {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  // Detect absolute URLs → proxy via /api/img
  const isAbsoluteUrl = src.startsWith('http://') || src.startsWith('https://');

  const safe = isAbsoluteUrl
    ? `/api/img?src=${encodeURIComponent(src)}`
    : src;

  return (
    <div
      className="
        w-full h-full flex items-center justify-center
        rounded-xl border overflow-hidden
      "
      style={{
        backgroundColor: 'var(--background-secondary)',
        borderColor: 'var(--border-color)'
      }}
    >
      <img
        src={safe}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="object-contain w-full h-full"
        style={{
          display: 'block'
        }}
      />

      <noscript>
        <img
          src={safe}
          alt={alt}
          width={width}
          height={height}
          className="object-contain w-full h-full"
        />
      </noscript>
    </div>
  );
}
