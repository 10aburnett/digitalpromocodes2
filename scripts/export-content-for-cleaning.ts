/**
 * Export Deal content fields for keyword de-stuffing
 * Outputs JSONL format (one JSON object per line) for safe multiline content handling
 *
 * Usage: npx ts-node scripts/export-content-for-cleaning.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Content fields to export for cleaning
const CONTENT_FIELDS = [
  'description',
  'aboutContent',
  'howToRedeemContent',
  'promoDetailsContent',
  'featuresContent',
  'termsContent',
  'faqContent',
] as const;

interface ExportRecord {
  slug: string;
  name: string;
  hasPromoCode: boolean;  // For no-code awareness
  description: string | null;
  aboutContent: string | null;
  howToRedeemContent: string | null;
  promoDetailsContent: string | null;
  featuresContent: string | null;
  termsContent: string | null;
  faqContent: string | null;
}

async function exportContentForCleaning() {
  console.log('📤 Exporting Deal content for keyword de-stuffing...\n');

  try {
    // Fetch all deals with content fields + promo code info
    const deals = await prisma.deal.findMany({
      select: {
        slug: true,
        name: true,
        description: true,
        aboutContent: true,
        howToRedeemContent: true,
        promoDetailsContent: true,
        featuresContent: true,
        termsContent: true,
        faqContent: true,
        PromoCode: {
          select: {
            code: true,
          },
          take: 1,
        },
      },
      orderBy: {
        slug: 'asc',
      },
    });

    console.log(`Found ${deals.length} deals to export\n`);

    // Prepare output directory
    const outputDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'content-export.jsonl');
    const writeStream = fs.createWriteStream(outputPath);

    let exportedCount = 0;
    let withContentCount = 0;

    for (const deal of deals) {
      // Check if deal has any content to clean
      const hasContent = CONTENT_FIELDS.some(field => {
        const value = deal[field];
        return value && typeof value === 'string' && value.trim().length > 0;
      });

      // Determine if this is a "no-code" offer
      const hasPromoCode = deal.PromoCode.length > 0 &&
        deal.PromoCode[0].code !== null &&
        deal.PromoCode[0].code.trim() !== '';

      const record: ExportRecord = {
        slug: deal.slug,
        name: deal.name,
        hasPromoCode,
        description: deal.description,
        aboutContent: deal.aboutContent,
        howToRedeemContent: deal.howToRedeemContent,
        promoDetailsContent: deal.promoDetailsContent,
        featuresContent: deal.featuresContent,
        termsContent: deal.termsContent,
        faqContent: deal.faqContent,
      };

      // Write as JSONL (one JSON object per line)
      writeStream.write(JSON.stringify(record) + '\n');
      exportedCount++;

      if (hasContent) {
        withContentCount++;
      }
    }

    writeStream.end();

    console.log('✅ Export complete!\n');
    console.log(`📊 Statistics:`);
    console.log(`   Total deals exported: ${exportedCount}`);
    console.log(`   Deals with content:   ${withContentCount}`);
    console.log(`   Output file:          ${outputPath}\n`);

    // Also output a summary of content field coverage
    const fieldCoverage: Record<string, number> = {};
    for (const field of CONTENT_FIELDS) {
      fieldCoverage[field] = deals.filter(d => {
        const value = d[field];
        return value && typeof value === 'string' && value.trim().length > 0;
      }).length;
    }

    console.log('📋 Content field coverage:');
    for (const [field, count] of Object.entries(fieldCoverage)) {
      const percentage = ((count / deals.length) * 100).toFixed(1);
      console.log(`   ${field}: ${count} deals (${percentage}%)`);
    }

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportContentForCleaning();
