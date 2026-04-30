/**
 * Set Cohort Indexing Script
 *
 * Enforces DB indexing status for launch cohort:
 * - Exactly 101 cohort slugs → INDEX
 * - All other non-retired deals → NOINDEX
 * - Retired/GONE deals → untouched
 *
 * Usage:
 *   node scripts/set-cohort-indexing.mjs --dry-run   (preview changes)
 *   node scripts/set-cohort-indexing.mjs --apply     (execute changes)
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isApply = args.includes('--apply');

  if (!isDryRun && !isApply) {
    console.log('Usage:');
    console.log('  node scripts/set-cohort-indexing.mjs --dry-run');
    console.log('  node scripts/set-cohort-indexing.mjs --apply');
    process.exit(1);
  }

  console.log(`\n🔧 SET COHORT INDEXING — ${isDryRun ? 'DRY RUN' : 'APPLY MODE'}\n`);

  // Load cohort slugs from canonical file
  const cohortPath = join(__dirname, '..', 'data', 'launch-cohort-curated-101.json');
  const cohortData = JSON.parse(readFileSync(cohortPath, 'utf8'));
  const cohortSlugs = new Set(cohortData.slugs);

  console.log(`📋 Cohort slugs loaded: ${cohortSlugs.size}`);

  // ========================================
  // BEFORE COUNTS
  // ========================================
  console.log('\n=== BEFORE COUNTS ===\n');

  const totalDeals = await prisma.deal.count();
  console.log(`📊 Total deals in DB: ${totalDeals}`);

  const retiredDeals = await prisma.deal.count({
    where: {
      OR: [
        { retired: true },
        { retirement: 'GONE' }
      ]
    }
  });
  console.log(`📊 Retired/GONE deals: ${retiredDeals}`);

  const liveDeals = totalDeals - retiredDeals;
  console.log(`📊 Live deals (not retired): ${liveDeals}`);

  const currentlyIndex = await prisma.deal.count({
    where: {
      indexingStatus: 'INDEX',
      retired: false,
      NOT: { retirement: 'GONE' }
    }
  });
  console.log(`📊 Currently INDEX (live): ${currentlyIndex}`);

  const currentlyNoindex = await prisma.deal.count({
    where: {
      indexingStatus: 'NOINDEX',
      retired: false,
      NOT: { retirement: 'GONE' }
    }
  });
  console.log(`📊 Currently NOINDEX (live): ${currentlyNoindex}`);

  // ========================================
  // IDENTIFY CHANGES NEEDED
  // ========================================
  console.log('\n=== CHANGES TO MAKE ===\n');

  // Find cohort deals that need INDEX
  const cohortDeals = await prisma.deal.findMany({
    where: {
      slug: { in: [...cohortSlugs] },
      retired: false,
      NOT: { retirement: 'GONE' }
    },
    select: { id: true, slug: true, indexingStatus: true, indexing: true }
  });

  const cohortNeedingIndex = cohortDeals.filter(d => d.indexingStatus !== 'INDEX');
  console.log(`📊 Cohort deals found in DB (live): ${cohortDeals.length}`);
  console.log(`📊 Cohort deals needing INDEX flip: ${cohortNeedingIndex.length}`);

  // Find non-cohort live deals that need NOINDEX
  const nonCohortLiveDeals = await prisma.deal.findMany({
    where: {
      slug: { notIn: [...cohortSlugs] },
      retired: false,
      NOT: { retirement: 'GONE' }
    },
    select: { id: true, slug: true, indexingStatus: true, indexing: true }
  });

  const nonCohortNeedingNoindex = nonCohortLiveDeals.filter(d => d.indexingStatus === 'INDEX');
  console.log(`📊 Non-cohort live deals: ${nonCohortLiveDeals.length}`);
  console.log(`📊 Non-cohort deals needing NOINDEX flip: ${nonCohortNeedingNoindex.length}`);

  // ========================================
  // EXPECTED AFTER COUNTS
  // ========================================
  console.log('\n=== EXPECTED AFTER COUNTS ===\n');
  console.log(`📊 INDEX (cohort, live): ${cohortDeals.length}`);
  console.log(`📊 NOINDEX (non-cohort, live): ${nonCohortLiveDeals.length}`);
  console.log(`📊 Retired/GONE (unchanged): ${retiredDeals}`);
  console.log(`📊 Total: ${cohortDeals.length + nonCohortLiveDeals.length + retiredDeals}`);

  // ========================================
  // SAFETY CHECKS
  // ========================================
  if (cohortDeals.length !== 101) {
    console.error(`\n❌ SAFETY FAIL: Expected 101 cohort deals in DB, found ${cohortDeals.length}`);
    console.error('   Missing cohort slugs in DB:');
    const dbSlugs = new Set(cohortDeals.map(d => d.slug));
    [...cohortSlugs].filter(s => !dbSlugs.has(s)).forEach(s => console.error(`   - ${s}`));
    await prisma.$disconnect();
    process.exit(1);
  }

  // ========================================
  // DRY RUN OUTPUT
  // ========================================
  if (isDryRun) {
    console.log('\n=== DRY RUN SUMMARY ===\n');
    console.log(`Will set INDEX for ${cohortDeals.length} cohort deals`);
    console.log(`Will set NOINDEX for ${nonCohortLiveDeals.length} non-cohort live deals`);
    console.log(`Retired/GONE deals: ${retiredDeals} (untouched)`);
    console.log('\n✅ DRY RUN COMPLETE — no changes made');
    console.log('   Run with --apply to execute changes.');
    await prisma.$disconnect();
    process.exit(0);
  }

  // ========================================
  // APPLY CHANGES
  // ========================================
  console.log('\n=== APPLYING CHANGES ===\n');

  // Step 1: Set INDEX for cohort deals (also set indexing enum field)
  console.log('📝 Setting INDEX for cohort deals...');
  const cohortIds = cohortDeals.map(d => d.id);
  const cohortUpdateResult = await prisma.deal.updateMany({
    where: { id: { in: cohortIds } },
    data: {
      indexingStatus: 'INDEX',
      indexing: 'INDEX'
    }
  });
  console.log(`   Updated: ${cohortUpdateResult.count} deals`);

  // Step 2: Set NOINDEX for non-cohort live deals (also set indexing enum field)
  console.log('📝 Setting NOINDEX for non-cohort live deals...');
  const nonCohortIds = nonCohortLiveDeals.map(d => d.id);
  const nonCohortUpdateResult = await prisma.deal.updateMany({
    where: { id: { in: nonCohortIds } },
    data: {
      indexingStatus: 'NOINDEX',
      indexing: 'NOINDEX'
    }
  });
  console.log(`   Updated: ${nonCohortUpdateResult.count} deals`);

  // ========================================
  // VERIFICATION COUNTS
  // ========================================
  console.log('\n=== VERIFICATION (AFTER COUNTS) ===\n');

  const afterIndexLive = await prisma.deal.count({
    where: {
      indexingStatus: 'INDEX',
      retired: false,
      NOT: { retirement: 'GONE' }
    }
  });
  console.log(`📊 INDEX (live, non-retired): ${afterIndexLive}`);

  const afterCohortIndex = await prisma.deal.count({
    where: {
      slug: { in: [...cohortSlugs] },
      indexingStatus: 'INDEX',
      retired: false,
      NOT: { retirement: 'GONE' }
    }
  });
  console.log(`📊 Cohort deals with INDEX: ${afterCohortIndex}`);

  const afterNonCohortIndex = await prisma.deal.count({
    where: {
      slug: { notIn: [...cohortSlugs] },
      indexingStatus: 'INDEX',
      retired: false,
      NOT: { retirement: 'GONE' }
    }
  });
  console.log(`📊 Non-cohort live deals with INDEX: ${afterNonCohortIndex}`);

  const afterRetired = await prisma.deal.count({
    where: {
      OR: [
        { retired: true },
        { retirement: 'GONE' }
      ]
    }
  });
  console.log(`📊 Retired/GONE (unchanged): ${afterRetired}`);

  // Write audit report
  const report = {
    timestamp: new Date().toISOString(),
    mode: 'apply',
    before: {
      totalDeals,
      retiredDeals,
      liveDeals,
      currentlyIndex,
      currentlyNoindex
    },
    changes: {
      cohortSlugsCount: cohortSlugs.size,
      cohortDealsInDb: cohortDeals.length,
      cohortNeedingIndex: cohortNeedingIndex.length,
      nonCohortLiveDeals: nonCohortLiveDeals.length,
      nonCohortNeedingNoindex: nonCohortNeedingNoindex.length,
      cohortUpdated: cohortUpdateResult.count,
      nonCohortUpdated: nonCohortUpdateResult.count
    },
    after: {
      indexLive: afterIndexLive,
      cohortIndex: afterCohortIndex,
      nonCohortIndex: afterNonCohortIndex,
      retired: afterRetired
    }
  };

  const reportPath = join(__dirname, '..', 'data', 'index-flip-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Audit report: data/index-flip-report.json`);

  // Final assertions
  console.log('\n=== FINAL ASSERTIONS ===\n');

  let allPass = true;

  if (afterIndexLive === 101) {
    console.log('✅ INDEX count is exactly 101 for non-retired');
  } else {
    console.error(`❌ INDEX count is ${afterIndexLive}, expected 101`);
    allPass = false;
  }

  if (afterCohortIndex === 101) {
    console.log('✅ All 101 cohort slugs are INDEX');
  } else {
    console.error(`❌ Cohort INDEX count is ${afterCohortIndex}, expected 101`);
    allPass = false;
  }

  if (afterNonCohortIndex === 0) {
    console.log('✅ No non-cohort live slugs are INDEX');
  } else {
    console.error(`❌ ${afterNonCohortIndex} non-cohort live slugs still INDEX`);
    allPass = false;
  }

  if (afterRetired === retiredDeals) {
    console.log('✅ Retired/GONE not accidentally promoted');
  } else {
    console.error(`❌ Retired count changed from ${retiredDeals} to ${afterRetired}`);
    allPass = false;
  }

  console.log('');
  if (allPass) {
    console.log('✅ ALL ASSERTIONS PASSED — DB indexing is now exactly 101 INDEX');
  } else {
    console.error('❌ SOME ASSERTIONS FAILED — review output above');
  }

  await prisma.$disconnect();
  process.exit(allPass ? 0 : 1);
}

main().catch(async (e) => {
  console.error('❌ Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
