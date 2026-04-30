#!/usr/bin/env node
import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

const CONTENT_FIELDS = [
  'aboutContent',
  'promoDetailsContent',
  'faqContent',
  'howToRedeemContent',
  'featuresContent',
  'termsContent',
];

function isJustAmpersandDiff(prodVal, backupVal) {
  if (!prodVal && !backupVal) return true;
  if (!prodVal || !backupVal) return false;

  // Normalize both by replacing &amp; with &
  const prodNorm = prodVal.replace(/&amp;/g, '&');
  const backupNorm = backupVal.replace(/&amp;/g, '&');

  return prodNorm === backupNorm;
}

async function analyze() {
  console.log('THOROUGH CONTENT DIFFERENCE ANALYSIS');
  console.log('='.repeat(70));
  console.log();

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
    }
  });

  const backupMap = new Map(backupDeals.map(d => [d.slug, d]));

  const identical = [];
  const ampersandOnly = [];
  const majorDifferences = [];

  for (const p of prodDeals) {
    const b = backupMap.get(p.slug);
    if (!b) continue;

    let hasAnyDiff = false;
    let allDiffsAreAmpersand = true;
    const diffFields = [];

    for (const field of CONTENT_FIELDS) {
      const pVal = p[field] || '';
      const bVal = b[field] || '';

      if (pVal !== bVal) {
        hasAnyDiff = true;

        if (!isJustAmpersandDiff(pVal, bVal)) {
          allDiffsAreAmpersand = false;
          diffFields.push({
            field,
            prodLen: pVal.length,
            backupLen: bVal.length,
            diff: Math.abs(pVal.length - bVal.length),
            prodStart: pVal.substring(0, 60),
            backupStart: bVal.substring(0, 60),
          });
        }
      }
    }

    if (!hasAnyDiff) {
      identical.push(p.slug);
    } else if (allDiffsAreAmpersand) {
      ampersandOnly.push(p.slug);
    } else {
      majorDifferences.push({
        slug: p.slug,
        name: p.name,
        fields: diffFields,
      });
    }
  }

  console.log('SUMMARY:');
  console.log('-'.repeat(70));
  console.log(`Total deals: ${prodDeals.length}`);
  console.log(`Identical content: ${identical.length}`);
  console.log(`Ampersand-only differences (&amp; vs &): ${ampersandOnly.length}`);
  console.log(`MAJOR content differences: ${majorDifferences.length}`);
  console.log();

  if (majorDifferences.length > 0) {
    console.log('='.repeat(70));
    console.log(`MAJOR DIFFERENCES (${majorDifferences.length} deals):`);
    console.log('='.repeat(70));

    for (const d of majorDifferences) {
      console.log();
      console.log(`${d.slug} (${d.name})`);
      for (const f of d.fields) {
        console.log(`  ${f.field}: PROD ${f.prodLen} chars vs BACKUP ${f.backupLen} chars (diff: ${f.diff})`);
        if (f.diff > 50) {
          console.log(`    PROD starts: "${f.prodStart}..."`);
          console.log(`    BACKUP starts: "${f.backupStart}..."`);
        }
      }
    }
  }

  // Also list the slugs of major differences for easy reference
  if (majorDifferences.length > 0 && majorDifferences.length <= 150) {
    console.log();
    console.log('='.repeat(70));
    console.log('LIST OF SLUGS WITH MAJOR DIFFERENCES:');
    console.log('='.repeat(70));
    majorDifferences.forEach((d, i) => {
      console.log(`${i + 1}. ${d.slug}`);
    });
  }

  await prod.$disconnect();
  await backup.$disconnect();
}

analyze().catch(console.error);
