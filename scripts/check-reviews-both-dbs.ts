import { PrismaClient } from '@prisma/client';
import { LAUNCH_COHORT_SLUGS } from '../src/lib/launch-cohort';
import dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

const BACKUP_URL = process.env.BACKUP_DATABASE_URL!;
const PROD_URL = process.env.PROD_DATABASE_URL!;

const launchCohortSlugs = Array.from(LAUNCH_COHORT_SLUGS);

async function main() {
  const backupPrisma = new PrismaClient({ datasources: { db: { url: BACKUP_URL } } });
  const prodPrisma = new PrismaClient({ datasources: { db: { url: PROD_URL } } });

  console.log('Checking', launchCohortSlugs.length, 'cohort products...\n');

  const missingBoth: string[] = [];
  const missingBackup: string[] = [];
  const missingProd: string[] = [];
  const notFoundBackup: string[] = [];
  const notFoundProd: string[] = [];

  for (const slug of launchCohortSlugs) {
    const backup = await backupPrisma.deal.findFirst({
      where: { slug },
      select: { slug: true, featuresContent: true }
    });

    const prod = await prodPrisma.deal.findFirst({
      where: { slug },
      select: { slug: true, featuresContent: true }
    });

    const hasBackup = backup && backup.featuresContent && backup.featuresContent.length > 0;
    const hasProd = prod && prod.featuresContent && prod.featuresContent.length > 0;

    if (!backup) notFoundBackup.push(slug);
    if (!prod) notFoundProd.push(slug);

    if (!hasBackup && !hasProd) {
      missingBoth.push(slug);
    } else if (!hasBackup && hasProd) {
      missingBackup.push(slug);
    } else if (hasBackup && !hasProd) {
      missingProd.push(slug);
    }
  }

  console.log('=== SUMMARY ===');
  console.log('Missing reviews in BOTH databases:', missingBoth.length);
  console.log('Missing in BACKUP only:', missingBackup.length);
  console.log('Missing in PROD only:', missingProd.length);
  console.log('Not found in BACKUP:', notFoundBackup.length);
  console.log('Not found in PROD:', notFoundProd.length);

  if (missingBoth.length > 0) {
    console.log('\n=== MISSING IN BOTH ===');
    missingBoth.forEach(s => console.log('-', s));
  }

  if (missingBackup.length > 0) {
    console.log('\n=== MISSING IN BACKUP ONLY ===');
    missingBackup.forEach(s => console.log('-', s));
  }

  if (missingProd.length > 0) {
    console.log('\n=== MISSING IN PROD ONLY ===');
    missingProd.forEach(s => console.log('-', s));
  }

  if (notFoundBackup.length > 0) {
    console.log('\n=== NOT FOUND IN BACKUP ===');
    notFoundBackup.forEach(s => console.log('-', s));
  }

  if (notFoundProd.length > 0) {
    console.log('\n=== NOT FOUND IN PROD ===');
    notFoundProd.forEach(s => console.log('-', s));
  }

  await backupPrisma.$disconnect();
  await prodPrisma.$disconnect();
}

main().catch(console.error);
