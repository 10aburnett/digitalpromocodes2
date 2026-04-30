#!/usr/bin/env node
/**
 * Verify Launch Surface
 *
 * Pre-deploy verification that the site is properly configured for launch:
 * - SSR content is present in HTML (not just client-side)
 * - No noindex meta tags on cohort pages
 * - Canonical URLs are correct
 * - Cohort offers return 200, non-cohort return 404
 * - API returns exactly 101 offers
 *
 * Usage: node scripts/verify-launch-surface.mjs [base-url]
 * Default base URL: http://localhost:3000
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const EXPECTED_COHORT_COUNT = 101;

// Sample cohort slugs to test (known to be in cohort)
const COHORT_SAMPLE = [
  'dodgys-dungeon',
  'goat-sports-bets-membership',
  'larrys-lounge-premium',
];

// Sample non-cohort slugs to test (known to NOT be in cohort)
const NON_COHORT_SAMPLE = [
  'ayecon-academy-lifetime-membership',
  'best-of-both-worlds',
];

let passed = 0;
let failed = 0;

function log(status, message) {
  const icon = status === 'PASS' ? '\x1b[32m✅\x1b[0m' : status === 'FAIL' ? '\x1b[31m❌\x1b[0m' : '\x1b[33mℹ️\x1b[0m';
  console.log(`${icon} ${message}`);
  if (status === 'PASS') passed++;
  if (status === 'FAIL') failed++;
}

async function fetchText(url) {
  try {
    const response = await fetch(url);
    return {
      status: response.status,
      text: await response.text(),
      headers: response.headers,
    };
  } catch (error) {
    return { status: 0, text: '', headers: null, error: error.message };
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    return {
      status: response.status,
      json: await response.json(),
    };
  } catch (error) {
    return { status: 0, json: null, error: error.message };
  }
}

async function testApiCount() {
  console.log('\n--- API Count Check ---');
  const result = await fetchJson(`${BASE_URL}/api/whops?limit=1`);

  if (result.error) {
    log('FAIL', `API request failed: ${result.error}`);
    return;
  }

  const total = result.json?.pagination?.total;
  if (total === EXPECTED_COHORT_COUNT) {
    log('PASS', `API returns exactly ${EXPECTED_COHORT_COUNT} offers`);
  } else {
    log('FAIL', `API returns ${total} offers (expected ${EXPECTED_COHORT_COUNT})`);
  }
}

async function testCohortOffer(slug) {
  console.log(`\n--- Cohort Offer: ${slug} ---`);
  const url = `${BASE_URL}/offer/${slug}`;
  const result = await fetchText(url);

  if (result.error) {
    log('FAIL', `Request failed: ${result.error}`);
    return;
  }

  // Check HTTP status
  if (result.status === 200) {
    log('PASS', `HTTP 200 OK`);
  } else {
    log('FAIL', `HTTP ${result.status} (expected 200)`);
    return;
  }

  const html = result.text;

  // Check for SSR content (About section should be in HTML)
  const hasAbout = html.includes('About') || html.includes('about');
  const hasDescription = html.length > 10000; // Reasonable page size indicates SSR
  if (hasAbout && hasDescription) {
    log('PASS', `SSR content present (page size: ${Math.round(html.length/1024)}KB)`);
  } else {
    log('FAIL', `SSR content may be missing (page size: ${Math.round(html.length/1024)}KB)`);
  }

  // === CRITICAL SSR CHECKS FOR JS-OFF RENDERING ===
  // These sections MUST render in HTML without JavaScript

  // 1. Check for "More ways to save" heading (Recommendations)
  const hasRecommendationsHeading = html.includes('More ways to save');
  if (hasRecommendationsHeading) {
    log('PASS', `SSR: "More ways to save" heading present`);
  } else {
    log('FAIL', `SSR: "More ways to save" heading MISSING - Recommendations not rendering!`);
  }

  // 2. Check for "Why Not Try" heading (Alternatives)
  const hasAlternativesHeading = html.includes('Why Not Try');
  if (hasAlternativesHeading) {
    log('PASS', `SSR: "Why Not Try" heading present`);
  } else {
    log('FAIL', `SSR: "Why Not Try" heading MISSING - Alternatives not rendering!`);
  }

  // 3. Check for "Community feedback" heading (Reviews)
  const hasReviewsHeading = html.includes('Community feedback');
  if (hasReviewsHeading) {
    log('PASS', `SSR: "Community feedback" heading present`);
  } else {
    log('FAIL', `SSR: "Community feedback" heading MISSING - Reviews not rendering!`);
  }

  // 4. Check for at least one /offer/ link in HTML (recs/alts internal links)
  const offerLinks = html.match(/href="\/offer\/[^"]+/g) || [];
  if (offerLinks.length > 1) {
    log('PASS', `SSR: ${offerLinks.length} internal /offer/ links found`);
  } else {
    log('FAIL', `SSR: Only ${offerLinks.length} /offer/ links - Recs/Alts not rendering!`);
  }

  // 5. Check for NO animate-pulse (skeleton markers)
  const hasSkeletonMarkers = html.includes('animate-pulse');
  if (!hasSkeletonMarkers) {
    log('PASS', `SSR: No skeleton markers (animate-pulse) found`);
  } else {
    log('FAIL', `SSR: Skeleton markers found - content may be streaming-only!`);
  }

  // Check for noindex
  const hasNoindex = html.toLowerCase().includes('noindex');
  if (!hasNoindex) {
    log('PASS', `No noindex meta tag found`);
  } else {
    log('FAIL', `noindex tag found - page will not be indexed!`);
  }

  // Check canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    const canonical = canonicalMatch[1];
    const expectedCanonical = `https://digitalpromocodes.com/offer/${slug}`;
    if (canonical === expectedCanonical || canonical.endsWith(`/offer/${slug}`)) {
      log('PASS', `Canonical URL correct: ${canonical}`);
    } else {
      log('FAIL', `Canonical URL mismatch: ${canonical} (expected: ${expectedCanonical})`);
    }
  } else {
    log('INFO', `No canonical tag found (may be set via headers)`);
  }

  // Check X-Robots-Tag header
  const robotsHeader = result.headers?.get('x-robots-tag');
  if (robotsHeader) {
    if (robotsHeader.toLowerCase().includes('noindex')) {
      log('FAIL', `X-Robots-Tag header contains noindex: ${robotsHeader}`);
    } else {
      log('PASS', `X-Robots-Tag header OK: ${robotsHeader}`);
    }
  }
}

async function testNonCohortOffer(slug) {
  console.log(`\n--- Non-Cohort Offer: ${slug} ---`);
  const url = `${BASE_URL}/offer/${slug}`;
  const result = await fetchText(url);

  if (result.error) {
    log('FAIL', `Request failed: ${result.error}`);
    return;
  }

  // Should return 404
  if (result.status === 404) {
    log('PASS', `HTTP 404 Not Found (correct for non-cohort)`);
  } else {
    log('FAIL', `HTTP ${result.status} (expected 404 for non-cohort)`);
  }
}

async function testStaticPages() {
  console.log('\n--- Static Pages ---');

  const pages = ['/', '/offers', '/privacy', '/terms', '/contact'];

  for (const page of pages) {
    const result = await fetchText(`${BASE_URL}${page}`);
    if (result.status === 200) {
      log('PASS', `${page} returns HTTP 200`);
    } else {
      log('FAIL', `${page} returns HTTP ${result.status}`);
    }
  }
}

async function testSitemaps() {
  console.log('\n--- Sitemap Files ---');

  const sitemaps = [
    '/sitemap-index.xml',
    '/sitemap-offers.xml',
    '/sitemap-static.xml',
  ];

  for (const sitemap of sitemaps) {
    const result = await fetchText(`${BASE_URL}${sitemap}`);
    if (result.status === 200) {
      const urlCount = (result.text.match(/<url>/g) || []).length;
      const sitemapCount = (result.text.match(/<sitemap>/g) || []).length;
      const count = urlCount || sitemapCount;
      log('PASS', `${sitemap} returns HTTP 200 (${count} entries)`);

      // EN-only check: No locale prefixes in sitemap URLs
      const localeMatch = result.text.match(/\/(en|es|fr|de|it|pt|nl|zh|ja|ko|ru|ar)\//i);
      if (localeMatch) {
        log('FAIL', `${sitemap} contains locale prefix: ${localeMatch[0]}`);
      } else {
        log('PASS', `${sitemap} has no locale prefixes (EN-only OK)`);
      }
    } else {
      log('FAIL', `${sitemap} returns HTTP ${result.status}`);
    }
  }

  // Verify no legacy sitemaps
  const legacySitemaps = ['/sitemaps/blog.xml', '/sitemaps/noindex.xml', '/sitemap-blog.xml'];
  for (const sitemap of legacySitemaps) {
    const result = await fetchText(`${BASE_URL}${sitemap}`);
    if (result.status === 404) {
      log('PASS', `${sitemap} returns 404 (legacy sitemap correctly removed)`);
    } else {
      log('FAIL', `${sitemap} returns HTTP ${result.status} (should be 404)`);
    }
  }
}

async function testEnOnlyLock() {
  console.log('\n--- EN-Only Lock Verification ---');

  // Test locale paths return 404
  const localePaths = [
    '/es/offers',
    '/fr/offer/dodgys-dungeon',
    '/de/contact',
    '/en/offers', // Even /en/* should 404 (strict mode)
  ];

  for (const path of localePaths) {
    const result = await fetchText(`${BASE_URL}${path}`);
    if (result.status === 404) {
      log('PASS', `${path} returns 404 (locale blocked)`);
    } else {
      log('FAIL', `${path} returns HTTP ${result.status} (should be 404 for locale path)`);
    }
  }

  // Test cohort page has no hreflang
  console.log('\n--- No hreflang Check ---');
  const cohortUrl = `${BASE_URL}/offer/dodgys-dungeon`;
  const result = await fetchText(cohortUrl);

  if (result.status === 200) {
    const hasHreflang = result.text.toLowerCase().includes('hreflang');
    const hasAlternate = result.text.includes('rel="alternate"') || result.text.includes("rel='alternate'");

    if (!hasHreflang) {
      log('PASS', `Cohort page has no hreflang`);
    } else {
      log('FAIL', `Cohort page contains hreflang (should not in EN-only mode)`);
    }

    if (!hasAlternate) {
      log('PASS', `Cohort page has no rel="alternate" links`);
    } else {
      // rel="alternate" might be used for other things (like RSS), so just info
      log('INFO', `Cohort page has rel="alternate" (check if it's hreflang-related)`);
    }
  } else {
    log('FAIL', `Could not fetch cohort page: HTTP ${result.status}`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           LAUNCH SURFACE VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Expected cohort count: ${EXPECTED_COHORT_COUNT}`);

  // Test API
  await testApiCount();

  // Test cohort offers
  for (const slug of COHORT_SAMPLE) {
    await testCohortOffer(slug);
  }

  // Test non-cohort offers
  for (const slug of NON_COHORT_SAMPLE) {
    await testNonCohortOffer(slug);
  }

  // Test static pages
  await testStaticPages();

  // Test sitemaps
  await testSitemaps();

  // Test EN-only lock
  await testEnOnlyLock();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`           RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (failed > 0) {
    console.log('\n\x1b[31m❌ VERIFICATION FAILED - Fix issues before deploy!\x1b[0m');
    process.exit(1);
  } else {
    console.log('\n\x1b[32m✅ ALL CHECKS PASSED - Ready for deploy!\x1b[0m');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Verification script error:', error);
  process.exit(1);
});
