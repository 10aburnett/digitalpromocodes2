/**
 * Smoke Test Launch Cohort Pages
 *
 * Samples 10 random cohort slugs and verifies they have:
 * - Valid DB record
 * - Non-empty promo codes
 * - Content (aboutContent)
 *
 * Usage: node scripts/smoke-cohort-pages.mjs
 * Exit code: 0 = pass, 1 = fail
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const SAMPLE_SIZE = 10;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  console.log('🔥 Smoke testing launch cohort pages...\n');

  // Load cohort slugs from JSON file
  const cohortPath = join(__dirname, '..', 'data', 'launch-cohort-200.json');
  const cohortData = JSON.parse(readFileSync(cohortPath, 'utf8'));
  const allSlugs = cohortData.slugs;

  console.log(`📊 Total cohort slugs: ${allSlugs.length}`);

  // Sample 10 random slugs
  const sampleSlugs = shuffleArray(allSlugs).slice(0, SAMPLE_SIZE);
  console.log(`📋 Testing ${SAMPLE_SIZE} random samples:\n`);

  // Query DB for each
  const deals = await prisma.deal.findMany({
    where: {
      slug: { in: sampleSlugs }
    },
    select: {
      slug: true,
      name: true,
      indexingStatus: true,
      aboutContent: true,
      _count: {
        select: { PromoCode: true }
      },
      PromoCode: {
        where: { code: { not: null } },
        select: { code: true },
        take: 1
      }
    }
  });

  const dealsBySlug = new Map(deals.map(d => [d.slug, d]));

  let passed = 0;
  let failed = 0;
  const issues = [];

  for (const slug of sampleSlugs) {
    const deal = dealsBySlug.get(slug);

    if (!deal) {
      console.log(`❌ ${slug}: NOT FOUND IN DB`);
      issues.push({ slug, issue: 'not found in DB' });
      failed++;
      continue;
    }

    const hasPromoCode = deal.PromoCode.length > 0 && deal.PromoCode[0].code?.trim().length > 0;
    const hasContent = deal.aboutContent && deal.aboutContent.length >= 100;
    const promoCount = deal._count.PromoCode;
    const contentLen = deal.aboutContent?.length || 0;

    const status = hasPromoCode && hasContent ? '✅' : '⚠️';
    const statusText = [];

    if (!hasPromoCode) {
      statusText.push('NO PROMO CODE');
      issues.push({ slug, issue: 'no promo code' });
    }
    if (!hasContent) {
      statusText.push(`content too short (${contentLen} chars)`);
      if (contentLen === 0) {
        issues.push({ slug, issue: 'no aboutContent' });
      }
    }

    if (hasPromoCode && hasContent) {
      passed++;
      console.log(`${status} ${slug}`);
      console.log(`   name: "${deal.name.substring(0, 40)}${deal.name.length > 40 ? '...' : ''}"`);
      console.log(`   codes: ${promoCount}, content: ${contentLen} chars`);
    } else {
      failed++;
      console.log(`${status} ${slug} - ${statusText.join(', ')}`);
      console.log(`   name: "${deal.name.substring(0, 40)}${deal.name.length > 40 ? '...' : ''}"`);
      console.log(`   codes: ${promoCount}, content: ${contentLen} chars`);
    }
    console.log('');
  }

  // Summary
  console.log('━'.repeat(50));
  console.log(`\n📊 Results: ${passed}/${SAMPLE_SIZE} passed, ${failed}/${SAMPLE_SIZE} with issues\n`);

  if (issues.length > 0) {
    console.log('⚠️ Issues found:');
    issues.forEach(i => console.log(`   - ${i.slug}: ${i.issue}`));
    console.log('');
  }

  await prisma.$disconnect();

  // Exit with appropriate code
  // Note: We allow warnings (missing content) but fail on critical issues (no promo code, not found)
  const criticalIssues = issues.filter(i => i.issue === 'no promo code' || i.issue === 'not found in DB');
  if (criticalIssues.length > 0) {
    console.error('❌ SMOKE TEST FAILED: Critical issues found');
    process.exit(1);
  } else {
    console.log('✅ SMOKE TEST PASSED');
    process.exit(0);
  }
}

main().catch(async (e) => {
  console.error('❌ Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
