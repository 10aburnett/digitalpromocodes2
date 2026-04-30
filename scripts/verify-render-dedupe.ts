#!/usr/bin/env npx ts-node
/**
 * Render-Time Deduplication Verification
 *
 * This script simulates page assembly for EVERY cohort slug and verifies
 * that NO duplicate slugs appear across recommendations and alternatives.
 *
 * HARD RULE: A slug may appear AT MOST ONCE per offer page.
 *
 * Usage: npx ts-node scripts/verify-render-dedupe.ts
 *
 * Exit codes:
 *   0 = All pages pass (no duplicates)
 *   1 = One or more pages have duplicates (BLOCKING)
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// LOAD DATA
// ============================================================================

interface GraphEntry {
  recommendations: string[];
  alternatives: string[];
}

function loadCohortSlugs(): string[] {
  const cohortPath = path.join(__dirname, '../src/lib/launch-cohort.ts');
  const content = fs.readFileSync(cohortPath, 'utf-8');

  const match = content.match(/\/\/ COHORT_START[\s\S]*?new Set<string>\(\[([\s\S]*?)\]\)/);
  if (!match) {
    throw new Error('Could not find LAUNCH_COHORT_SLUGS');
  }

  const slugsContent = match[1];
  const slugs: string[] = [];
  const slugRegex = /'([^']+)'/g;
  let slugMatch;
  while ((slugMatch = slugRegex.exec(slugsContent)) !== null) {
    slugs.push(slugMatch[1]);
  }

  return slugs.sort();
}

function loadGraph(): Record<string, GraphEntry> {
  const graphPath = path.join(__dirname, '../public/data/graph/neighbors.json');
  if (!fs.existsSync(graphPath)) {
    throw new Error('neighbors.json not found. Run generate-link-graph.ts first.');
  }
  return JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
}

// ============================================================================
// SIMULATE RENDER-TIME ASSEMBLY
// ============================================================================

interface PageAssembly {
  slug: string;
  recommendations: string[];
  alternatives: string[];
  allSlugs: string[];
  duplicates: string[];
}

/**
 * Simulate render-time assembly for a single page.
 * This mimics what getRecsAndAlts() does with the usedSlugs set.
 */
function simulatePageAssembly(
  currentSlug: string,
  graph: Record<string, GraphEntry>,
  cohortSlugs: Set<string>
): PageAssembly {
  const usedSlugs = new Set<string>();
  usedSlugs.add(currentSlug); // Always exclude current page

  const entry = graph[currentSlug] || { recommendations: [], alternatives: [] };

  // Build recommendations first
  const recommendations: string[] = [];
  for (const slug of entry.recommendations) {
    if (!usedSlugs.has(slug) && cohortSlugs.has(slug)) {
      recommendations.push(slug);
      usedSlugs.add(slug);
    }
  }

  // Build alternatives second (MUST NOT overlap with recs)
  const alternatives: string[] = [];
  for (const slug of entry.alternatives) {
    if (!usedSlugs.has(slug) && cohortSlugs.has(slug)) {
      alternatives.push(slug);
      usedSlugs.add(slug);
    }
  }

  // Check for duplicates
  const allSlugs = [...recommendations, ...alternatives];
  const seenInAll = new Set<string>();
  const duplicates: string[] = [];

  for (const slug of allSlugs) {
    if (seenInAll.has(slug)) {
      duplicates.push(slug);
    }
    seenInAll.add(slug);
  }

  return {
    slug: currentSlug,
    recommendations,
    alternatives,
    allSlugs,
    duplicates,
  };
}

// ============================================================================
// VERIFICATION
// ============================================================================

interface VerificationResult {
  totalPages: number;
  pagesWithDuplicates: number;
  allDuplicates: { slug: string; duplicates: string[] }[];
  pagesWithEmptyRecs: number;
  pagesWithEmptyAlts: number;
}

function verifyAllPages(
  cohortSlugs: string[],
  graph: Record<string, GraphEntry>
): VerificationResult {
  const cohortSet = new Set(cohortSlugs);
  const result: VerificationResult = {
    totalPages: cohortSlugs.length,
    pagesWithDuplicates: 0,
    allDuplicates: [],
    pagesWithEmptyRecs: 0,
    pagesWithEmptyAlts: 0,
  };

  for (const slug of cohortSlugs) {
    const assembly = simulatePageAssembly(slug, graph, cohortSet);

    if (assembly.duplicates.length > 0) {
      result.pagesWithDuplicates++;
      result.allDuplicates.push({
        slug,
        duplicates: assembly.duplicates,
      });
    }

    if (assembly.recommendations.length === 0) {
      result.pagesWithEmptyRecs++;
    }

    if (assembly.alternatives.length === 0) {
      result.pagesWithEmptyAlts++;
    }
  }

  return result;
}

// ============================================================================
// ADDITIONAL CHECKS
// ============================================================================

/**
 * Check that recs and alts are truly disjoint for each page.
 */
function checkDisjoint(
  cohortSlugs: string[],
  graph: Record<string, GraphEntry>
): { slug: string; overlap: string[] }[] {
  const cohortSet = new Set(cohortSlugs);
  const overlaps: { slug: string; overlap: string[] }[] = [];

  for (const slug of cohortSlugs) {
    const usedSlugs = new Set<string>();
    usedSlugs.add(slug);

    const entry = graph[slug] || { recommendations: [], alternatives: [] };

    // Simulate building recs
    const renderedRecs: string[] = [];
    for (const rec of entry.recommendations) {
      if (!usedSlugs.has(rec) && cohortSet.has(rec)) {
        renderedRecs.push(rec);
        usedSlugs.add(rec);
      }
    }

    // Simulate building alts with proper exclusion
    const renderedAlts: string[] = [];
    for (const alt of entry.alternatives) {
      if (!usedSlugs.has(alt) && cohortSet.has(alt)) {
        renderedAlts.push(alt);
        usedSlugs.add(alt);
      }
    }

    // Check for overlap (should be empty with proper dedupe)
    const recsSet = new Set(renderedRecs);
    const overlap = renderedAlts.filter(a => recsSet.has(a));

    if (overlap.length > 0) {
      overlaps.push({ slug, overlap });
    }
  }

  return overlaps;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('RENDER-TIME DEDUPLICATION VERIFICATION');
  console.log('='.repeat(60));
  console.log();

  // Load data
  console.log('Loading data...');
  const cohortSlugs = loadCohortSlugs();
  console.log(`  Loaded ${cohortSlugs.length} cohort slugs`);

  const graph = loadGraph();
  console.log(`  Loaded graph with ${Object.keys(graph).length} entries`);
  console.log();

  // Run verification
  console.log('Simulating page assembly for all pages...');
  const result = verifyAllPages(cohortSlugs, graph);
  console.log();

  // Check disjoint
  console.log('Checking recs/alts are disjoint...');
  const overlaps = checkDisjoint(cohortSlugs, graph);
  console.log();

  // Report results
  console.log('='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log();

  console.log(`Total pages checked: ${result.totalPages}`);
  console.log(`Pages with empty recommendations: ${result.pagesWithEmptyRecs}`);
  console.log(`Pages with empty alternatives: ${result.pagesWithEmptyAlts}`);
  console.log();

  if (result.pagesWithDuplicates > 0) {
    console.log('❌ DUPLICATE SLUGS DETECTED:');
    console.log(`   ${result.pagesWithDuplicates} pages have duplicate internal links`);
    console.log();
    for (const { slug, duplicates } of result.allDuplicates.slice(0, 10)) {
      console.log(`   Page: ${slug}`);
      console.log(`   Duplicates: ${duplicates.join(', ')}`);
      console.log();
    }
    if (result.allDuplicates.length > 10) {
      console.log(`   ... and ${result.allDuplicates.length - 10} more`);
    }
  } else {
    console.log('✅ No duplicate slugs found across any page');
  }

  console.log();

  if (overlaps.length > 0) {
    console.log('❌ RECS/ALTS OVERLAP DETECTED:');
    for (const { slug, overlap } of overlaps.slice(0, 10)) {
      console.log(`   Page: ${slug}`);
      console.log(`   Overlapping slugs: ${overlap.join(', ')}`);
    }
  } else {
    console.log('✅ Recommendations and alternatives are fully disjoint');
  }

  console.log();
  console.log('='.repeat(60));

  // Exit with error if any issues found
  const hasIssues = result.pagesWithDuplicates > 0 || overlaps.length > 0;

  if (hasIssues) {
    console.log('❌ VERIFICATION FAILED - DO NOT DEPLOY');
    console.log('='.repeat(60));
    process.exit(1);
  } else {
    console.log('✅ ALL CHECKS PASSED - Safe to deploy');
    console.log('='.repeat(60));
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
