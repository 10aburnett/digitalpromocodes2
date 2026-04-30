#!/usr/bin/env node
/**
 * PRODUCTION WINS - Sync PromoCode content from Production to Backup
 * Only updates backup, never touches production.
 */

import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const DRY = process.argv.includes("--dry") || process.argv.includes("-n");

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

async function sync() {
  console.log('='.repeat(70));
  console.log('PRODUCTION WINS - PromoCode Sync to Backup');
  console.log(`Mode: ${DRY ? '🧪 DRY-RUN' : '✅ LIVE'}`);
  console.log('='.repeat(70));
  console.log();

  // Get all promos with their deal slugs
  const prodPromos = await prod.promoCode.findMany({
    include: { Deal: { select: { slug: true } } }
  });
  const backupPromos = await backup.promoCode.findMany({
    include: { Deal: { select: { slug: true } } }
  });

  console.log(`Production promos: ${prodPromos.length}`);
  console.log(`Backup promos: ${backupPromos.length}`);
  console.log();

  // Map backup promos by (slug, code)
  const backupMap = new Map(
    backupPromos.map(p => [`${p.Deal?.slug}::${p.code}`, p])
  );

  const fields = ['code', 'type', 'value', 'title', 'description'];
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const p of prodPromos) {
    const key = `${p.Deal?.slug}::${p.code}`;
    const b = backupMap.get(key);

    if (!b) {
      notFound++;
      continue;
    }

    // Check if any field differs
    let needsUpdate = false;
    for (const field of fields) {
      if (String(p[field] || '') !== String(b[field] || '')) {
        needsUpdate = true;
        break;
      }
    }

    if (!needsUpdate) {
      skipped++;
      continue;
    }

    if (!DRY) {
      await backup.promoCode.update({
        where: { id: b.id },
        data: {
          type: p.type,
          value: p.value,
          title: p.title,
          description: p.description,
        },
      });
    }
    updated++;
  }

  console.log('RESULTS:');
  console.log('-'.repeat(70));
  console.log(`Updated: ${updated}`);
  console.log(`Already identical: ${skipped}`);
  console.log(`Not found in backup: ${notFound}`);
  console.log();

  if (DRY) {
    console.log('🧪 DRY-RUN COMPLETE - No changes made');
  } else {
    console.log('✅ SYNC COMPLETE - Backup promos now mirror production!');
  }

  await prod.$disconnect();
  await backup.$disconnect();
}

sync().catch(console.error);
