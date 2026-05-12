'use client';

// src/components/OfferLogoSSR.tsx
// Client component. Renders the offer logo via the /api/img proxy, with an
// InitialsAvatar fallback when the upstream CDN fails (Whop's CDN started
// returning 403 to external requests, so the proxy returns a 1×1 transparent
// PNG and the card slot used to show a green/empty box).

import { useState } from 'react';
import InitialsAvatar from './InitialsAvatar';

export function OfferLogoSSR({
  src = '',
  alt,
  name,
  width = 56,
  height = 56,
  priority = false
}: {
  src?: string;
  alt: string;
  name?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const [errored, setErrored] = useState(false);

  // Detect absolute URLs → proxy via /api/img
  const isAbsoluteUrl = src.startsWith('http://') || src.startsWith('https://');

  const safe = isAbsoluteUrl
    ? `/api/img?src=${encodeURIComponent(src)}`
    : src;

  // Name for the InitialsAvatar fallback. Prefer the explicit `name` prop,
  // otherwise derive from alt (callers typically pass `${name} logo`).
  const fallbackName = name ?? alt.replace(/\s+logo$/i, '').trim();

  // Render the avatar fallback when:
  // - src is empty/missing, or
  // - src is the site logo placeholder (resolveLogoUrl returns "/logo.svg"
  //   for offers with a null logo field — that file is the site wordmark,
  //   not a per-offer logo, and looks wrong when squeezed into 48×48), or
  // - the <img> failed to load, or the proxy returned a 1×1 transparent PNG.
  if (errored || !src || src === '/logo.svg') {
    return (
      <InitialsAvatar
        name={fallbackName}
        size="lg"
        shape="square"
        className="w-full h-full"
      />
    );
  }

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
        onError={() => setErrored(true)}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth <= 1 && img.naturalHeight <= 1) {
            setErrored(true);
          }
        }}
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
