#!/usr/bin/env node
/**
 * Sync indexingStatus, retired, retirement, and indexing fields from production DB to backup DB
 * One-time script to bring backup in sync with production
 */

import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const DRY = process.argv.includes("--dry") || process.argv.includes("-n");

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

async function syncOfferStatuses() {
  console.log('='.repeat(70));
  console.log('PRODUCTION WINS - Offer Status Sync to Backup');
  console.log('(indexingStatus, indexing, retired, retirement, redirectToPath)');
  console.log(`Mode: ${DRY ? '🧪 DRY-RUN' : '✅ LIVE'}`);
  console.log('='.repeat(70));
  console.log();

  // Get all deals with status fields from production
  const prodDeals = await prod.deal.findMany({
    select: {
      slug: true,
      indexingStatus: true,
      indexing: true,
      retired: true,
      retirement: true,
      redirectToPath: true
    }
  });

  const backupDeals = await backup.deal.findMany({
    select: {
      id: true,
      slug: true,
      indexingStatus: true,
      indexing: true,
      retired: true,
      retirement: true,
      redirectToPath: true
    }
  });

  console.log(`Production deals: ${prodDeals.length}`);
  console.log(`Backup deals: ${backupDeals.length}`);
  console.log();

  const backupMap = new Map(backupDeals.map(d => [d.slug, d]));

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const p of prodDeals) {
    const b = backupMap.get(p.slug);
    if (!b) {
      notFound++;
      continue;
    }

    // Check if any field differs
    const indexingStatusMatch = b.indexingStatus === p.indexingStatus;
    const indexingMatch = b.indexing === p.indexing;
    const retiredMatch = b.retired === p.retired;
    const retirementMatch = b.retirement === p.retirement;
    const redirectMatch = b.redirectToPath === p.redirectToPath;

    if (indexingStatusMatch && indexingMatch && retiredMatch && retirementMatch && redirectMatch) {
      skipped++;
      continue;
    }

    const changes = [];
    if (!indexingStatusMatch) changes.push(`indexingStatus: ${b.indexingStatus} → ${p.indexingStatus}`);
    if (!indexingMatch) changes.push(`indexing: ${b.indexing} → ${p.indexing}`);
    if (!retiredMatch) changes.push(`retired: ${b.retired} → ${p.retired}`);
    if (!retirementMatch) changes.push(`retirement: ${b.retirement} → ${p.retirement}`);
    if (!redirectMatch) changes.push(`redirectToPath: ${b.redirectToPath} → ${p.redirectToPath}`);

    console.log(`  [UPDATE] ${p.slug}: ${changes.join(', ')}`);

    if (!DRY) {
      await backup.deal.update({
        where: { id: b.id },
        data: {
          indexingStatus: p.indexingStatus,
          indexing: p.indexing,
          retired: p.retired,
          retirement: p.retirement,
          redirectToPath: p.redirectToPath
        }
      });
    }

    updated++;
  }

  console.log();
  console.log('RESULTS:');
  console.log('-'.repeat(70));
  console.log(`Updated: ${updated}`);
  console.log(`Already matching: ${skipped}`);
  console.log(`Not found in backup: ${notFound}`);
  console.log();

  if (DRY) {
    console.log('🧪 DRY-RUN COMPLETE - No changes made');
  } else {
    console.log('✅ SYNC COMPLETE - Backup now has production status values!');
  }

  await prod.$disconnect();
  await backup.$disconnect();
}

syncOfferStatuses().catch(console.error);
