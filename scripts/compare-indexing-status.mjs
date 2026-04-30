#!/usr/bin/env node
/**
 * Compare indexingStatus, indexing, retired, retirement fields between production and backup
 */

import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

async function compare() {
  console.log('='.repeat(70));
  console.log('Comparing Production vs Backup Database');
  console.log('Fields: indexingStatus, indexing, retired, retirement');
  console.log('='.repeat(70));
  console.log();

  const prodDeals = await prod.deal.findMany({
    select: {
      slug: true,
      indexingStatus: true,
      indexing: true,
      retired: true,
      retirement: true
    },
    orderBy: { slug: 'asc' }
  });

  const backupDeals = await backup.deal.findMany({
    select: {
      slug: true,
      indexingStatus: true,
      indexing: true,
      retired: true,
      retirement: true
    },
    orderBy: { slug: 'asc' }
  });

  console.log(`Production deals: ${prodDeals.length}`);
  console.log(`Backup deals: ${backupDeals.length}`);
  console.log();

  const backupMap = new Map(backupDeals.map(d => [d.slug, d]));
  const prodMap = new Map(prodDeals.map(d => [d.slug, d]));

  let matching = 0;
  let mismatched = 0;
  let onlyInProd = 0;
  let onlyInBackup = 0;
  const mismatches = [];

  // Check production deals
  for (const p of prodDeals) {
    const b = backupMap.get(p.slug);
    if (!b) {
      onlyInProd++;
      console.log(`❌ Only in PRODUCTION: ${p.slug}`);
      continue;
    }

    const indexingStatusMatch = b.indexingStatus === p.indexingStatus;
    const indexingMatch = b.indexing === p.indexing;
    const retiredMatch = b.retired === p.retired;
    const retirementMatch = (b.retirement?.getTime?.() || b.retirement) === (p.retirement?.getTime?.() || p.retirement);

    if (indexingStatusMatch && indexingMatch && retiredMatch && retirementMatch) {
      matching++;
    } else {
      mismatched++;
      const diff = {
        slug: p.slug,
        fields: []
      };
      if (!indexingStatusMatch) diff.fields.push(`indexingStatus: PROD=${p.indexingStatus} vs BACKUP=${b.indexingStatus}`);
      if (!indexingMatch) diff.fields.push(`indexing: PROD=${p.indexing} vs BACKUP=${b.indexing}`);
      if (!retiredMatch) diff.fields.push(`retired: PROD=${p.retired} vs BACKUP=${b.retired}`);
      if (!retirementMatch) diff.fields.push(`retirement: PROD=${p.retirement} vs BACKUP=${b.retirement}`);
      mismatches.push(diff);
    }
  }

  // Check for deals only in backup
  for (const b of backupDeals) {
    if (!prodMap.has(b.slug)) {
      onlyInBackup++;
      console.log(`❌ Only in BACKUP: ${b.slug}`);
    }
  }

  console.log();
  console.log('='.repeat(70));
  console.log('RESULTS:');
  console.log('='.repeat(70));
  console.log(`✅ Matching: ${matching}`);
  console.log(`❌ Mismatched: ${mismatched}`);
  console.log(`📦 Only in production: ${onlyInProd}`);
  console.log(`📦 Only in backup: ${onlyInBackup}`);
  console.log();

  if (mismatches.length > 0) {
    console.log('MISMATCHES:');
    console.log('-'.repeat(70));
    for (const m of mismatches) {
      console.log(`  ${m.slug}:`);
      for (const f of m.fields) {
        console.log(`    - ${f}`);
      }
    }
  } else {
    console.log('🎉 ALL 4 FIELDS MATCH PERFECTLY BETWEEN DATABASES!');
  }

  await prod.$disconnect();
  await backup.$disconnect();
}

compare().catch(console.error);
