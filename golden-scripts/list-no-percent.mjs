#!/usr/bin/env node
import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: path.resolve(process.cwd(), ".env.sync") });

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});

async function check() {
  const promos = await prod.promoCode.findMany({
    include: { Deal: { select: { slug: true, name: true } } }
  });

  const withoutPercent = promos.filter(p => p.value && !p.value.includes('%'));

  console.log(`PROMOS WITHOUT % IN PRODUCTION (${withoutPercent.length}):`);
  console.log('='.repeat(70));
  withoutPercent.forEach((p, i) => {
    console.log(`${i+1}. ${p.Deal?.slug}`);
    console.log(`   code: ${p.code}  |  value: "${p.value}"  |  title: "${p.title}"`);
  });

  await prod.$disconnect();
}

check().catch(console.error);
