#!/usr/bin/env node
import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

async function check() {
  const prodPromos = await prod.promoCode.findMany({
    include: { Deal: { select: { slug: true } } }
  });
  const backupPromos = await backup.promoCode.findMany({
    include: { Deal: { select: { slug: true } } }
  });

  const backupPromoMap = new Map(
    backupPromos.map(p => [`${p.Deal?.slug}::${p.code}`, p])
  );

  const fields = ['code', 'type', 'value', 'title', 'description'];
  let diffCount = 0;

  console.log('ALL PROMO CODE DIFFERENCES:');
  console.log('='.repeat(70));

  for (const p of prodPromos) {
    const key = `${p.Deal?.slug}::${p.code}`;
    const b = backupPromoMap.get(key);

    if (!b) {
      console.log(`${key}: MISSING from backup`);
      diffCount++;
      continue;
    }

    for (const field of fields) {
      const pVal = String(p[field] || '');
      const bVal = String(b[field] || '');
      if (pVal !== bVal) {
        console.log(`${key}`);
        console.log(`  ${field}:`);
        console.log(`    PROD:   "${pVal}"`);
        console.log(`    BACKUP: "${bVal}"`);
        diffCount++;
      }
    }
  }

  console.log();
  console.log(`Total differences: ${diffCount}`);

  await prod.$disconnect();
  await backup.$disconnect();
}

check().catch(console.error);
