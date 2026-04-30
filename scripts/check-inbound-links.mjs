#!/usr/bin/env node
import { readFileSync } from 'fs';

const graph = JSON.parse(readFileSync('./src/data/graph/neighbors.json', 'utf8'));
const allSlugs = Object.keys(graph);

// Count inbound links for each slug
const inboundCount = {};
allSlugs.forEach(slug => inboundCount[slug] = 0);

// Go through each page's outbound links
for (const [slug, data] of Object.entries(graph)) {
  const outbound = [...(data.recommendations || []), ...(data.alternatives || [])];
  for (const target of outbound) {
    if (inboundCount[target] !== undefined) {
      inboundCount[target]++;
    }
  }
}

// Find orphans (0 inbound links)
const orphans = allSlugs.filter(slug => inboundCount[slug] === 0);

// Stats
const counts = Object.values(inboundCount);
const min = Math.min(...counts);
const max = Math.max(...counts);
const avg = (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1);

console.log('INBOUND LINK ANALYSIS');
console.log('='.repeat(60));
console.log('Total pages:', allSlugs.length);
console.log('');
console.log('Inbound links per page:');
console.log('  Min:', min);
console.log('  Max:', max);
console.log('  Avg:', avg);
console.log('');
console.log('Orphan pages (0 inbound):', orphans.length);

if (orphans.length > 0) {
  console.log('');
  console.log('ORPHANS:');
  orphans.forEach(s => console.log('  - ' + s));
} else {
  console.log('');
  console.log('✅ ALL PAGES HAVE AT LEAST 1 INBOUND LINK');
}

// Also check the new 16 specifically (4 removed: korvato-gold-rush, metatradingai, growthopia-fz-llc, liv-cam-paid)
const new16 = ['airbnb-empire-builder', 'm1-capital-accelerator', 'alliance-group-coaching', 'the-8-figure-masterclass', 'daniel-g-hubzome-lda-speaking', 'minotaur-consulting-services', 'omnifunds', 'million-dollar-brand-club', 'global-wealth-mentorship', 'asgard-bootcamp', 'youtube-consulting', 'lifetime-diamond-package-', '200k-500k-challenge', 'lux-nomads-essentials', 'innova-trade-ai', 'devvy'];

console.log('');
console.log('NEW 16 SLUGS INBOUND LINKS:');
console.log('-'.repeat(60));
new16.forEach(slug => {
  const count = inboundCount[slug] || 0;
  const status = count > 0 ? '✅' : '❌';
  console.log(`  ${status} ${slug}: ${count} inbound`);
});
