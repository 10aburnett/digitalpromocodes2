// Read-only data-hygiene check: distribution of timestamp fields on Deal + PromoCode.
// All raw SQL, no writes.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function histogram(tableSql, field, nullable) {
  const total = (await prisma.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM "${tableSql}"`))[0].n;
  const nullCount = nullable
    ? (await prisma.$queryRawUnsafe(`SELECT COUNT(*) AS n FROM "${tableSql}" WHERE "${field}" IS NULL`))[0].n
    : 0n;

  const buckets = await prisma.$queryRawUnsafe(`
    WITH b AS (
      SELECT CASE
        WHEN "${field}" >= NOW() - INTERVAL '1 day' THEN '01_today'
        WHEN "${field}" >= NOW() - INTERVAL '2 days' THEN '02_yesterday'
        WHEN "${field}" >= NOW() - INTERVAL '7 days' THEN '03_this_week'
        WHEN "${field}" >= NOW() - INTERVAL '30 days' THEN '04_this_month'
        WHEN "${field}" >= NOW() - INTERVAL '90 days' THEN '05_last_90d'
        WHEN "${field}" >= NOW() - INTERVAL '365 days' THEN '06_last_365d'
        WHEN "${field}" IS NULL THEN '99_null'
        ELSE '07_older'
      END AS bucket
      FROM "${tableSql}"
    )
    SELECT bucket, COUNT(*) AS n FROM b GROUP BY bucket ORDER BY bucket
  `);

  const recent12 = await prisma.$queryRawUnsafe(`
    SELECT date_trunc('day', "${field}")::date AS day, COUNT(*) AS n
    FROM "${tableSql}"
    WHERE "${field}" IS NOT NULL
    GROUP BY day ORDER BY day DESC LIMIT 12
  `);

  const topClumps = await prisma.$queryRawUnsafe(`
    SELECT date_trunc('day', "${field}")::date AS day, COUNT(*) AS n
    FROM "${tableSql}"
    WHERE "${field}" IS NOT NULL
    GROUP BY day ORDER BY n DESC LIMIT 5
  `);

  return { total, nullCount, buckets, recent12, topClumps };
}

const targets = [
  { table: 'Whop',       field: 'updatedAt',   nullable: false, label: 'Deal.updatedAt' },
  { table: 'Whop',       field: 'createdAt',   nullable: false, label: 'Deal.createdAt' },
  { table: 'Whop',       field: 'publishedAt', nullable: true,  label: 'Deal.publishedAt' },
  { table: 'PromoCode',  field: 'updatedAt',   nullable: false, label: 'PromoCode.updatedAt' },
  { table: 'PromoCode',  field: 'createdAt',   nullable: false, label: 'PromoCode.createdAt' },
];

console.log('--- DATA HYGIENE CHECK ---');
console.log(`Run at: ${new Date().toISOString()}`);

for (const t of targets) {
  console.log(`\n=== ${t.label} ===`);
  const r = await histogram(t.table, t.field, t.nullable);
  console.log(`Total rows: ${r.total}`);
  console.log(`NULL ${t.field}: ${r.nullCount}`);
  console.log('Bucket breakdown:');
  for (const row of r.buckets) console.log(`  ${row.bucket.padEnd(20)} ${row.n}`);
  console.log('Last 12 distinct days (most recent):');
  for (const d of r.recent12) console.log(`  ${d.day.toISOString().slice(0, 10)}  ${d.n}`);
  console.log('Top-5 most-populated days (clumping signal):');
  for (const d of r.topClumps) console.log(`  ${d.day.toISOString().slice(0, 10)}  ${d.n}`);
}

await prisma.$disconnect();
