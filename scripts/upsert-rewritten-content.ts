import { prisma } from '../src/lib/prisma';
import * as fs from 'fs';

interface RewrittenContent {
  slug: string;
  aboutContent: string;
  howToRedeemContent: string;
  promoDetailsContent: string;
  termsContent: string;
  faqContent: string;
}

async function upsertContent() {
  const content: RewrittenContent[] = JSON.parse(
    fs.readFileSync('./rewritten-content.json', 'utf8')
  );

  console.log(`Upserting ${content.length} deals...`);

  let updated = 0;
  let notFound = 0;
  const errors: string[] = [];

  for (const item of content) {
    try {
      const result = await prisma.deal.update({
        where: { slug: item.slug },
        data: {
          aboutContent: item.aboutContent,
          howToRedeemContent: item.howToRedeemContent,
          promoDetailsContent: item.promoDetailsContent,
          termsContent: item.termsContent,
          faqContent: item.faqContent,
        }
      });
      updated++;
      console.log(`  ✓ ${item.slug}`);
    } catch (e: any) {
      if (e.code === 'P2025') {
        notFound++;
        errors.push(`  ✗ ${item.slug} - NOT FOUND`);
      } else {
        errors.push(`  ✗ ${item.slug} - ${e.message}`);
      }
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Updated: ${updated}`);
  console.log(`Not found: ${notFound}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(e));
  }
}

upsertContent().finally(() => prisma.$disconnect());
