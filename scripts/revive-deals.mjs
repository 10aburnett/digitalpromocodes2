/**
 * Revive Deals Script
 *
 * Unretires deals from a JSON file by setting:
 * - retired = false
 * - retirement = 'NONE'
 * - indexingStatus = 'NOINDEX' (do NOT index yet)
 *
 * Usage:
 *   node scripts/revive-deals.mjs --in data/revive-safe.json --limit 50 --dry-run
 *   node scripts/revive-deals.mjs --in data/revive-safe.json --limit 50
 *   node scripts/revive-deals.mjs --in data/revive-safe.json  (all)
 *
 * Options:
 *   --in <file>     Input JSON file with { slugs: [...] }
 *   --limit <n>     Limit number of deals to revive (default: all)
 *   --dry-run       Preview changes without writing to DB
 *   --index-status  Set indexingStatus to this value (default: NOINDEX)
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFile: null,
    limit: null,
    dryRun: false,
    indexStatus: 'NOINDEX',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--in' && args[i + 1]) {
      options.inputFile = args[i + 1];
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (args[i] === '--index-status' && args[i + 1]) {
      options.indexStatus = args[i + 1];
      i++;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  if (!options.inputFile) {
    console.error('❌ Error: --in <file> is required');
    console.log('\nUsage:');
    console.log('  node scripts/revive-deals.mjs --in data/revive-safe.json --limit 50 --dry-run');
    console.log('  node scripts/revive-deals.mjs --in data/revive-safe.json --limit 50');
    process.exit(1);
  }

  // Resolve input file path
  const inputPath = options.inputFile.startsWith('/')
    ? options.inputFile
    : join(process.cwd(), options.inputFile);

  if (!existsSync(inputPath)) {
    console.error(`❌ Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`📂 Reading from: ${inputPath}`);
  const inputData = JSON.parse(readFileSync(inputPath, 'utf8'));

  if (!inputData.slugs || !Array.isArray(inputData.slugs)) {
    console.error('❌ Error: Input file must have { slugs: [...] }');
    process.exit(1);
  }

  let slugs = inputData.slugs;
  const totalAvailable = slugs.length;

  if (options.limit && options.limit > 0) {
    slugs = slugs.slice(0, options.limit);
  }

  console.log(`\n🔄 Reviving ${slugs.length} deals (of ${totalAvailable} available)`);
  console.log(`   Mode: ${options.dryRun ? '🔍 DRY RUN (no changes)' : '⚡ LIVE (writing to DB)'}`);
  console.log(`   Setting: retired=false, retirement='NONE', indexingStatus='${options.indexStatus}'`);

  if (options.dryRun) {
    console.log('\n📋 Deals that would be revived:');
    slugs.forEach((slug, i) => {
      console.log(`   ${i + 1}. ${slug}`);
    });

    // Verify slugs exist and show current state
    console.log('\n🔍 Verifying current state of deals...');
    const deals = await prisma.deal.findMany({
      where: { slug: { in: slugs } },
      select: {
        slug: true,
        retired: true,
        retirement: true,
        indexingStatus: true,
      }
    });

    const foundSlugs = new Set(deals.map(d => d.slug));
    const missingSlugs = slugs.filter(s => !foundSlugs.has(s));

    if (missingSlugs.length > 0) {
      console.log(`\n⚠️ ${missingSlugs.length} slugs not found in DB:`);
      missingSlugs.forEach(s => console.log(`   - ${s}`));
    }

    console.log(`\n✅ Found ${deals.length} deals in DB`);
    console.log('   Current state sample:');
    deals.slice(0, 5).forEach(d => {
      console.log(`   - ${d.slug}: retired=${d.retired}, retirement=${d.retirement}, indexingStatus=${d.indexingStatus}`);
    });

    console.log('\n🎯 DRY RUN complete. Run without --dry-run to apply changes.');
  } else {
    // LIVE mode - actually update the database
    console.log('\n⚡ Updating database...');

    let updated = 0;
    let errors = 0;
    const errorList = [];

    for (const slug of slugs) {
      try {
        await prisma.deal.update({
          where: { slug },
          data: {
            retired: false,
            retirement: 'NONE',
            indexingStatus: options.indexStatus,
          }
        });
        updated++;
        if (updated % 50 === 0) {
          console.log(`   Progress: ${updated}/${slugs.length}`);
        }
      } catch (error) {
        errors++;
        errorList.push({ slug, error: error.message });
      }
    }

    console.log(`\n✅ Updated: ${updated} deals`);
    if (errors > 0) {
      console.log(`❌ Errors: ${errors} deals`);
      errorList.forEach(e => console.log(`   - ${e.slug}: ${e.error}`));
    }

    // Write log file
    const logPath = join(__dirname, '..', 'data', `revive-log-${Date.now()}.json`);
    writeFileSync(logPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      inputFile: options.inputFile,
      limit: options.limit,
      indexStatus: options.indexStatus,
      updated,
      errors,
      slugsProcessed: slugs,
      errorList: errorList.length > 0 ? errorList : undefined,
    }, null, 2));
    console.log(`\n📝 Log saved to: ${logPath}`);

    console.log('\n🎉 Revival complete!');
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
