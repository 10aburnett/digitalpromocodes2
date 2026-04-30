import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const totals = await prisma.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM "OfferTracking"`);
console.log(`OfferTracking total rows: ${totals[0].n}`);

const byAction = await prisma.$queryRawUnsafe(`
  SELECT "actionType", COUNT(*) AS n FROM "OfferTracking" GROUP BY "actionType" ORDER BY n DESC
`);
console.log('\nBy actionType:'); for (const r of byAction) console.log(`  ${r.actionType.padEnd(20)} ${r.n}`);

const byBucket = await prisma.$queryRawUnsafe(`
  WITH b AS (
    SELECT CASE
      WHEN "createdAt" >= NOW() - INTERVAL '1 day' THEN '01_last_24h'
      WHEN "createdAt" >= NOW() - INTERVAL '7 days' THEN '02_last_7d'
      WHEN "createdAt" >= NOW() - INTERVAL '30 days' THEN '03_last_30d'
      WHEN "createdAt" >= NOW() - INTERVAL '365 days' THEN '04_last_365d'
      ELSE '05_older' END AS b
    FROM "OfferTracking"
  )
  SELECT b, COUNT(*) AS n FROM b GROUP BY b ORDER BY b
`);
console.log('\nBy time bucket:'); for (const r of byBucket) console.log(`  ${r.b.padEnd(16)} ${r.n}`);

const distinct = await prisma.$queryRawUnsafe(`
  SELECT COUNT(DISTINCT "whopId") AS distinct_offers
  FROM "OfferTracking" WHERE "createdAt" >= NOW() - INTERVAL '7 days'
`);
console.log(`\nDistinct offers tracked in last 7 days: ${distinct[0].distinct_offers}`);

const top10last7d = await prisma.$queryRawUnsafe(`
  SELECT "whopId", COUNT(*) AS n
  FROM "OfferTracking"
  WHERE "createdAt" >= NOW() - INTERVAL '7 days' AND "whopId" IS NOT NULL
  GROUP BY "whopId" ORDER BY n DESC LIMIT 10
`);
console.log('\nTop 10 most-tracked offers (last 7d):');
for (const r of top10last7d) console.log(`  whopId=${r.whopId.slice(0,8)}…  events=${r.n}`);

await prisma.$disconnect();
