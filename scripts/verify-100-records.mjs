#!/usr/bin/env node
import { config } from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

config({ path: path.resolve(process.cwd(), '.env.sync') });

const rewrittenData = JSON.parse(readFileSync('./top-100-rewritten-content.json', 'utf8'));

const prod = new PrismaClient({ datasources: { db: { url: process.env.PRODUCTION_DATABASE_URL }}});
const backup = new PrismaClient({ datasources: { db: { url: process.env.BACKUP_DATABASE_URL }}});

const slugs = rewrittenData.map(r => r.slug);

async function verifyAll() {
  console.log('FULL VERIFICATION OF ALL 100 RECORDS');
  console.log('='.repeat(80));
  console.log('Expected values: indexingStatus=INDEX, indexing=INDEX, retired=false, retirement=null');
  console.log('');

  // Get all records from production
  const prodRecords = await prod.deal.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, indexingStatus: true, indexing: true, retired: true, retirement: true }
  });

  // Get all records from backup
  const backupRecords = await backup.deal.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, indexingStatus: true, indexing: true, retired: true, retirement: true }
  });

  const prodMap = new Map(prodRecords.map(r => [r.slug, r]));
  const backupMap = new Map(backupRecords.map(r => [r.slug, r]));

  let prodCorrect = 0;
  const prodIssues = [];
  let backupCorrect = 0;
  const backupIssues = [];

  // Check production
  for (const slug of slugs) {
    const r = prodMap.get(slug);
    if (!r) {
      prodIssues.push({ slug, issue: 'NOT FOUND' });
    } else if (r.indexingStatus !== 'INDEX' || r.indexing !== 'INDEX' || r.retired !== false || r.retirement !== null) {
      prodIssues.push({
        slug,
        indexingStatus: r.indexingStatus,
        indexing: r.indexing,
        retired: r.retired,
        retirement: r.retirement
      });
    } else {
      prodCorrect++;
    }
  }

  // Check backup
  for (const slug of slugs) {
    const r = backupMap.get(slug);
    if (!r) {
      backupIssues.push({ slug, issue: 'NOT FOUND' });
    } else if (r.indexingStatus !== 'INDEX' || r.indexing !== 'INDEX' || r.retired !== false || r.retirement !== null) {
      backupIssues.push({
        slug,
        indexingStatus: r.indexingStatus,
        indexing: r.indexing,
        retired: r.retired,
        retirement: r.retirement
      });
    } else {
      backupCorrect++;
    }
  }

  // Report production
  console.log('PRODUCTION DATABASE:');
  console.log('-'.repeat(80));
  console.log(`  Records found: ${prodRecords.length}`);
  console.log(`  Correct: ${prodCorrect}/100`);
  if (prodIssues.length > 0) {
    console.log(`  Issues (${prodIssues.length}):`);
    prodIssues.forEach(i => {
      if (i.issue === 'NOT FOUND') {
        console.log(`    - ${i.slug}: NOT FOUND`);
      } else {
        console.log(`    - ${i.slug}:`);
        console.log(`        indexingStatus=${i.indexingStatus}, indexing=${i.indexing}, retired=${i.retired}, retirement=${i.retirement}`);
      }
    });
  }

  console.log('');

  // Report backup
  console.log('BACKUP DATABASE:');
  console.log('-'.repeat(80));
  console.log(`  Records found: ${backupRecords.length}`);
  console.log(`  Correct: ${backupCorrect}/100`);
  if (backupIssues.length > 0) {
    console.log(`  Issues (${backupIssues.length}):`);
    backupIssues.forEach(i => {
      if (i.issue === 'NOT FOUND') {
        console.log(`    - ${i.slug}: NOT FOUND`);
      } else {
        console.log(`    - ${i.slug}:`);
        console.log(`        indexingStatus=${i.indexingStatus}, indexing=${i.indexing}, retired=${i.retired}, retirement=${i.retirement}`);
      }
    });
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('FINAL RESULT:');
  console.log('='.repeat(80));
  console.log(`  Production: ${prodCorrect}/100 records correct`);
  console.log(`  Backup:     ${backupCorrect}/100 records correct`);
  console.log('');

  if (prodCorrect === 100 && backupCorrect === 100) {
    console.log('✅ ALL 100 RECORDS VERIFIED CORRECT IN BOTH DATABASES');
  } else {
    console.log('❌ ISSUES FOUND - SEE DETAILS ABOVE');
  }

  await prod.$disconnect();
  await backup.$disconnect();
}

verifyAll().catch(console.error);
