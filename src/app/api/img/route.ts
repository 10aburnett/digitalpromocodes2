// src/app/api/img/route.ts
import { NextResponse } from 'next/server';
import { dlog } from '@/lib/debug';
import { siteOrigin } from '@/lib/site-origin';

// Domain allow-list for image proxy
const ALLOWED_DOMAINS = [
  new URL(siteOrigin()).hostname,
  'localhost',
  'whop.com',
  // Whop ImgProxy CDN hosts (fix for img-v2-prod errors)
  'img-v2-prod.whop.com',
  'img-v2-stage.whop.com',
  'img.whop.com',
  'assets.whop.com',
  'assets-2-prod.whop.com',
  'cdn.whop.com',
  'images.whop.com',
  'static.whop.xyz',
  // External CDNs
  'pbs.twimg.com',
  'i.imgur.com',
  'cdn.discordapp.com',
  'media.discordapp.net'
];

// IMPORTANT:
// S3 is path-style here (s3.amazonaws.com/bucket-name/*)
// We restrict bucket prefixes to avoid open proxy abuse
const S3_HOSTS = ['s3.us-east-2.amazonaws.com', 's3.amazonaws.com'];
const ALLOWED_S3_BUCKET_PREFIXES = [
  '/assets.whop.com/',
  '/assets-2-prod.whop.com/'
];

function isAllowedDomain(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);

    // Check if it's an S3 host - require bucket prefix restriction
    if (S3_HOSTS.includes(hostname)) {
      return ALLOWED_S3_BUCKET_PREFIXES.some(prefix => pathname.startsWith(prefix));
    }

    // Standard domain check for non-S3 hosts
    return ALLOWED_DOMAINS.some(allowed => hostname === allowed || hostname.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

// 1x1 transparent PNG fallback
const FALLBACK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get('src');
  if (!src) return NextResponse.json({ error: 'missing src' }, { status: 400 });

  // Handle relative URLs by converting to absolute
  const ASSET_ORIGIN = process.env.NODE_ENV === 'production'
    ? siteOrigin()
    : `http://localhost:${process.env.PORT || 3000}`;

  const absoluteSrc = src.startsWith('http') ? src : `${ASSET_ORIGIN}${src.startsWith('/') ? src : `/${src}`}`;

  const srcHost = new URL(absoluteSrc).hostname;
  const allowed = isAllowedDomain(absoluteSrc);
  console.log('[DBG:img]', { srcHost, allowed, original: src, absolute: absoluteSrc });

  if (!allowed) {
    dlog('images', `blocked domain: ${srcHost}`, { src });
    // Return fallback instead of error
    const res = new NextResponse(FALLBACK_PNG, { status: 200 });
    res.headers.set('content-type', 'image/png');
    res.headers.set('cache-control', 'public, max-age=3600');
    return res;
  }

  try {
    const upstream = await fetch(absoluteSrc, { cache: 'no-store' });
    if (!upstream.ok) {
      dlog('images', `proxy fetch failed: ${absoluteSrc}`, { status: upstream.status });
      // Return fallback instead of 502
      const res = new NextResponse(FALLBACK_PNG, { status: 200 });
      res.headers.set('content-type', 'image/png');
      res.headers.set('cache-control', 'public, max-age=300');
      return res;
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    const res = new NextResponse(buf, { status: 200 });
    const ctype = upstream.headers.get('content-type') ?? 'image/png';
    res.headers.set('content-type', ctype);
    res.headers.set('cache-control', 'public, max-age=86400, s-maxage=86400');
    return res;
  } catch (e: any) {
    dlog('images', 'proxy exception', { message: e?.message });
    // Return fallback instead of 500
    const res = new NextResponse(FALLBACK_PNG, { status: 200 });
    res.headers.set('content-type', 'image/png');
    res.headers.set('cache-control', 'public, max-age=300');
    return res;
  }
}
