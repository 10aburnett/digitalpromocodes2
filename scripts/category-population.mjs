// Read-only: count offers by WhopCategory enum to pick the heaviest 2-3 for homepage strips.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

console.log('=== Category population (Whop / Deal table) ===\n');

// All offers, regardless of indexability
const all = await prisma.$queryRawUnsafe(`
  SELECT "whopCategory" AS category, COUNT(*) AS n
  FROM "Whop"
  GROUP BY "whopCategory"
  ORDER BY n DESC
`);
console.log('All offers (no indexability filter):');
for (const r of all) console.log(`  ${String(r.category).padEnd(20)} ${r.n}`);

// Indexable offers — what users actually see
const indexable = await prisma.$queryRawUnsafe(`
  SELECT "whopCategory" AS category, COUNT(*) AS n
  FROM "Whop"
  WHERE "indexingStatus" = 'INDEX'
    AND ("retired" IS NULL OR "retired" = false)
    AND ("retirement" IS NULL OR "retirement" = 'NONE')
  GROUP BY "whopCategory"
  ORDER BY n DESC
`);
console.log('\nIndexable offers (what users see on the live site):');
for (const r of indexable) console.log(`  ${String(r.category).padEnd(20)} ${r.n}`);

// Sample first 3 published offer names per top-3 categories so I can sanity-check naming
const top = indexable.slice(0, 5);
console.log('\nSample 3 offer names per top-5 indexable category (by displayOrder asc):');
for (const t of top) {
  const samples = await prisma.$queryRawUnsafe(`
    SELECT name, "displayOrder", rating
    FROM "Whop"
    WHERE "whopCategory" = $1::"WhopCategory"
      AND "indexingStatus" = 'INDEX'
      AND ("retired" IS NULL OR "retired" = false)
    ORDER BY "displayOrder" ASC, rating DESC
    LIMIT 3
  `, t.category);
  console.log(`  ${t.category} (${t.n} indexable):`);
  for (const s of samples) console.log(`    • ${s.name}  [order=${s.displayOrder}, rating=${s.rating}]`);
}

await prisma.$disconnect();
