import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

console.log('=== Top Picks ranking signals ===\n');

const dispDist = await prisma.$queryRawUnsafe(`
  SELECT
    CASE WHEN "displayOrder" = 0 THEN '0 (default)' ELSE '!= 0 (admin-set)' END AS d,
    COUNT(*) AS n
  FROM "Whop"
  WHERE "indexingStatus" = 'INDEX' AND ("retired" IS NULL OR "retired" = false)
  GROUP BY d
`);
console.log('displayOrder distribution (indexable only):');
for (const r of dispDist) console.log(`  ${r.d.padEnd(20)} ${r.n}`);

const dispNonzero = await prisma.$queryRawUnsafe(`
  SELECT name, "displayOrder", "whopCategory" FROM "Whop"
  WHERE "displayOrder" != 0 AND "indexingStatus" = 'INDEX'
  ORDER BY "displayOrder" DESC LIMIT 10
`);
console.log('\nTop 10 by non-zero displayOrder:');
for (const r of dispNonzero) console.log(`  order=${String(r.displayOrder).padStart(4)}  ${r.whopCategory.padEnd(15)} ${r.name}`);

const ratingDist = await prisma.$queryRawUnsafe(`
  SELECT
    CASE
      WHEN rating = 0 THEN '0 (no rating)'
      WHEN rating < 2 THEN '< 2'
      WHEN rating < 3 THEN '2-3'
      WHEN rating < 4 THEN '3-4'
      ELSE '4+' END AS bucket,
    COUNT(*) AS n
  FROM "Whop"
  WHERE "indexingStatus" = 'INDEX' AND ("retired" IS NULL OR "retired" = false)
  GROUP BY bucket ORDER BY bucket
`);
console.log('\nrating distribution (indexable only):');
for (const r of ratingDist) console.log(`  ${r.bucket.padEnd(15)} ${r.n}`);

const topRated = await prisma.$queryRawUnsafe(`
  SELECT name, rating, "whopCategory" FROM "Whop"
  WHERE rating > 0 AND "indexingStatus" = 'INDEX'
  ORDER BY rating DESC LIMIT 10
`);
console.log('\nTop 10 by non-zero rating:');
for (const r of topRated) console.log(`  rating=${r.rating.toFixed(2)}  ${r.whopCategory.padEnd(15)} ${r.name}`);

await prisma.$disconnect();
