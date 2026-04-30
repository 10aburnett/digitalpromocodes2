/**
 * Upsert cleaned content back to database
 *
 * SAFETY: Only updates content fields, never touches:
 * - pricing, promo codes, categories, logos, ratings, slugs, timestamps, etc.
 *
 * Usage:
 *   npx ts-node scripts/upsert-cleaned-content.ts              # Full run
 *   npx ts-node scripts/upsert-cleaned-content.ts --dry-run    # Preview only
 *   npx ts-node scripts/upsert-cleaned-content.ts --limit=50   # First 50 only
 *   npx ts-node scripts/upsert-cleaned-content.ts --dry-run --limit=10  # Preview first 10
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// WHITELIST: Only these fields will be updated - NOTHING ELSE
const CONTENT_FIELDS = [
  'description',
  'aboutContent',
  'howToRedeemContent',
  'promoDetailsContent',
  'featuresContent',
  'termsContent',
  'faqContent',
] as const;

interface CleanedRecord {
  slug: string;
  name: string;
  hasPromoCode: boolean;
  description: string | null;
  aboutContent: string | null;
  howToRedeemContent: string | null;
  promoDetailsContent: string | null;
  featuresContent: string | null;
  termsContent: string | null;
  faqContent: string | null;
  _cleaningErrors?: string[];
}

// Parse command line args
function parseArgs(): { dryRun: boolean; limit: number | null } {
  const args = process.argv.slice(2);
  let dryRun = false;
  let limit: number | null = null;

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1], 10);
      if (isNaN(limit) || limit <= 0) {
        console.error('❌ Invalid --limit value');
        process.exit(1);
      }
    }
  }

  return { dryRun, limit };
}

async function upsertCleanedContent() {
  const { dryRun, limit } = parseArgs();

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No database changes will be made\n');
  }
  if (limit) {
    console.log(`📊 LIMIT MODE - Processing only first ${limit} records\n`);
  }

  console.log('📥 Upserting cleaned content to database...');
  console.log('⚠️  WHITELIST: Only updating these fields:');
  console.log(`   ${CONTENT_FIELDS.join(', ')}\n`);

  const inputPath = path.join(process.cwd(), 'data', 'content-cleaned.jsonl');

  // Check input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    console.error('   Run clean-keyword-stuffing.ts first.');
    process.exit(1);
  }

  // Read cleaned records
  let lines = fs.readFileSync(inputPath, 'utf-8').split('\n').filter(line => line.trim());
  console.log(`📂 Read ${lines.length} cleaned records from file`);

  // Apply limit if specified
  if (limit && limit < lines.length) {
    lines = lines.slice(0, limit);
    console.log(`📊 Limited to first ${limit} records\n`);
  } else {
    console.log('');
  }

  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  let errors = 0;
  let duplicateWarnings = 0;

  // Track what would be updated (for dry run)
  const wouldUpdate: string[] = [];

  // Process in batches
  const batchSize = 50;
  for (let i = 0; i < lines.length; i += batchSize) {
    const batch = lines.slice(i, i + batchSize);

    for (const line of batch) {
      try {
        const record: CleanedRecord = JSON.parse(line);

        // Skip records with cleaning errors
        if (record._cleaningErrors && record._cleaningErrors.length > 0) {
          console.log(`⚠️  Skipping ${record.slug} (had cleaning errors: ${record._cleaningErrors.join(', ')})`);
          skipped++;
          continue;
        }

        // Build update data (ONLY content fields - strict whitelist)
        const updateData: Record<string, string | null> = {};
        for (const field of CONTENT_FIELDS) {
          if (record[field] !== undefined) {
            updateData[field] = record[field];
          }
        }

        // Safety check: verify we're not accidentally including other fields
        const updateKeys = Object.keys(updateData);
        const invalidKeys = updateKeys.filter(k => !CONTENT_FIELDS.includes(k as any));
        if (invalidKeys.length > 0) {
          console.error(`❌ SAFETY VIOLATION: Attempted to update non-whitelisted fields: ${invalidKeys.join(', ')}`);
          errors++;
          continue;
        }

        if (dryRun) {
          // Dry run: check if record exists and log what would happen
          const existing = await prisma.deal.findMany({
            where: { slug: record.slug },
            select: { slug: true, name: true },
          });

          if (existing.length === 0) {
            console.log(`⚠️  Would skip (not found): ${record.slug}`);
            notFound++;
          } else if (existing.length > 1) {
            console.log(`🚨 DUPLICATE SLUG WARNING: ${record.slug} matches ${existing.length} records!`);
            duplicateWarnings++;
          } else {
            wouldUpdate.push(record.slug);
            updated++;
          }
        } else {
          // Real run: update by slug
          const result = await prisma.deal.updateMany({
            where: { slug: record.slug },
            data: updateData,
          });

          if (result.count === 0) {
            console.log(`⚠️  Not found: ${record.slug}`);
            notFound++;
          } else if (result.count > 1) {
            // This should never happen if slug is unique, but flag it
            console.log(`🚨 DUPLICATE SLUG WARNING: ${record.slug} updated ${result.count} records!`);
            duplicateWarnings++;
            updated += result.count;
          } else {
            updated++;
          }
        }
      } catch (e: any) {
        console.error(`❌ Error processing record: ${e.message}`);
        errors++;
      }
    }

    // Progress update
    const progress = Math.min(i + batchSize, lines.length);
    if (!dryRun) {
      console.log(`📊 Progress: ${progress}/${lines.length} (${updated} updated, ${skipped} skipped, ${notFound} not found)`);
    }
  }

  console.log('\n' + (dryRun ? '🔍 DRY RUN COMPLETE' : '✅ Upsert complete!') + '\n');
  console.log('📊 Summary:');
  console.log(`   Records ${dryRun ? 'would be ' : ''}updated:  ${updated}`);
  console.log(`   Records skipped:   ${skipped}`);
  console.log(`   Records not found: ${notFound}`);
  console.log(`   Errors:            ${errors}`);

  if (duplicateWarnings > 0) {
    console.log(`   ⚠️  Duplicate slug warnings: ${duplicateWarnings}`);
  }

  if (dryRun && wouldUpdate.length > 0 && wouldUpdate.length <= 20) {
    console.log('\n📝 Would update these slugs:');
    for (const slug of wouldUpdate) {
      console.log(`   - ${slug}`);
    }
  } else if (dryRun && wouldUpdate.length > 20) {
    console.log(`\n📝 Would update ${wouldUpdate.length} slugs (first 20):`);
    for (const slug of wouldUpdate.slice(0, 20)) {
      console.log(`   - ${slug}`);
    }
    console.log(`   ... and ${wouldUpdate.length - 20} more`);
  }

  if (dryRun) {
    console.log('\n💡 To apply changes, run without --dry-run flag');
  }

  await prisma.$disconnect();
}

upsertCleanedContent().catch(console.error);
