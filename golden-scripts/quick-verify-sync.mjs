#!/usr/bin/env node
import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

async function check() {
  const searchTerms = ['tms', 'potion'];

  console.log('=== PRODUCTION DATABASE ===');
  for (const term of searchTerms) {
    const deals = await prod.deal.findMany({
      where: { slug: { contains: term, mode: 'insensitive' } },
      select: { slug: true, name: true, updatedAt: true, aboutContent: true },
      take: 5
    });
    console.log(`\n${term.toUpperCase()} deals (${deals.length}):`);
    deals.forEach(d => {
      const hasAbout = d.aboutContent ? 'YES' : 'NO';
      console.log(`  - ${d.slug}`);
      console.log(`    updated: ${d.updatedAt.toISOString()}`);
      console.log(`    hasAbout: ${hasAbout}`);
    });
  }

  console.log('\n\n=== BACKUP DATABASE ===');
  for (const term of searchTerms) {
    const deals = await backup.deal.findMany({
      where: { slug: { contains: term, mode: 'insensitive' } },
      select: { slug: true, name: true, updatedAt: true, aboutContent: true },
      take: 5
    });
    console.log(`\n${term.toUpperCase()} deals (${deals.length}):`);
    deals.forEach(d => {
      const hasAbout = d.aboutContent ? 'YES' : 'NO';
      console.log(`  - ${d.slug}`);
      console.log(`    updated: ${d.updatedAt.toISOString()}`);
      console.log(`    hasAbout: ${hasAbout}`);
    });
  }

  await prod.$disconnect();
  await backup.$disconnect();
}

check().catch(console.error);
