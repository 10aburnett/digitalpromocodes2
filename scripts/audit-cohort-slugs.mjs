/**
 * Audit Cohort Slugs
 *
 * Reads data/launch-cohort-curated-101.json and outputs an audit report
 * showing any slugs with unusual characteristics.
 *
 * This is an AUDIT REPORT, not a build blocker.
 *
 * Usage: node scripts/audit-cohort-slugs.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function main() {
  console.log('🔍 COHORT SLUG AUDIT REPORT');
  console.log('===========================\n');

  // Read curated cohort file
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

  if (!Array.isArray(slugs)) {
    console.error('❌ curated.slugs is not an array');
    process.exit(1);
  }

  console.log(`📊 Total slugs: ${slugs.length}\n`);

  // Audit: Leading hyphens
  const leadingHyphen = slugs.filter(s => s.startsWith('-'));
  console.log(`⚠️  Leading hyphen: ${leadingHyphen.length}`);
  if (leadingHyphen.length > 0) {
    leadingHyphen.forEach(s => console.log(`   • ${s}`));
  }
  console.log('');

  // Audit: Trailing hyphens
  const trailingHyphen = slugs.filter(s => s.endsWith('-'));
  console.log(`⚠️  Trailing hyphen: ${trailingHyphen.length}`);
  if (trailingHyphen.length > 0) {
    trailingHyphen.forEach(s => console.log(`   • ${s}`));
  }
  console.log('');

  // Audit: Double hyphens
  const doubleHyphen = slugs.filter(s => s.includes('--'));
  console.log(`⚠️  Double hyphens (--): ${doubleHyphen.length}`);
  if (doubleHyphen.length > 0) {
    doubleHyphen.forEach(s => console.log(`   • ${s}`));
  }
  console.log('');

  // Audit: Non [a-z0-9-] characters
  const nonAlphanumeric = slugs.filter(s => !/^[a-z0-9-]+$/.test(s));
  console.log(`⚠️  Non [a-z0-9-] characters: ${nonAlphanumeric.length}`);
  if (nonAlphanumeric.length > 0) {
    nonAlphanumeric.forEach(s => {
      const badChars = s.replace(/[a-z0-9-]/g, '');
      console.log(`   • ${s} (contains: ${badChars})`);
    });
  }
  console.log('');

  // Audit: Short slugs (< 8 characters)
  const shortSlugs = slugs.filter(s => s.length < 8);
  console.log(`⚠️  Short slugs (< 8 chars): ${shortSlugs.length}`);
  if (shortSlugs.length > 0) {
    shortSlugs.forEach(s => console.log(`   • ${s} (${s.length} chars)`));
  }
  console.log('');

  // Audit: Long slugs (> 60 characters)
  const longSlugs = slugs.filter(s => s.length > 60);
  console.log(`⚠️  Long slugs (> 60 chars): ${longSlugs.length}`);
  if (longSlugs.length > 0) {
    longSlugs.forEach(s => console.log(`   • ${s} (${s.length} chars)`));
  }
  console.log('');

  // Summary
  const totalIssues = leadingHyphen.length + trailingHyphen.length +
                      doubleHyphen.length + nonAlphanumeric.length +
                      shortSlugs.length + longSlugs.length;

  console.log('═══════════════════════════════════════');
  if (totalIssues === 0) {
    console.log('✅ ALL SLUGS PASS AUDIT (no unusual characteristics)');
  } else {
    console.log(`ℹ️  AUDIT COMPLETE: ${totalIssues} total items flagged`);
    console.log('   (These are informational only, not blockers)');
  }
  console.log('═══════════════════════════════════════');
}

main();
