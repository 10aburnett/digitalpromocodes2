#!/usr/bin/env node
import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

async function verify() {
  console.log('CONTENT VERIFICATION - Comparing actual text fields');
  console.log('='.repeat(70));
  console.log();

  // Get ALL deals from both databases with content fields
  const prodDeals = await prod.deal.findMany({
    select: {
      slug: true,
      name: true,
      aboutContent: true,
      promoDetailsContent: true,
      faqContent: true,
      howToRedeemContent: true,
      featuresContent: true,
      termsContent: true,
      description: true,
    }
  });

  const backupDeals = await backup.deal.findMany({
    select: {
      slug: true,
      name: true,
      aboutContent: true,
      promoDetailsContent: true,
      faqContent: true,
      howToRedeemContent: true,
      featuresContent: true,
      termsContent: true,
      description: true,
    }
  });

  const backupMap = new Map(backupDeals.map(d => [d.slug, d]));

  let matches = 0;
  let mismatches = [];

  for (const p of prodDeals) {
    const b = backupMap.get(p.slug);
    if (!b) {
      mismatches.push({ slug: p.slug, issue: 'Missing from backup' });
      continue;
    }

    const fields = ['aboutContent', 'promoDetailsContent', 'faqContent', 'howToRedeemContent', 'featuresContent', 'termsContent', 'description'];
    let allMatch = true;

    for (const field of fields) {
      const pVal = p[field] || '';
      const bVal = b[field] || '';
      if (pVal !== bVal) {
        allMatch = false;
        mismatches.push({
          slug: p.slug,
          field,
          prodLen: pVal.length,
          backupLen: bVal.length,
          prodSnippet: pVal.substring(0, 50),
          backupSnippet: bVal.substring(0, 50),
        });
      }
    }

    if (allMatch) matches++;
  }

  console.log(`Total deals checked: ${prodDeals.length}`);
  console.log(`Perfect content matches: ${matches}`);
  console.log(`Deals with differences: ${mismatches.length}`);
  console.log();

  if (mismatches.length === 0) {
    console.log('✅ ALL CONTENT FIELDS ARE IDENTICAL!');
  } else {
    console.log('❌ CONTENT DIFFERENCES FOUND:');
    console.log('-'.repeat(70));
    for (const m of mismatches.slice(0, 20)) {
      if (m.issue) {
        console.log(`${m.slug}: ${m.issue}`);
      } else {
        console.log(`${m.slug} -> ${m.field}`);
        console.log(`  PROD (${m.prodLen} chars): "${m.prodSnippet}..."`);
        console.log(`  BACKUP (${m.backupLen} chars): "${m.backupSnippet}..."`);
      }
    }
    if (mismatches.length > 20) {
      console.log(`... and ${mismatches.length - 20} more`);
    }
  }

  // Now check promo codes
  console.log();
  console.log('='.repeat(70));
  console.log('PROMO CODE CONTENT VERIFICATION');
  console.log('='.repeat(70));

  const prodPromos = await prod.promoCode.findMany({
    include: { Deal: { select: { slug: true } } }
  });
  const backupPromos = await backup.promoCode.findMany({
    include: { Deal: { select: { slug: true } } }
  });

  // Key by (slug, code)
  const backupPromoMap = new Map(
    backupPromos.map(p => [`${p.Deal?.slug}::${p.code}`, p])
  );

  let promoMatches = 0;
  let promoMismatches = [];

  for (const p of prodPromos) {
    const key = `${p.Deal?.slug}::${p.code}`;
    const b = backupPromoMap.get(key);
    if (!b) {
      promoMismatches.push({ key, issue: 'Missing from backup' });
      continue;
    }

    const fields = ['code', 'type', 'value', 'title', 'description'];
    let allMatch = true;

    for (const field of fields) {
      const pVal = String(p[field] || '');
      const bVal = String(b[field] || '');
      if (pVal !== bVal) {
        allMatch = false;
        promoMismatches.push({ key, field, prod: pVal, backup: bVal });
      }
    }

    if (allMatch) promoMatches++;
  }

  console.log(`Total promos checked: ${prodPromos.length}`);
  console.log(`Perfect matches: ${promoMatches}`);
  console.log(`Promos with differences: ${promoMismatches.length}`);
  console.log();

  if (promoMismatches.length === 0) {
    console.log('✅ ALL PROMO CODE FIELDS ARE IDENTICAL!');
  } else {
    console.log('❌ PROMO DIFFERENCES:');
    for (const m of promoMismatches.slice(0, 10)) {
      if (m.issue) {
        console.log(`${m.key}: ${m.issue}`);
      } else {
        console.log(`${m.key} -> ${m.field}: PROD="${m.prod}" vs BACKUP="${m.backup}"`);
      }
    }
  }

  await prod.$disconnect();
  await backup.$disconnect();
}

verify().catch(console.error);
