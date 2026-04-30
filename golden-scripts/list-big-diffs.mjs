#!/usr/bin/env node
import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

const CONTENT_FIELDS = ['aboutContent', 'promoDetailsContent', 'faqContent', 'howToRedeemContent', 'featuresContent', 'termsContent'];

function isJustAmpersandDiff(prodVal, backupVal) {
  if (!prodVal && !backupVal) return true;
  if (!prodVal || !backupVal) return false;
  const prodNorm = prodVal.replace(/&amp;/g, '&');
  const backupNorm = backupVal.replace(/&amp;/g, '&');
  return prodNorm === backupNorm;
}

async function analyze() {
  const prodDeals = await prod.deal.findMany({
    select: { slug: true, name: true, aboutContent: true, promoDetailsContent: true, faqContent: true, howToRedeemContent: true, featuresContent: true, termsContent: true }
  });
  const backupDeals = await backup.deal.findMany({
    select: { slug: true, aboutContent: true, promoDetailsContent: true, faqContent: true, howToRedeemContent: true, featuresContent: true, termsContent: true }
  });

  const backupMap = new Map(backupDeals.map(d => [d.slug, d]));

  const bigDiffs = [];

  for (const p of prodDeals) {
    const b = backupMap.get(p.slug);
    if (!b) continue;

    let maxDiff = 0;

    for (const field of CONTENT_FIELDS) {
      const pVal = p[field] || '';
      const bVal = b[field] || '';
      if (pVal !== bVal && !isJustAmpersandDiff(pVal, bVal)) {
        const diff = Math.abs(pVal.length - bVal.length);
        maxDiff = Math.max(maxDiff, diff);
      }
    }

    if (maxDiff > 100) {
      bigDiffs.push({ slug: p.slug, name: p.name, maxDiff });
    }
  }

  // Sort by maxDiff descending
  bigDiffs.sort((a, b) => b.maxDiff - a.maxDiff);

  console.log(`${bigDiffs.length} DEALS WITH >100 CHAR DIFFERENCES:`);
  console.log('='.repeat(70));
  bigDiffs.forEach((d, i) => {
    console.log(`${i+1}. ${d.slug} (max diff: ${d.maxDiff} chars)`);
  });

  await prod.$disconnect();
  await backup.$disconnect();
}

analyze().catch(console.error);
