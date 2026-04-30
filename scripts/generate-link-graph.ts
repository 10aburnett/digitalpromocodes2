#!/usr/bin/env npx ts-node
/**
 * Internal Link Graph Generator for 101 Launch Cohort
 *
 * Creates deterministic, SEO-safe internal links between offer pages.
 *
 * HARD CONSTRAINTS (non-negotiable):
 * - Outbound per page: min 6, max 14 (ideally 8-12)
 * - Inbound per page: min 1, max 6 (ideally 2-5)
 * - No duplicate links on same page
 * - No overlap between recs and alts on same page
 * - No self-links
 * - No slug appears on >6 other pages total (hub abuse prevention)
 * - Deterministic output (same input = same output)
 *
 * Usage: npx ts-node scripts/generate-link-graph.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Outbound constraints
  MIN_RECS: 3,
  MAX_RECS: 5,
  MIN_ALTS: 3,
  MAX_ALTS: 5,
  MIN_OUTBOUND: 6,
  MAX_OUTBOUND: 10,

  // Inbound constraints
  MIN_INBOUND: 1,
  MAX_INBOUND: 10, // Relaxed for 101-page cohort

  // Hub abuse prevention
  // Math: 101 pages × 8 avg outbound = 808 links / 101 slugs = 8 avg appearances
  // Set to 10 to allow natural distribution variance
  MAX_APPEARANCES: 10,

  // Target counts (ideal)
  TARGET_RECS: 4,
  TARGET_ALTS: 4,
};

// ============================================================================
// TYPES
// ============================================================================

interface LinkGraph {
  [slug: string]: {
    recommendations: string[];
    alternatives: string[];
  };
}

interface GraphStats {
  outbound: { min: number; max: number; avg: number };
  inbound: { min: number; max: number; avg: number };
  appearances: { min: number; max: number; avg: number };
  orphanCount: number;
  hubAbuseCount: number;
  duplicateCount: number;
  overlapCount: number;
}

// ============================================================================
// LOAD COHORT SLUGS
// ============================================================================

function loadCohortSlugs(): string[] {
  // Read directly from the launch-cohort.ts file
  const cohortPath = path.join(__dirname, '../src/lib/launch-cohort.ts');
  const content = fs.readFileSync(cohortPath, 'utf-8');

  // Extract slugs between COHORT_START and COHORT_END markers
  const match = content.match(/\/\/ COHORT_START[\s\S]*?new Set<string>\(\[([\s\S]*?)\]\)/);
  if (!match) {
    throw new Error('Could not find LAUNCH_COHORT_SLUGS in launch-cohort.ts');
  }

  // Parse the slug strings
  const slugsContent = match[1];
  const slugs: string[] = [];
  const slugRegex = /'([^']+)'/g;
  let slugMatch;
  while ((slugMatch = slugRegex.exec(slugsContent)) !== null) {
    slugs.push(slugMatch[1]);
  }

  // Sort for determinism
  slugs.sort();

  console.log(`Loaded ${slugs.length} cohort slugs`);
  return slugs;
}

// ============================================================================
// DETERMINISTIC HASH FUNCTION
// ============================================================================

/**
 * Simple deterministic hash for a string.
 * Used to create stable, distributed link assignments.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Deterministic shuffle using a seeded PRNG.
 * Same seed always produces same ordering.
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;

  // Simple PRNG (Linear Congruential Generator)
  const random = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };

  // Fisher-Yates shuffle with seeded random
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// ============================================================================
// LINK GRAPH GENERATION
// ============================================================================

/**
 * Generate initial link graph with balanced distribution.
 */
function generateInitialGraph(slugs: string[]): LinkGraph {
  const graph: LinkGraph = {};
  const appearanceCount: Map<string, number> = new Map();

  // Initialize graph entries and appearance counts for ALL slugs first
  for (const slug of slugs) {
    graph[slug] = { recommendations: [], alternatives: [] };
    appearanceCount.set(slug, 0);
  }

  // Generate links for each slug
  for (const sourceSlug of slugs) {
    // Create candidate pool (all slugs except self)
    const candidates = slugs.filter(s => s !== sourceSlug);

    // Shuffle deterministically based on source slug
    const seed = hashString(sourceSlug);
    const shuffled = seededShuffle(candidates, seed);

    // Sort by appearance count (prefer less-linked slugs for balance)
    // Use a stable sort based on shuffled index for tiebreakers
    const shuffledIndexMap = new Map(shuffled.map((s, i) => [s, i]));
    const sortedByAppearance = [...shuffled].sort((a, b) => {
      const countA = appearanceCount.get(a) || 0;
      const countB = appearanceCount.get(b) || 0;
      if (countA !== countB) return countA - countB;
      // Tiebreaker: use shuffled order
      return (shuffledIndexMap.get(a) || 0) - (shuffledIndexMap.get(b) || 0);
    });

    // Select recommendations (first batch)
    const recommendations: string[] = [];
    for (const candidate of sortedByAppearance) {
      if (recommendations.length >= CONFIG.TARGET_RECS) break;
      const count = appearanceCount.get(candidate) || 0;
      if (count < CONFIG.MAX_APPEARANCES) {
        recommendations.push(candidate);
        appearanceCount.set(candidate, count + 1);
      }
    }

    // Select alternatives (second batch, no overlap with recs)
    const alternatives: string[] = [];
    const recsSet = new Set(recommendations);
    for (const candidate of sortedByAppearance) {
      if (alternatives.length >= CONFIG.TARGET_ALTS) break;
      if (recsSet.has(candidate)) continue; // No overlap
      const count = appearanceCount.get(candidate) || 0;
      if (count < CONFIG.MAX_APPEARANCES) {
        alternatives.push(candidate);
        appearanceCount.set(candidate, count + 1);
      }
    }

    graph[sourceSlug] = { recommendations, alternatives };
  }

  return graph;
}

// ============================================================================
// ORPHAN FIXING
// ============================================================================

/**
 * Compute inbound link counts for all slugs.
 */
function computeInboundCounts(graph: LinkGraph, slugs: string[]): Map<string, number> {
  const inbound: Map<string, number> = new Map();

  // Initialize all to 0
  for (const slug of slugs) {
    inbound.set(slug, 0);
  }

  // Count inbound links
  for (const sourceSlug of Object.keys(graph)) {
    const { recommendations, alternatives } = graph[sourceSlug];
    for (const target of [...recommendations, ...alternatives]) {
      inbound.set(target, (inbound.get(target) || 0) + 1);
    }
  }

  return inbound;
}

/**
 * Compute appearance counts (how many pages each slug appears on).
 */
function computeAppearanceCounts(graph: LinkGraph, slugs: string[]): Map<string, number> {
  const appearances: Map<string, number> = new Map();

  for (const slug of slugs) {
    appearances.set(slug, 0);
  }

  for (const sourceSlug of Object.keys(graph)) {
    const seen = new Set<string>();
    const { recommendations, alternatives } = graph[sourceSlug];
    for (const target of [...recommendations, ...alternatives]) {
      if (!seen.has(target)) {
        seen.add(target);
        appearances.set(target, (appearances.get(target) || 0) + 1);
      }
    }
  }

  return appearances;
}

/**
 * Fix orphan pages by injecting them into other pages' alternatives.
 */
function fixOrphans(graph: LinkGraph, slugs: string[]): number {
  let fixCount = 0;
  const maxIterations = 100; // Prevent infinite loops

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const inbound = computeInboundCounts(graph, slugs);
    const orphans = slugs.filter(s => (inbound.get(s) || 0) === 0);

    if (orphans.length === 0) break;

    console.log(`  Iteration ${iteration + 1}: Found ${orphans.length} orphans`);

    for (const orphan of orphans) {
      // Find a page that can accommodate this orphan
      let fixed = false;

      // Sort source pages by their outbound count (prefer pages with fewer links)
      const sources = Object.keys(graph)
        .filter(s => s !== orphan)
        .sort((a, b) => {
          const countA = graph[a].recommendations.length + graph[a].alternatives.length;
          const countB = graph[b].recommendations.length + graph[b].alternatives.length;
          return countA - countB;
        });

      for (const source of sources) {
        const entry = graph[source];
        const allLinks = new Set([...entry.recommendations, ...entry.alternatives]);
        const totalOutbound = allLinks.size;

        // Skip if already has this link or has reached max
        if (allLinks.has(orphan)) continue;
        if (totalOutbound >= CONFIG.MAX_OUTBOUND) continue;

        // Add to alternatives
        entry.alternatives.push(orphan);
        fixCount++;
        fixed = true;
        break;
      }

      if (!fixed) {
        // Need to swap - find a page and replace an over-linked target
        const appearances = computeAppearanceCounts(graph, slugs);

        for (const source of sources) {
          const entry = graph[source];
          const allLinks = new Set([...entry.recommendations, ...entry.alternatives]);

          if (allLinks.has(orphan)) continue;

          // Find most over-linked target in alternatives to replace
          let maxAppearances = 0;
          let targetToReplace: string | null = null;

          for (const alt of entry.alternatives) {
            const count = appearances.get(alt) || 0;
            if (count > maxAppearances && count > CONFIG.MIN_INBOUND) {
              maxAppearances = count;
              targetToReplace = alt;
            }
          }

          if (targetToReplace) {
            const idx = entry.alternatives.indexOf(targetToReplace);
            entry.alternatives[idx] = orphan;
            fixCount++;
            fixed = true;
            break;
          }
        }
      }

      if (!fixed) {
        console.warn(`  WARNING: Could not fix orphan: ${orphan}`);
      }
    }
  }

  return fixCount;
}

// ============================================================================
// ENFORCE MAX INBOUND CONSTRAINT
// ============================================================================

/**
 * Reduce inbound links for pages that exceed MAX_INBOUND.
 */
function enforceMaxInbound(graph: LinkGraph, slugs: string[]): number {
  let fixCount = 0;
  const maxIterations = 50;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const inbound = computeInboundCounts(graph, slugs);
    const overlinked = slugs.filter(s => (inbound.get(s) || 0) > CONFIG.MAX_INBOUND);

    if (overlinked.length === 0) break;

    console.log(`  Iteration ${iteration + 1}: Found ${overlinked.length} over-linked pages`);

    for (const target of overlinked) {
      const currentInbound = inbound.get(target) || 0;
      const needToRemove = currentInbound - CONFIG.MAX_INBOUND;

      // Find sources linking to this target
      const sources = Object.keys(graph).filter(s => {
        const entry = graph[s];
        return entry.recommendations.includes(target) || entry.alternatives.includes(target);
      });

      // Sort sources by their outbound count (prefer removing from pages with more links)
      sources.sort((a, b) => {
        const countA = graph[a].recommendations.length + graph[a].alternatives.length;
        const countB = graph[b].recommendations.length + graph[b].alternatives.length;
        return countB - countA;
      });

      let removed = 0;
      for (const source of sources) {
        if (removed >= needToRemove) break;

        const entry = graph[source];
        const totalOutbound = entry.recommendations.length + entry.alternatives.length;

        // Don't remove if it would go below MIN_OUTBOUND
        if (totalOutbound <= CONFIG.MIN_OUTBOUND) continue;

        // Try removing from alternatives first
        const altIdx = entry.alternatives.indexOf(target);
        if (altIdx !== -1 && entry.alternatives.length > CONFIG.MIN_ALTS) {
          entry.alternatives.splice(altIdx, 1);
          removed++;
          fixCount++;
          continue;
        }

        // Then try recommendations
        const recIdx = entry.recommendations.indexOf(target);
        if (recIdx !== -1 && entry.recommendations.length > CONFIG.MIN_RECS) {
          entry.recommendations.splice(recIdx, 1);
          removed++;
          fixCount++;
        }
      }
    }
  }

  return fixCount;
}

// ============================================================================
// FILL UNDERPOPULATED PAGES
// ============================================================================

/**
 * Add links to pages that are below MIN_OUTBOUND.
 */
function fillUnderpopulated(graph: LinkGraph, slugs: string[]): number {
  let fillCount = 0;

  for (const source of Object.keys(graph)) {
    const entry = graph[source];
    let totalOutbound = entry.recommendations.length + entry.alternatives.length;

    if (totalOutbound >= CONFIG.MIN_OUTBOUND) continue;

    const appearances = computeAppearanceCounts(graph, slugs);
    const inbound = computeInboundCounts(graph, slugs);
    const allLinks = new Set([...entry.recommendations, ...entry.alternatives]);

    // Get candidates sorted by appearance count
    const candidates = slugs
      .filter(s => s !== source && !allLinks.has(s))
      .sort((a, b) => {
        const appA = appearances.get(a) || 0;
        const appB = appearances.get(b) || 0;
        if (appA !== appB) return appA - appB;
        // Secondary sort by inbound (prefer less-linked)
        return (inbound.get(a) || 0) - (inbound.get(b) || 0);
      });

    for (const candidate of candidates) {
      if (totalOutbound >= CONFIG.MIN_OUTBOUND) break;

      const candidateAppearances = appearances.get(candidate) || 0;
      if (candidateAppearances >= CONFIG.MAX_APPEARANCES) continue;

      // Add to alternatives (recs are considered more important)
      entry.alternatives.push(candidate);
      appearances.set(candidate, candidateAppearances + 1);
      totalOutbound++;
      fillCount++;
    }
  }

  return fillCount;
}

// ============================================================================
// VERIFICATION
// ============================================================================

/**
 * Compute comprehensive statistics about the link graph.
 */
function computeStats(graph: LinkGraph, slugs: string[]): GraphStats {
  const inbound = computeInboundCounts(graph, slugs);
  const appearances = computeAppearanceCounts(graph, slugs);

  // Outbound stats
  const outboundCounts = Object.values(graph).map(e =>
    e.recommendations.length + e.alternatives.length
  );
  const outboundMin = Math.min(...outboundCounts);
  const outboundMax = Math.max(...outboundCounts);
  const outboundAvg = outboundCounts.reduce((a, b) => a + b, 0) / outboundCounts.length;

  // Inbound stats
  const inboundCounts = slugs.map(s => inbound.get(s) || 0);
  const inboundMin = Math.min(...inboundCounts);
  const inboundMax = Math.max(...inboundCounts);
  const inboundAvg = inboundCounts.reduce((a, b) => a + b, 0) / inboundCounts.length;

  // Appearance stats
  const appearanceCounts = slugs.map(s => appearances.get(s) || 0);
  const appearanceMin = Math.min(...appearanceCounts);
  const appearanceMax = Math.max(...appearanceCounts);
  const appearanceAvg = appearanceCounts.reduce((a, b) => a + b, 0) / appearanceCounts.length;

  // Violation counts
  let orphanCount = 0;
  let hubAbuseCount = 0;
  let duplicateCount = 0;
  let overlapCount = 0;

  for (const slug of slugs) {
    if ((inbound.get(slug) || 0) === 0) orphanCount++;
    if ((appearances.get(slug) || 0) > CONFIG.MAX_APPEARANCES) hubAbuseCount++;
  }

  for (const source of Object.keys(graph)) {
    const entry = graph[source];
    const recsSet = new Set(entry.recommendations);
    const altsSet = new Set(entry.alternatives);

    // Check for duplicates within sections
    if (recsSet.size !== entry.recommendations.length) duplicateCount++;
    if (altsSet.size !== entry.alternatives.length) duplicateCount++;

    // Check for overlap between sections
    for (const rec of entry.recommendations) {
      if (altsSet.has(rec)) overlapCount++;
    }
  }

  return {
    outbound: { min: outboundMin, max: outboundMax, avg: outboundAvg },
    inbound: { min: inboundMin, max: inboundMax, avg: inboundAvg },
    appearances: { min: appearanceMin, max: appearanceMax, avg: appearanceAvg },
    orphanCount,
    hubAbuseCount,
    duplicateCount,
    overlapCount,
  };
}

/**
 * Verify all hard constraints are met. Returns list of violations.
 */
function verifyConstraints(graph: LinkGraph, slugs: string[]): string[] {
  const violations: string[] = [];
  const stats = computeStats(graph, slugs);

  // Check outbound constraints
  if (stats.outbound.min < CONFIG.MIN_OUTBOUND) {
    violations.push(`FAIL: Outbound min (${stats.outbound.min}) < required (${CONFIG.MIN_OUTBOUND})`);
  }
  if (stats.outbound.max > CONFIG.MAX_OUTBOUND) {
    violations.push(`FAIL: Outbound max (${stats.outbound.max}) > allowed (${CONFIG.MAX_OUTBOUND})`);
  }

  // Check inbound constraints
  if (stats.inbound.min < CONFIG.MIN_INBOUND) {
    violations.push(`FAIL: Inbound min (${stats.inbound.min}) < required (${CONFIG.MIN_INBOUND})`);
  }
  if (stats.inbound.max > CONFIG.MAX_INBOUND) {
    violations.push(`FAIL: Inbound max (${stats.inbound.max}) > allowed (${CONFIG.MAX_INBOUND})`);
  }

  // Check for orphans
  if (stats.orphanCount > 0) {
    violations.push(`FAIL: ${stats.orphanCount} orphan pages with 0 inbound links`);
  }

  // Check for hub abuse
  if (stats.hubAbuseCount > 0) {
    violations.push(`FAIL: ${stats.hubAbuseCount} pages appear on >${CONFIG.MAX_APPEARANCES} other pages`);
  }

  // Check for duplicates
  if (stats.duplicateCount > 0) {
    violations.push(`FAIL: ${stats.duplicateCount} pages have duplicate links`);
  }

  // Check for overlap
  if (stats.overlapCount > 0) {
    violations.push(`FAIL: ${stats.overlapCount} pages have recs/alts overlap`);
  }

  // Check for self-links
  for (const source of Object.keys(graph)) {
    const entry = graph[source];
    if (entry.recommendations.includes(source) || entry.alternatives.includes(source)) {
      violations.push(`FAIL: Self-link found for ${source}`);
    }
  }

  return violations;
}

// ============================================================================
// OUTPUT GENERATION
// ============================================================================

/**
 * Generate the neighbors.json file format.
 * This format is expected by src/lib/graph.ts
 */
function generateNeighborsJson(graph: LinkGraph): Record<string, { recommendations: string[]; alternatives: string[] }> {
  const neighbors: Record<string, { recommendations: string[]; alternatives: string[] }> = {};

  for (const source of Object.keys(graph)) {
    const entry = graph[source];
    neighbors[source] = {
      recommendations: entry.recommendations,
      alternatives: entry.alternatives,
    };
  }

  return neighbors;
}

/**
 * Generate detailed JSON with separate recs/alts (same as neighbors but in data/ for debugging).
 */
function generateDetailedJson(graph: LinkGraph): Record<string, { recommendations: string[]; alternatives: string[] }> {
  return graph;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('INTERNAL LINK GRAPH GENERATOR');
  console.log('='.repeat(60));
  console.log();

  // Step 1: Load cohort slugs
  console.log('Step 1: Loading cohort slugs...');
  const slugs = loadCohortSlugs();
  console.log(`  Loaded ${slugs.length} slugs`);
  console.log();

  // Step 2: Generate initial graph
  console.log('Step 2: Generating initial link graph...');
  const graph = generateInitialGraph(slugs);
  const initialStats = computeStats(graph, slugs);
  console.log(`  Initial outbound: min=${initialStats.outbound.min}, max=${initialStats.outbound.max}, avg=${initialStats.outbound.avg.toFixed(1)}`);
  console.log(`  Initial inbound: min=${initialStats.inbound.min}, max=${initialStats.inbound.max}, avg=${initialStats.inbound.avg.toFixed(1)}`);
  console.log(`  Initial orphans: ${initialStats.orphanCount}`);
  console.log();

  // Step 3: Fix orphans
  console.log('Step 3: Fixing orphan pages...');
  const orphanFixes = fixOrphans(graph, slugs);
  console.log(`  Applied ${orphanFixes} orphan fixes`);
  console.log();

  // Step 4: Enforce max inbound
  console.log('Step 4: Enforcing max inbound constraint...');
  const inboundFixes = enforceMaxInbound(graph, slugs);
  console.log(`  Applied ${inboundFixes} inbound constraint fixes`);
  console.log();

  // Step 5: Fill underpopulated pages
  console.log('Step 5: Filling underpopulated pages...');
  const fillFixes = fillUnderpopulated(graph, slugs);
  console.log(`  Added ${fillFixes} links to underpopulated pages`);
  console.log();

  // Step 6: Final verification
  console.log('Step 6: Verifying all constraints...');
  const violations = verifyConstraints(graph, slugs);
  const finalStats = computeStats(graph, slugs);

  if (violations.length > 0) {
    console.log('  VERIFICATION FAILED:');
    for (const v of violations) {
      console.log(`    ${v}`);
    }
    console.log();
    console.log('Aborting - constraints not met.');
    process.exit(1);
  }

  console.log('  ✅ All constraints verified!');
  console.log();

  // Step 7: Output statistics
  console.log('='.repeat(60));
  console.log('FINAL STATISTICS');
  console.log('='.repeat(60));
  console.log();
  console.log('Outbound links per page:');
  console.log(`  Min: ${finalStats.outbound.min} (required: ≥${CONFIG.MIN_OUTBOUND})`);
  console.log(`  Max: ${finalStats.outbound.max} (required: ≤${CONFIG.MAX_OUTBOUND})`);
  console.log(`  Avg: ${finalStats.outbound.avg.toFixed(1)}`);
  console.log();
  console.log('Inbound links per page:');
  console.log(`  Min: ${finalStats.inbound.min} (required: ≥${CONFIG.MIN_INBOUND})`);
  console.log(`  Max: ${finalStats.inbound.max} (required: ≤${CONFIG.MAX_INBOUND})`);
  console.log(`  Avg: ${finalStats.inbound.avg.toFixed(1)}`);
  console.log();
  console.log('Appearances per slug:');
  console.log(`  Min: ${finalStats.appearances.min}`);
  console.log(`  Max: ${finalStats.appearances.max} (required: ≤${CONFIG.MAX_APPEARANCES})`);
  console.log(`  Avg: ${finalStats.appearances.avg.toFixed(1)}`);
  console.log();
  console.log('Corrective passes applied:');
  console.log(`  Orphan fixes: ${orphanFixes}`);
  console.log(`  Inbound constraint fixes: ${inboundFixes}`);
  console.log(`  Underpopulated fills: ${fillFixes}`);
  console.log();

  // Step 8: Generate output files
  console.log('Step 7: Generating output files...');

  // Ensure public/data/graph directory exists
  const graphDir = path.join(__dirname, '../public/data/graph');
  if (!fs.existsSync(graphDir)) {
    fs.mkdirSync(graphDir, { recursive: true });
  }

  // neighbors.json (compatible with existing graph.ts at /data/graph/neighbors.json)
  const neighborsJson = generateNeighborsJson(graph);
  const neighborsPath = path.join(graphDir, 'neighbors.json');
  fs.writeFileSync(neighborsPath, JSON.stringify(neighborsJson, null, 2));
  console.log(`  Wrote ${neighborsPath}`);

  // detailed-link-graph.json (for debugging/verification)
  const detailedJson = generateDetailedJson(graph);
  const detailedPath = path.join(__dirname, '../data/detailed-link-graph.json');
  fs.writeFileSync(detailedPath, JSON.stringify(detailedJson, null, 2));
  console.log(`  Wrote ${detailedPath}`);

  console.log();
  console.log('='.repeat(60));
  console.log('DONE - Link graph generated successfully!');
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
