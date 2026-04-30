#!/usr/bin/env npx ts-node
/**
 * Internal Link Graph Verification Script
 *
 * Verifies that the generated link graph meets all SEO constraints.
 * Run this before deploying to ensure link integrity.
 *
 * Usage: npx ts-node scripts/verify-link-graph.ts
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = One or more checks failed
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONSTRAINTS (must match generate-link-graph.ts)
// ============================================================================

const CONSTRAINTS = {
  MIN_OUTBOUND: 6,
  MAX_OUTBOUND: 10,
  MIN_INBOUND: 1,
  MAX_INBOUND: 10,
  MAX_APPEARANCES: 10,
};

// ============================================================================
// LOAD DATA
// ============================================================================

interface DetailedGraph {
  [slug: string]: {
    recommendations: string[];
    alternatives: string[];
  };
}

function loadCohortSlugs(): string[] {
  const cohortPath = path.join(__dirname, '../src/lib/launch-cohort.ts');
  const content = fs.readFileSync(cohortPath, 'utf-8');

  const match = content.match(/\/\/ COHORT_START[\s\S]*?new Set<string>\(\[([\s\S]*?)\]\)/);
  if (!match) {
    throw new Error('Could not find LAUNCH_COHORT_SLUGS in launch-cohort.ts');
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

function loadDetailedGraph(): DetailedGraph {
  const graphPath = path.join(__dirname, '../data/detailed-link-graph.json');
  if (!fs.existsSync(graphPath)) {
    throw new Error('detailed-link-graph.json not found. Run generate-link-graph.ts first.');
  }
  return JSON.parse(fs.readFileSync(graphPath, 'utf-8'));
}

function loadNeighborsJson(): Record<string, { recommendations: string[]; alternatives: string[] }> {
  const neighborsPath = path.join(__dirname, '../public/data/graph/neighbors.json');
  if (!fs.existsSync(neighborsPath)) {
    throw new Error('neighbors.json not found. Run generate-link-graph.ts first.');
  }
  return JSON.parse(fs.readFileSync(neighborsPath, 'utf-8'));
}

// ============================================================================
// VERIFICATION CHECKS
// ============================================================================

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string[];
}

function checkAllSlugsHaveEntries(graph: DetailedGraph, slugs: string[]): CheckResult {
  const missing = slugs.filter(s => !graph[s]);
  return {
    name: 'All cohort slugs have graph entries',
    passed: missing.length === 0,
    message: missing.length === 0
      ? `✅ All ${slugs.length} slugs have entries`
      : `❌ ${missing.length} slugs missing from graph`,
    details: missing.length > 0 ? missing : undefined,
  };
}

function checkNoSelfLinks(graph: DetailedGraph): CheckResult {
  const selfLinks: string[] = [];
  for (const slug of Object.keys(graph)) {
    const entry = graph[slug];
    if (entry.recommendations.includes(slug) || entry.alternatives.includes(slug)) {
      selfLinks.push(slug);
    }
  }
  return {
    name: 'No self-links',
    passed: selfLinks.length === 0,
    message: selfLinks.length === 0
      ? '✅ No self-links found'
      : `❌ ${selfLinks.length} pages link to themselves`,
    details: selfLinks.length > 0 ? selfLinks : undefined,
  };
}

function checkNoRecsAltsOverlap(graph: DetailedGraph): CheckResult {
  const overlapping: string[] = [];
  for (const slug of Object.keys(graph)) {
    const entry = graph[slug];
    const recsSet = new Set(entry.recommendations);
    for (const alt of entry.alternatives) {
      if (recsSet.has(alt)) {
        overlapping.push(`${slug}: "${alt}" in both recs and alts`);
      }
    }
  }
  return {
    name: 'No recs/alts overlap on same page',
    passed: overlapping.length === 0,
    message: overlapping.length === 0
      ? '✅ No recs/alts overlap'
      : `❌ ${overlapping.length} overlapping entries`,
    details: overlapping.length > 0 ? overlapping.slice(0, 10) : undefined,
  };
}

function checkNoDuplicatesWithinSection(graph: DetailedGraph): CheckResult {
  const duplicates: string[] = [];
  for (const slug of Object.keys(graph)) {
    const entry = graph[slug];
    const recsSet = new Set(entry.recommendations);
    const altsSet = new Set(entry.alternatives);
    if (recsSet.size !== entry.recommendations.length) {
      duplicates.push(`${slug}: duplicates in recommendations`);
    }
    if (altsSet.size !== entry.alternatives.length) {
      duplicates.push(`${slug}: duplicates in alternatives`);
    }
  }
  return {
    name: 'No duplicates within sections',
    passed: duplicates.length === 0,
    message: duplicates.length === 0
      ? '✅ No duplicates within sections'
      : `❌ ${duplicates.length} sections have duplicates`,
    details: duplicates.length > 0 ? duplicates : undefined,
  };
}

function checkOutboundConstraints(graph: DetailedGraph): CheckResult {
  const violations: string[] = [];
  const counts: number[] = [];

  for (const slug of Object.keys(graph)) {
    const entry = graph[slug];
    const total = entry.recommendations.length + entry.alternatives.length;
    counts.push(total);

    if (total < CONSTRAINTS.MIN_OUTBOUND) {
      violations.push(`${slug}: ${total} outbound (min: ${CONSTRAINTS.MIN_OUTBOUND})`);
    }
    if (total > CONSTRAINTS.MAX_OUTBOUND) {
      violations.push(`${slug}: ${total} outbound (max: ${CONSTRAINTS.MAX_OUTBOUND})`);
    }
  }

  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

  return {
    name: `Outbound links: ${CONSTRAINTS.MIN_OUTBOUND}-${CONSTRAINTS.MAX_OUTBOUND} per page`,
    passed: violations.length === 0,
    message: violations.length === 0
      ? `✅ Outbound: min=${min}, max=${max}, avg=${avg.toFixed(1)}`
      : `❌ ${violations.length} pages violate outbound constraints`,
    details: violations.length > 0 ? violations.slice(0, 10) : undefined,
  };
}

function checkInboundConstraints(graph: DetailedGraph, slugs: string[]): CheckResult {
  const inbound: Map<string, number> = new Map();
  for (const slug of slugs) {
    inbound.set(slug, 0);
  }

  for (const source of Object.keys(graph)) {
    const entry = graph[source];
    for (const target of [...entry.recommendations, ...entry.alternatives]) {
      inbound.set(target, (inbound.get(target) || 0) + 1);
    }
  }

  const violations: string[] = [];
  const counts: number[] = [];

  for (const slug of slugs) {
    const count = inbound.get(slug) || 0;
    counts.push(count);

    if (count < CONSTRAINTS.MIN_INBOUND) {
      violations.push(`${slug}: ${count} inbound (min: ${CONSTRAINTS.MIN_INBOUND}) - ORPHAN`);
    }
    if (count > CONSTRAINTS.MAX_INBOUND) {
      violations.push(`${slug}: ${count} inbound (max: ${CONSTRAINTS.MAX_INBOUND})`);
    }
  }

  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

  return {
    name: `Inbound links: ${CONSTRAINTS.MIN_INBOUND}-${CONSTRAINTS.MAX_INBOUND} per page`,
    passed: violations.length === 0,
    message: violations.length === 0
      ? `✅ Inbound: min=${min}, max=${max}, avg=${avg.toFixed(1)}`
      : `❌ ${violations.length} pages violate inbound constraints`,
    details: violations.length > 0 ? violations.slice(0, 10) : undefined,
  };
}

function checkMaxAppearances(graph: DetailedGraph, slugs: string[]): CheckResult {
  const appearances: Map<string, number> = new Map();
  for (const slug of slugs) {
    appearances.set(slug, 0);
  }

  for (const source of Object.keys(graph)) {
    const seen = new Set<string>();
    const entry = graph[source];
    for (const target of [...entry.recommendations, ...entry.alternatives]) {
      if (!seen.has(target)) {
        seen.add(target);
        appearances.set(target, (appearances.get(target) || 0) + 1);
      }
    }
  }

  const violations: string[] = [];
  const counts: number[] = [];

  for (const slug of slugs) {
    const count = appearances.get(slug) || 0;
    counts.push(count);

    if (count > CONSTRAINTS.MAX_APPEARANCES) {
      violations.push(`${slug}: appears on ${count} pages (max: ${CONSTRAINTS.MAX_APPEARANCES})`);
    }
  }

  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

  return {
    name: `Hub abuse: max ${CONSTRAINTS.MAX_APPEARANCES} appearances`,
    passed: violations.length === 0,
    message: violations.length === 0
      ? `✅ Appearances: min=${min}, max=${max}, avg=${avg.toFixed(1)}`
      : `❌ ${violations.length} slugs exceed max appearances`,
    details: violations.length > 0 ? violations.slice(0, 10) : undefined,
  };
}

function checkAllTargetsInCohort(graph: DetailedGraph, slugs: string[]): CheckResult {
  const cohortSet = new Set(slugs);
  const external: string[] = [];

  for (const source of Object.keys(graph)) {
    const entry = graph[source];
    for (const target of [...entry.recommendations, ...entry.alternatives]) {
      if (!cohortSet.has(target)) {
        external.push(`${source} -> ${target}`);
      }
    }
  }

  return {
    name: 'All link targets are in cohort',
    passed: external.length === 0,
    message: external.length === 0
      ? '✅ All targets are valid cohort slugs'
      : `❌ ${external.length} links to non-cohort slugs`,
    details: external.length > 0 ? external.slice(0, 10) : undefined,
  };
}

function checkNeighborsJsonConsistency(
  detailed: DetailedGraph,
  neighbors: Record<string, { recommendations: string[]; alternatives: string[] }>
): CheckResult {
  const mismatches: string[] = [];

  for (const slug of Object.keys(detailed)) {
    const detailedEntry = detailed[slug];
    const neighborEntry = neighbors[slug];

    if (!neighborEntry) {
      mismatches.push(`${slug}: missing from neighbors.json`);
      continue;
    }

    // Compare recommendations
    if (detailedEntry.recommendations.length !== neighborEntry.recommendations.length) {
      mismatches.push(`${slug}: recs count mismatch`);
    } else {
      for (let i = 0; i < detailedEntry.recommendations.length; i++) {
        if (detailedEntry.recommendations[i] !== neighborEntry.recommendations[i]) {
          mismatches.push(`${slug}: recs mismatch at index ${i}`);
          break;
        }
      }
    }

    // Compare alternatives
    if (detailedEntry.alternatives.length !== neighborEntry.alternatives.length) {
      mismatches.push(`${slug}: alts count mismatch`);
    } else {
      for (let i = 0; i < detailedEntry.alternatives.length; i++) {
        if (detailedEntry.alternatives[i] !== neighborEntry.alternatives[i]) {
          mismatches.push(`${slug}: alts mismatch at index ${i}`);
          break;
        }
      }
    }
  }

  return {
    name: 'neighbors.json matches detailed-link-graph.json',
    passed: mismatches.length === 0,
    message: mismatches.length === 0
      ? '✅ Files are consistent'
      : `❌ ${mismatches.length} inconsistencies found`,
    details: mismatches.length > 0 ? mismatches.slice(0, 10) : undefined,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('INTERNAL LINK GRAPH VERIFICATION');
  console.log('='.repeat(60));
  console.log();

  // Load data
  console.log('Loading data...');
  const slugs = loadCohortSlugs();
  console.log(`  Loaded ${slugs.length} cohort slugs`);

  const detailed = loadDetailedGraph();
  console.log(`  Loaded detailed graph with ${Object.keys(detailed).length} entries`);

  const neighbors = loadNeighborsJson();
  console.log(`  Loaded neighbors.json with ${Object.keys(neighbors).length} entries`);
  console.log();

  // Run all checks
  console.log('Running verification checks...');
  console.log();

  const checks: CheckResult[] = [
    checkAllSlugsHaveEntries(detailed, slugs),
    checkNoSelfLinks(detailed),
    checkNoRecsAltsOverlap(detailed),
    checkNoDuplicatesWithinSection(detailed),
    checkOutboundConstraints(detailed),
    checkInboundConstraints(detailed, slugs),
    checkMaxAppearances(detailed, slugs),
    checkAllTargetsInCohort(detailed, slugs),
    checkNeighborsJsonConsistency(detailed, neighbors),
  ];

  let failures = 0;
  for (const check of checks) {
    console.log(`[${check.passed ? 'PASS' : 'FAIL'}] ${check.name}`);
    console.log(`       ${check.message}`);
    if (check.details && check.details.length > 0) {
      for (const detail of check.details) {
        console.log(`         - ${detail}`);
      }
    }
    console.log();
    if (!check.passed) failures++;
  }

  // Summary
  console.log('='.repeat(60));
  if (failures === 0) {
    console.log('✅ ALL CHECKS PASSED');
    console.log();
    console.log('The link graph meets all SEO constraints and is safe to deploy.');
  } else {
    console.log(`❌ ${failures} CHECK(S) FAILED`);
    console.log();
    console.log('Fix the issues above before deploying.');
    console.log('Run: npx ts-node scripts/generate-link-graph.ts');
  }
  console.log('='.repeat(60));

  process.exit(failures > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
