/**
 * Apply Curated Cohort Script
 *
 * Reads the curated cohort from data/launch-cohort-curated-101.json
 * and updates src/lib/launch-cohort.ts between sentinel markers.
 *
 * This is the CANONICAL source-of-truth workflow for launch cohort.
 *
 * Usage: node scripts/apply-curated-cohort.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXPECTED_COUNT = 101;

function main() {
  console.log('📋 Applying curated cohort to launch-cohort.ts...\n');

  // Read curated cohort file (SINGLE SOURCE OF TRUTH)
  const curatedPath = join(__dirname, '..', 'data', 'launch-cohort-curated-101.json');
  let curated;
  try {
    curated = JSON.parse(readFileSync(curatedPath, 'utf8'));
  } catch (e) {
    console.error(`❌ Could not read curated file: ${curatedPath}`);
    console.error(e.message);
    process.exit(1);
  }

  const slugs = curated.slugs;

  // Validate curated file
  console.log(`📊 Slugs in curated file: ${slugs.length}`);

  if (!Array.isArray(slugs)) {
    console.error('❌ curated.slugs is not an array');
    process.exit(1);
  }

  const uniqueSlugs = [...new Set(slugs)];
  if (uniqueSlugs.length !== slugs.length) {
    console.error(`❌ Duplicates found: ${slugs.length - uniqueSlugs.length} duplicate entries`);
    process.exit(1);
  }
  console.log('✅ No duplicates');

  if (slugs.length !== EXPECTED_COUNT) {
    console.error(`❌ Expected ${EXPECTED_COUNT} slugs, got ${slugs.length}`);
    process.exit(1);
  }
  console.log(`✅ Exactly ${EXPECTED_COUNT} slugs`);

  // Check sorted
  const sorted = [...slugs].sort();
  const isSorted = slugs.every((s, i) => s === sorted[i]);
  if (!isSorted) {
    console.error('❌ Slugs are not sorted alphabetically');
    process.exit(1);
  }
  console.log('✅ Sorted alphabetically');

  // Check no blanks
  const blanks = slugs.filter(s => !s || s.trim().length === 0);
  if (blanks.length > 0) {
    console.error(`❌ ${blanks.length} blank slugs found`);
    process.exit(1);
  }
  console.log('✅ No blank slugs');

  console.log('\n📝 Updating src/lib/launch-cohort.ts...');

  // Read launch-cohort.ts
  const launchCohortPath = join(__dirname, '..', 'src', 'lib', 'launch-cohort.ts');
  let tsContent = readFileSync(launchCohortPath, 'utf8');

  // Build new Set content
  const slugsFormatted = slugs.map(s => `  '${s}',`).join('\n');
  const newSetContent = `// COHORT_START
export const LAUNCH_COHORT_SLUGS = new Set<string>([
  // === CURATED LAUNCH COHORT (${slugs.length} slugs) - Top Whop Affiliates ===
  // Source: data/launch-cohort-curated-101.json (CANONICAL)
  // Applied: ${new Date().toISOString().split('T')[0]}
${slugsFormatted}
]);
// COHORT_END`;

  // Replace between sentinel markers
  const sentinelRegex = /\/\/ COHORT_START[\s\S]*?\/\/ COHORT_END/;
  if (!sentinelRegex.test(tsContent)) {
    console.error('❌ Could not find COHORT_START/COHORT_END markers in launch-cohort.ts');
    process.exit(1);
  }
  tsContent = tsContent.replace(sentinelRegex, newSetContent);

  writeFileSync(launchCohortPath, tsContent);
  console.log(`✅ Updated ${launchCohortPath}`);

  console.log('\n✅ CURATED COHORT APPLIED SUCCESSFULLY');
  console.log(`   Source: ${curatedPath}`);
  console.log(`   Target: ${launchCohortPath}`);
  console.log(`   Count: ${slugs.length}`);
}

main();
