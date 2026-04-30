/**
 * Build Launch Cohort Script
 *
 * Selects 101 high-quality slugs with real promo codes for the initial launch cohort.
 * Includes hardening filters to exclude generic/risky slugs.
 * Outputs to data/launch-cohort-101.json
 *
 * Usage: node scripts/build-launch-cohort.mjs
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const COHORT_SIZE = 101;

// ============================================================
// SLUG HARDENING FILTERS
// ============================================================

// Generic words that indicate low-quality/ambiguous slugs
// NOTE: Metals (gold/silver/bronze/platinum/diamond) removed to avoid excluding legitimate brands
const GENERIC_WORDS = new Set([
  'academy', 'exclusive', 'monthly', 'weekly', 'yearly', 'premium', 'vip',
  'community', 'membership', 'course', 'bundle', 'plan', 'trial', 'standard',
  'basic', 'pro', 'elite', 'access', 'pass', 'subscription', 'package',
  'tier', 'level', 'class'
]);

// Specific slugs to always exclude (known problematic)
const DENYLIST_SLUGS = new Set([
  'academy', 'exclusive', 'monthly-plan', 'vipweek', 'elite-premium',
  'monthly-premium-membership', 'subscription-with-card', 'membership-card-payments',
  '1', 'pro', 'vip', 'premium', 'basic', 'standard'
]);

/**
 * Check if a slug is "risky" or "generic" and should be excluded.
 * Returns { pass: boolean, reason?: string }
 */
function isSlugQualityOk(slug, name) {
  // Explicit denylist
  if (DENYLIST_SLUGS.has(slug.toLowerCase())) {
    return { pass: false, reason: 'denylist' };
  }

  // Too short (< 8 chars)
  if (slug.length < 8) {
    return { pass: false, reason: `too short (${slug.length} chars)` };
  }

  // Leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { pass: false, reason: 'leading/trailing hyphen' };
  }

  // Repeated hyphens
  if (slug.includes('--')) {
    return { pass: false, reason: 'repeated hyphens' };
  }

  // Numeric-only or mostly numeric
  const numericChars = (slug.match(/[0-9]/g) || []).length;
  const alphaChars = (slug.match(/[a-z]/gi) || []).length;
  if (alphaChars === 0 || numericChars > alphaChars) {
    return { pass: false, reason: 'mostly numeric' };
  }

  // Token count < 2 (single word, no hyphens)
  const tokens = slug.split('-').filter(t => t.length > 0);
  if (tokens.length < 2) {
    return { pass: false, reason: `single token (${tokens.length})` };
  }

  // Check if slug is entirely generic words
  const nonGenericTokens = tokens.filter(t => !GENERIC_WORDS.has(t.toLowerCase()));
  if (nonGenericTokens.length === 0) {
    return { pass: false, reason: 'all generic words' };
  }

  // Name too short (< 4 chars) - likely placeholder
  if (name && name.length < 4) {
    return { pass: false, reason: `name too short (${name.length} chars)` };
  }

  return { pass: true };
}

async function buildLaunchCohort() {
  console.log('🚀 Building launch cohort (with hardening filters)...\n');

  // Stage 1: Query all candidate deals with promo codes
  const allDeals = await prisma.deal.findMany({
    where: {
      // Must have at least one promo code with actual code value
      PromoCode: {
        some: {
          code: {
            not: null
          }
        }
      }
    },
    select: {
      slug: true,
      name: true,
      rating: true,
      retired: true,
      retirement: true,
      updatedAt: true,
      _count: {
        select: {
          Review: true,
          PromoCode: true
        }
      },
      PromoCode: {
        where: {
          code: { not: null }
        },
        select: {
          code: true
        },
        take: 1
      }
    },
    orderBy: [
      { rating: 'desc' },
      { updatedAt: 'desc' }
    ]
  });

  console.log(`📊 Stage 1 - Candidate deals (has promo code): ${allDeals.length}`);

  // Stage 2: Filter to non-empty codes
  const withValidCode = allDeals.filter(deal => {
    return deal.PromoCode.some(pc => pc.code && pc.code.trim().length > 0);
  });
  console.log(`📊 Stage 2 - Has non-empty promo code: ${withValidCode.length}`);

  // Stage 3: Filter to live only (not retired)
  const liveDeals = withValidCode.filter(deal => {
    return deal.retired === false && deal.retirement === 'NONE';
  });
  console.log(`📊 Stage 3 - Live only (retired=false, retirement=NONE): ${liveDeals.length}`);

  // Stage 4: Apply slug quality filters
  const excluded = [];
  const qualityDeals = liveDeals.filter(deal => {
    const result = isSlugQualityOk(deal.slug, deal.name);
    if (!result.pass) {
      excluded.push({ slug: deal.slug, reason: result.reason });
    }
    return result.pass;
  });
  console.log(`📊 Stage 4 - After slug quality filter: ${qualityDeals.length}`);
  console.log(`   (Excluded ${excluded.length} risky/generic slugs)\n`);

  // Print exclusion reasons summary
  const reasonCounts = {};
  excluded.forEach(e => {
    reasonCounts[e.reason] = (reasonCounts[e.reason] || 0) + 1;
  });
  console.log('📋 Exclusion reasons:');
  Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).forEach(([reason, count]) => {
    console.log(`   - ${reason}: ${count}`);
  });
  console.log('');

  // Sort by quality signals: rating desc, review count desc, then updatedAt desc
  const sortedDeals = qualityDeals.sort((a, b) => {
    // First by rating (desc)
    if (b.rating !== a.rating) return b.rating - a.rating;
    // Then by review count (desc)
    if (b._count.Review !== a._count.Review) return b._count.Review - a._count.Review;
    // Then by updatedAt (desc)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Take top N for cohort (dedupe just in case)
  const seenSlugs = new Set();
  const cohort = [];
  for (const deal of sortedDeals) {
    if (seenSlugs.has(deal.slug)) continue;
    seenSlugs.add(deal.slug);
    cohort.push(deal);
    if (cohort.length >= COHORT_SIZE) break;
  }

  // Extract, dedupe, and sort slugs
  let slugs = cohort.map(d => d.slug);
  slugs = [...new Set(slugs)].sort(); // Dedupe and sort alphabetically

  // Assertions - hard fail to prevent bad cohorts
  if (slugs.length !== COHORT_SIZE) {
    const msg = `Expected ${COHORT_SIZE} slugs, got ${slugs.length}. Pool had ${qualityDeals.length} after filters.`;
    console.error(`\n❌ ASSERTION FAILED: ${msg}`);
    throw new Error(msg);
  }
  if (new Set(slugs).size !== slugs.length) {
    const msg = `Duplicates found in cohort`;
    console.error(`\n❌ ASSERTION FAILED: ${msg}`);
    throw new Error(msg);
  }

  console.log(`🎯 Final cohort: ${slugs.length} unique slugs (sorted, deduped)\n`);

  // Print summary stats
  const withRating = cohort.filter(d => d.rating > 0).length;
  const withReviews = cohort.filter(d => d._count.Review > 0).length;
  console.log(`📈 Quality breakdown:`);
  console.log(`   - With rating > 0: ${withRating}`);
  console.log(`   - With reviews: ${withReviews}\n`);

  // Print all slugs
  console.log('📋 Cohort slugs:');
  slugs.forEach((slug, i) => {
    const deal = cohort[i];
    console.log(`   ${i + 1}. '${slug}', // rating: ${deal.rating}, reviews: ${deal._count.Review}, codes: ${deal._count.PromoCode}`);
  });

  // Ensure data directory exists
  const dataDir = join(__dirname, '..', 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Write output file
  const outputPath = join(dataDir, 'launch-cohort-101.json');
  const output = {
    generatedAt: new Date().toISOString(),
    count: slugs.length,
    criteria: {
      hasPromoCode: true,
      retired: false,
      retirement: 'NONE',
      slugQualityFilters: [
        'length >= 8',
        'token count >= 2',
        'no leading/trailing hyphens',
        'no repeated hyphens',
        'not mostly numeric',
        'not all generic words',
        'name length >= 4',
        'not in denylist'
      ],
      orderBy: ['rating desc', 'reviewCount desc', 'updatedAt desc']
    },
    excluded: {
      count: excluded.length,
      reasons: reasonCounts,
      slugs: excluded.slice(0, 50) // Include first 50 for reference
    },
    slugs
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ Saved to ${outputPath}`);

  // Write excluded slugs to separate file for reference
  const excludedPath = join(dataDir, 'launch-cohort-excluded.json');
  writeFileSync(excludedPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: excluded.length,
    reasons: reasonCounts,
    slugs: excluded
  }, null, 2));
  console.log(`📝 Excluded slugs saved to ${excludedPath}`);

  // Auto-update src/lib/launch-cohort.ts using sentinel markers
  const launchCohortPath = join(__dirname, '..', 'src', 'lib', 'launch-cohort.ts');
  let tsContent = readFileSync(launchCohortPath, 'utf8');

  const slugsFormatted = slugs.map(s => `  '${s}',`).join('\n');
  const newSetContent = `// COHORT_START
export const LAUNCH_COHORT_SLUGS = new Set<string>([
  // === HARDENED LAUNCH COHORT (${slugs.length} slugs) - Generated ${new Date().toISOString().split('T')[0]} ===
  // Criteria: has promo code, retired=false, retirement=NONE
  // Filters: length >= 8, tokens >= 2, no generic-only slugs, no denylist
  // Sorted alphabetically, deduped
${slugsFormatted}
]);
// COHORT_END`;

  // Use sentinel markers for safer replacement
  const sentinelRegex = /\/\/ COHORT_START[\s\S]*?\/\/ COHORT_END/;
  if (!sentinelRegex.test(tsContent)) {
    throw new Error('Could not find COHORT_START/COHORT_END markers in launch-cohort.ts');
  }
  tsContent = tsContent.replace(sentinelRegex, newSetContent);

  writeFileSync(launchCohortPath, tsContent);
  console.log(`\n✅ Updated ${launchCohortPath}`);

  // Final assertions
  console.log('\n📋 Final verification:');
  console.log(`   Slugs in JSON: ${slugs.length}`);
  console.log(`   Unique: ${new Set(slugs).size}`);
  console.log(`   Sorted: ${slugs.slice().sort().join(',') === slugs.join(',') ? 'yes' : 'no'}`);

  await prisma.$disconnect();
}

buildLaunchCohort().catch(async (e) => {
  console.error('❌ Error building cohort:', e);
  await prisma.$disconnect();
  process.exit(1);
});
