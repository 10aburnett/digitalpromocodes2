#!/usr/bin/env node
/**
 * PRODUCTION WINS - Copy all content from Production to Backup
 * Makes backup an exact mirror of production for all content fields.
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
  console.log('PRODUCTION WINS - Content Sync to Backup');
  console.log(`Mode: ${DRY ? '🧪 DRY-RUN' : '✅ LIVE'}`);
  console.log('='.repeat(70));
  console.log();

  const prodDeals = await prod.deal.findMany({
    select: {
      slug: true,
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

    // Check if any content differs
    let needsUpdate = false;
    for (const field of CONTENT_FIELDS) {
      if ((p[field] || '') !== (b[field] || '')) {
        needsUpdate = true;
        break;
      }
    }

    if (!needsUpdate) {
      skipped++;
      continue;
    }

    if (!DRY) {
      await backup.deal.update({
        where: { id: b.id },
        data: {
          name: p.name,
          description: p.description,
          aboutContent: p.aboutContent,
          promoDetailsContent: p.promoDetailsContent,
          faqContent: p.faqContent,
          howToRedeemContent: p.howToRedeemContent,
          featuresContent: p.featuresContent,
          termsContent: p.termsContent,
        },
      });
    }
    updated++;

    if (updated % 100 === 0) {
      console.log(`   Updated ${updated} deals...`);
    }
  }

  console.log();
  console.log('RESULTS:');
  console.log('-'.repeat(70));
  console.log(`Updated: ${updated}`);
  console.log(`Already identical: ${skipped}`);
  console.log(`Not found in backup: ${notFound}`);
  console.log();

  if (DRY) {
    console.log('🧪 DRY-RUN COMPLETE - No changes made');
  } else {
    console.log('✅ SYNC COMPLETE - Backup now mirrors production content!');
  }

  await prod.$disconnect();
  await backup.$disconnect();
}

sync().catch(console.error);
