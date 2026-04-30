/**
 * Verify Launch Cohort Script
 *
 * Validates the launch cohort in src/lib/launch-cohort.ts:
 * - Structural checks (count, uniqueness, sorted, no blanks)
 * - DB existence and status checks (exists, not retired, indexable)
 *
 * Usage: node scripts/verify-launch-cohort.mjs
 * Exit code: 0 = pass, 1 = fail
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();
const EXPECTED_COUNT = 101;

async function main() {
  console.log('🔍 Verifying launch cohort...\n');

  const filePath = join(__dirname, '..', 'src', 'lib', 'launch-cohort.ts');
  const content = readFileSync(filePath, 'utf8');

  // Extract slugs from the Set definition
  const setMatch = content.match(/LAUNCH_COHORT_SLUGS = new Set<string>\(\[\s*([\s\S]*?)\s*\]\)/);
  if (!setMatch) {
    console.error('❌ Could not find LAUNCH_COHORT_SLUGS Set in file');
    process.exit(1);
  }

  const setContent = setMatch[1];
  const slugMatches = setContent.match(/'([^']+)'/g);

  if (!slugMatches) {
    console.error('❌ No slugs found in Set');
    process.exit(1);
  }

  const slugs = slugMatches.map(s => s.replace(/'/g, ''));
  const uniqueSlugs = [...new Set(slugs)];

  let hasErrors = false;

  // ========================================
  // STRUCTURAL CHECKS
  // ========================================
  console.log('=== STRUCTURAL CHECKS ===\n');

  console.log(`📊 Total slug entries: ${slugs.length}`);
  console.log(`📊 Unique slugs: ${uniqueSlugs.length}`);

  // Check for duplicates
  if (slugs.length !== uniqueSlugs.length) {
    console.error(`❌ DUPLICATES: ${slugs.length - uniqueSlugs.length} duplicate entries`);
    const seen = new Set();
    const duplicates = [];
    slugs.forEach(s => {
      if (seen.has(s)) duplicates.push(s);
      seen.add(s);
    });
    console.error('   Duplicates:', duplicates.join(', '));
    hasErrors = true;
  } else {
    console.log('✅ No duplicates');
  }

  // Check count
  if (uniqueSlugs.length !== EXPECTED_COUNT) {
    console.error(`❌ COUNT: Expected ${EXPECTED_COUNT}, got ${uniqueSlugs.length}`);
    hasErrors = true;
  } else {
    console.log(`✅ Exactly ${EXPECTED_COUNT} slugs`);
  }

  // Check for blanks
  const blanks = uniqueSlugs.filter(s => !s || s.trim().length === 0);
  if (blanks.length > 0) {
    console.error(`❌ BLANKS: ${blanks.length} empty entries`);
    hasErrors = true;
  } else {
    console.log('✅ No blank slugs');
  }

  // Check sorted
  const sorted = [...uniqueSlugs].sort();
  const isSorted = uniqueSlugs.every((s, i) => s === sorted[i]);
  if (!isSorted) {
    console.error('❌ SORTED: Slugs are not in alphabetical order');
    hasErrors = true;
  } else {
    console.log('✅ Sorted alphabetically');
  }

  // ========================================
  // DB EXISTENCE AND STATUS CHECKS
  // ========================================
  console.log('\n=== DB EXISTENCE & STATUS CHECKS ===\n');

  // Fetch all cohort slugs from DB
  const dbDeals = await prisma.deal.findMany({
    where: {
      slug: { in: uniqueSlugs }
    },
    select: {
      slug: true,
      name: true,
      retired: true,
      retirement: true,
      indexing: true,
      indexingStatus: true
    }
  });

  const dbSlugsSet = new Set(dbDeals.map(d => d.slug));

  // Check missing slugs
  const missingSlugs = uniqueSlugs.filter(s => !dbSlugsSet.has(s));
  if (missingSlugs.length > 0) {
    console.error(`❌ MISSING FROM DB: ${missingSlugs.length} slugs not found`);
    missingSlugs.forEach(s => console.error(`   - ${s}`));
    hasErrors = true;
  } else {
    console.log(`✅ All ${uniqueSlugs.length} slugs exist in DB`);
  }

  // Check retired slugs
  const retiredSlugs = dbDeals.filter(d => d.retired === true || d.retirement === 'GONE');
  if (retiredSlugs.length > 0) {
    console.error(`❌ RETIRED SLUGS: ${retiredSlugs.length} slugs are retired/GONE`);
    retiredSlugs.forEach(d => console.error(`   - ${d.slug} (retired=${d.retired}, retirement=${d.retirement})`));
    hasErrors = true;
  } else {
    console.log('✅ No retired slugs');
  }

  // Check indexing status (warn if not INDEX, but don't fail - Step 2 will fix this)
  const nonIndexSlugs = dbDeals.filter(d => d.indexing !== 'INDEX' && d.indexingStatus !== 'INDEX');
  if (nonIndexSlugs.length > 0) {
    console.log(`⚠️  ${nonIndexSlugs.length} slugs not currently set to INDEX (Step 2 will fix)`);
  } else {
    console.log('✅ All slugs currently set to INDEX');
  }

  // Summary stats
  console.log('\n=== SUMMARY ===\n');
  console.log(`📊 Cohort slugs in file: ${uniqueSlugs.length}`);
  console.log(`📊 Found in DB: ${dbDeals.length}`);
  console.log(`📊 Missing from DB: ${missingSlugs.length}`);
  console.log(`📊 Retired: ${retiredSlugs.length}`);

  // Final verdict
  console.log('');
  if (hasErrors) {
    console.error('❌ VERIFICATION FAILED');
    await prisma.$disconnect();
    process.exit(1);
  } else {
    console.log('✅ VERIFICATION PASSED — 101 slugs confirmed in DB and valid');
    await prisma.$disconnect();
    process.exit(0);
  }
}

main().catch(async (e) => {
  console.error('❌ Error during verification:', e);
  await prisma.$disconnect();
  process.exit(1);
});
