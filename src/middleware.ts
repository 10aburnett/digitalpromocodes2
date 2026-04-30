import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RETIRED_PATHS, NOINDEX_PATHS } from './app/_generated/seo-indexes';
import { LAUNCH_COHORT_SLUGS } from './lib/launch-cohort';
import { shouldBlockLocalePath } from './lib/i18n-lock';

// Simple JWT verification for Edge Runtime
function verifyJWT(token: string, secret: string): any {
  try {
    // Split the JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload (we'll skip signature verification for middleware)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if token has expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Middleware that handles admin routes, API routes, and SEO
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host') ?? '';

  // Check if we should noindex this response:
  // 1. Any *.vercel.app host (production alias + preview URLs)
  // 2. Any Vercel preview deployment (even on custom domain)
  const isVercelAppHost = host.toLowerCase().endsWith('.vercel.app');
  const isVercelPreview = process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production';
  const shouldNoIndex = isVercelAppHost || isVercelPreview;

  // Helper to add X-Robots-Tag noindex on vercel.app or preview deployments
  function withNoIndex(res: NextResponse): NextResponse {
    if (shouldNoIndex) {
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return res;
  }

  // SECURITY: Block all debug and test API routes on any deployed environment
  // These should never be accessible publicly (production OR preview)
  const isDebugOrTestRoute =
    pathname.startsWith('/api/debug-') ||
    pathname.startsWith('/api/test-') ||
    pathname.startsWith('/api/_debug/') ||
    pathname.startsWith('/api/_trace');

  if (isDebugOrTestRoute) {
    // Block on any Vercel deployment (production + preview)
    // VERCEL === '1' is set on all Vercel deployments
    const isDeployed = process.env.VERCEL === '1';
    if (isDeployed) {
      return withNoIndex(new NextResponse('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      }));
    }
    // Only allow in local development
    return NextResponse.next();
  }

  if (process.env.SKIP_SEO_BUILD === '1') {
    const res = NextResponse.next();
    res.headers.set('x-skip-seo', '1');
    return withNoIndex(res);
  }
  const url = request.nextUrl;
  const path = url.pathname.replace(/\/+$/, '');

  // Skip static and public assets - NEVER apply middleware to these
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/public/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/data/pages/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/site.webmanifest' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/sitemap') || // Allow all sitemap files (sitemap-index.xml, sitemap-offers.xml, sitemap-static.xml)
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return withNoIndex(NextResponse.next());
  }

  // ========================================
  // EN-ONLY LOCK: Block all locale-prefixed paths with 404
  // ========================================
  // This blocks: /es/*, /fr/*, /de/*, /en/*, etc.
  // Strict mode: even /en/* returns 404 to avoid duplicate surfaces
  if (shouldBlockLocalePath(pathname)) {
    return withNoIndex(new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
        ...(process.env.NODE_ENV !== 'production' ? { 'x-locale-blocked': 'true' } : {}),
      }
    }));
  }

  // ========================================
  // PRODUCTION MODE: Normal SEO handling for WhopPromoCodes
  // ========================================

  // SEO LOGIC FIRST (for offer routes)
  // Note: Locale paths like /es/offer/* are already 404'd by i18n-lock above
  if (path.startsWith('/offer/')) {
    // prove middleware executed (dev only)
    const res = NextResponse.next();
    if (process.env.NODE_ENV !== 'production') res.headers.set('x-mw-hit', '1');

    // 1) CASE + COLON NORMALIZATION: Canonicalize /offer/* paths
    if (path.startsWith('/offer/')) {
      let target = path.toLowerCase();

      // Canonicalize colon variants:
      // - literal ":" → "%3a"
      // - "%3A" → "%3a"
      if (target.includes(':')) {
        target = target.replace(/:/g, '%3a');
      }
      if (/%3a/i.test(target)) {
        target = target.replace(/%3a/gi, '%3a');
      }

      if (target !== path) {
        // Create new URL with canonical path while preserving query params and hash
        const newUrl = url.clone();
        newUrl.pathname = target;
        return withNoIndex(NextResponse.redirect(newUrl, 301));
      }
    }

    // 2) Note: Legacy locale URLs (e.g., /es/offer/foo) are now 404'd by i18n-lock above
    // No redirect needed - strict EN-only mode

    // 3) handle specific redirects (preserve existing)
    if (path === '/offer/monthly-mentorship') {
      return withNoIndex(NextResponse.redirect(new URL('/offer/ayecon-academy-monthly-mentorship', url)));
    }

    // 4) exact 410 for retired
    if (RETIRED_PATHS.has(path)) {
      return withNoIndex(new NextResponse('Gone', {
        status: 410,
        headers: {
          ...(process.env.NODE_ENV !== 'production' ? {'x-mw-hit':'1'} : {}),
          'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
          'X-Robots-Tag': 'noindex'
        }
      }));
    }

    // 4.5) LAUNCH COHORT GATE: Return real 404 for non-cohort slugs
    // This runs at Edge level BEFORE page rendering, ensuring HTTP 404 status
    // IMPORTANT: Check env at runtime, not import time (Edge runtime behavior)
    const LAUNCH_MODE_ACTIVE = process.env.NEXT_PUBLIC_LAUNCH_MODE === 'cohort';
    if (LAUNCH_MODE_ACTIVE && LAUNCH_COHORT_SLUGS.size > 0) {
      // Extract slug from path, excluding query strings, fragments, and trailing slashes
      // /offer/some-slug?foo=bar -> some-slug
      const slugMatch = path.match(/^\/offer\/([^/?#]+)/);
      if (slugMatch) {
        const slug = slugMatch[1].toLowerCase().replace(/\/+$/, '');
        if (!LAUNCH_COHORT_SLUGS.has(slug)) {
          // Return real 404 - not a soft-404, not noindex, just gone
          return withNoIndex(new NextResponse('Not Found', {
            status: 404,
            headers: {
              ...(process.env.NODE_ENV !== 'production' ? {'x-mw-hit':'1', 'x-cohort-gate': 'blocked'} : {}),
              'Cache-Control': 's-maxage=120, stale-while-revalidate=60',
            }
          }));
        }
      }
    }

    // 5) X-Robots-Tag for NOINDEX paths only
    if (NOINDEX_PATHS.has(path)) {
      res.headers.set('X-Robots-Tag', 'noindex, follow');
    }

    // 6) fall through to admin/API logic if needed, or return
    if (!path.startsWith('/admin') && !path.startsWith('/api')) {
      return withNoIndex(res);
    }
  }

  // Legacy /whop/ redirect to /offer/
  if (path.startsWith('/whop/')) {
    const newPath = path.replace('/whop/', '/offer/');
    return withNoIndex(NextResponse.redirect(new URL(newPath, url), 301));
  }
  
  // Handle preflight OPTIONS requests for CORS
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });

    response.headers.append('Access-Control-Allow-Credentials', 'true');
    response.headers.append('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.append('Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    return withNoIndex(response);
  }
  
  // Create response
  const response = NextResponse.next();

  // Add CORS headers for API routes
  if (pathname.startsWith('/api')) {
    response.headers.append('Access-Control-Allow-Credentials', 'true');
    response.headers.append('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    response.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.append(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    
    // For API routes that require admin authentication
    if (
      (pathname.includes('/api/casinos') || 
       pathname.includes('/api/bonuses') || 
       pathname.includes('/api/reviews') ||
       pathname.includes('/api/analytics/wipe') ||
       pathname.includes('/api/settings') ||
       pathname.includes('/api/upload')) && 
      (request.method === 'POST' || 
       request.method === 'PUT' || 
       request.method === 'DELETE')
    ) {
      // Skip this check for public endpoints
      if (pathname !== '/api/reviews' && !pathname.startsWith('/api/reviews/submit')) {
        // Get admin-token from cookies
        const token = request.cookies.get('admin-token');
        
        // Return unauthorized if no token found
        if (!token) {
          return withNoIndex(new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
                'Access-Control-Allow-Credentials': 'true'
              }
            }
          ));
        }
      }
    }

    return withNoIndex(response);
  }

  // Skip middleware for login page
  if (pathname === '/admin/login') {
    return withNoIndex(response);
  }
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Add noindex header for all admin routes (defense-in-depth)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');

    // Get admin-token from cookies
    const token = request.cookies.get('admin-token')?.value;

    // Redirect to login if no token found
    if (!token) {
      console.log('No admin token found, redirecting to login');
      const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
      redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return redirectResponse;
    }
    
    try {
      const decoded = verifyJWT(token, process.env.AUTH_SECRET || 'dpc-secret-key');
      
      // Check if user has admin role
      if (decoded.role !== 'ADMIN') {
        console.log('User does not have admin role, redirecting to login');
        return withNoIndex(NextResponse.redirect(new URL('/admin/login', request.url)));
      }
      
    } catch (error) {
      console.log('Token verification failed, redirecting to login:', error.message);
      const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
      // Clear the invalid token
      redirectResponse.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
      });
      return withNoIndex(redirectResponse);
    }
  }

  return withNoIndex(response);
}

// Configure the paths that middleware should run on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ]
}; 