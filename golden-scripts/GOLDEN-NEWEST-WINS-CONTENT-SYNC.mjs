#!/usr/bin/env node
/**
 * GOLDEN NEWEST-WINS CONTENT SYNC
 * ================================
 * Compares updatedAt timestamps - the most recently edited version wins.
 * Safe bi-directional sync with no data loss.
 *
 * Usage:
 *   node golden-scripts/GOLDEN-NEWEST-WINS-CONTENT-SYNC.mjs --dry
 *   node golden-scripts/GOLDEN-NEWEST-WINS-CONTENT-SYNC.mjs
 */

import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const DRY = process.argv.includes("--dry") || process.argv.includes("-n");

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

const CONTENT_FIELDS = [
  'aboutContent',
  'promoDetailsContent',
  'faqContent',
  'howToRedeemContent',
  'featuresContent',
  'termsContent',
  'description',
  'name',
];

async function sync() {
  console.log('='.repeat(70));
  console.log('GOLDEN NEWEST-WINS CONTENT SYNC');
  console.log(`Mode: ${DRY ? '🧪 DRY-RUN' : '✅ LIVE'}`);
  console.log('='.repeat(70));
  console.log();

  // Fetch all deals from both databases
  console.log('📊 Fetching deals from both databases...');

  const prodDeals = await prod.deal.findMany({
    select: {
      id: true,
      slug: true,
      updatedAt: true,
      name: true,
      description: true,
      aboutContent: true,
      promoDetailsContent: true,
      faqContent: true,
      howToRedeemContent: true,
      featuresContent: true,
      termsContent: true,
    }
  });

  const backupDeals = await backup.deal.findMany({
    select: {
      id: true,
      slug: true,
      updatedAt: true,
      name: true,
      description: true,
      aboutContent: true,
      promoDetailsContent: true,
      faqContent: true,
      howToRedeemContent: true,
      featuresContent: true,
      termsContent: true,
    }
  });

  console.log(`   Production: ${prodDeals.length} deals`);
  console.log(`   Backup: ${backupDeals.length} deals`);
  console.log();

  const prodMap = new Map(prodDeals.map(d => [d.slug, d]));
  const backupMap = new Map(backupDeals.map(d => [d.slug, d]));

  let prodToBackup = 0;
  let backupToProd = 0;
  let alreadySynced = 0;
  let onlyInProd = 0;
  let onlyInBackup = 0;

  const updatesToProd = [];
  const updatesToBackup = [];

  // Compare each deal
  for (const [slug, pDeal] of prodMap) {
    const bDeal = backupMap.get(slug);

    if (!bDeal) {
      onlyInProd++;
      continue;
    }

    const pTime = pDeal.updatedAt.getTime();
    const bTime = bDeal.updatedAt.getTime();

    // Check if content actually differs
    let contentDiffers = false;
    for (const field of CONTENT_FIELDS) {
      if ((pDeal[field] || '') !== (bDeal[field] || '')) {
        contentDiffers = true;
        break;
      }
    }

    if (!contentDiffers) {
      alreadySynced++;
      continue;
    }

    // Content differs - which is newer?
    if (pTime > bTime) {
      // Production is newer -> update backup
      prodToBackup++;
      updatesToBackup.push({
        slug,
        backupId: bDeal.id,
        data: {
          name: pDeal.name,
          description: pDeal.description,
          aboutContent: pDeal.aboutContent,
          promoDetailsContent: pDeal.promoDetailsContent,
          faqContent: pDeal.faqContent,
          howToRedeemContent: pDeal.howToRedeemContent,
          featuresContent: pDeal.featuresContent,
          termsContent: pDeal.termsContent,
          updatedAt: pDeal.updatedAt,
        },
        prodTime: pDeal.updatedAt,
        backupTime: bDeal.updatedAt,
      });
    } else if (bTime > pTime) {
      // Backup is newer -> update production
      backupToProd++;
      updatesToProd.push({
        slug,
        prodId: pDeal.id,
        data: {
          name: bDeal.name,
          description: bDeal.description,
          aboutContent: bDeal.aboutContent,
          promoDetailsContent: bDeal.promoDetailsContent,
          faqContent: bDeal.faqContent,
          howToRedeemContent: bDeal.howToRedeemContent,
          featuresContent: bDeal.featuresContent,
          termsContent: bDeal.termsContent,
          updatedAt: bDeal.updatedAt,
        },
        prodTime: pDeal.updatedAt,
        backupTime: bDeal.updatedAt,
      });
    } else {
      // Same timestamp but different content (edge case)
      alreadySynced++;
    }
  }

  // Check for deals only in backup
  for (const [slug] of backupMap) {
    if (!prodMap.has(slug)) {
      onlyInBackup++;
    }
  }

  console.log('📋 SYNC PLAN:');
  console.log('-'.repeat(70));
  console.log(`   Already in sync: ${alreadySynced}`);
  console.log(`   Production → Backup (prod newer): ${prodToBackup}`);
  console.log(`   Backup → Production (backup newer): ${backupToProd}`);
  console.log(`   Only in production: ${onlyInProd}`);
  console.log(`   Only in backup: ${onlyInBackup}`);
  console.log();

  if (prodToBackup === 0 && backupToProd === 0) {
    console.log('✅ All content is already in sync!');
    await prod.$disconnect();
    await backup.$disconnect();
    return;
  }

  // Show samples
  if (updatesToBackup.length > 0) {
    console.log('Sample updates PROD → BACKUP (first 5):');
    for (const u of updatesToBackup.slice(0, 5)) {
      console.log(`   ${u.slug}: prod=${u.prodTime.toISOString()} > backup=${u.backupTime.toISOString()}`);
    }
    console.log();
  }

  if (updatesToProd.length > 0) {
    console.log('Sample updates BACKUP → PROD (first 5):');
    for (const u of updatesToProd.slice(0, 5)) {
      console.log(`   ${u.slug}: backup=${u.backupTime.toISOString()} > prod=${u.prodTime.toISOString()}`);
    }
    console.log();
  }

  if (DRY) {
    console.log('🧪 DRY-RUN COMPLETE - No changes made');
    await prod.$disconnect();
    await backup.$disconnect();
    return;
  }

  // Execute updates
  console.log('✍️  Applying updates...');

  // Update backup with newer prod content
  for (const u of updatesToBackup) {
    await backup.deal.update({
      where: { id: u.backupId },
      data: u.data,
    });
  }
  console.log(`   ✅ Updated ${updatesToBackup.length} deals in backup`);

  // Update prod with newer backup content
  for (const u of updatesToProd) {
    await prod.deal.update({
      where: { id: u.prodId },
      data: u.data,
    });
  }
  console.log(`   ✅ Updated ${updatesToProd.length} deals in production`);

  console.log();
  console.log('🎉 SYNC COMPLETE - Newest versions now in both databases!');

  await prod.$disconnect();
  await backup.$disconnect();
}

sync().catch(console.error);
