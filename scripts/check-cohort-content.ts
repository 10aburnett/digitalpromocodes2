import { prisma } from '../src/lib/prisma';
import * as fs from 'fs';

interface Deal {
  slug: string;
  name: string;
  aboutContent: string | null;
  description: string | null;
  retirement: string | null;
}

async function checkAllContent() {
  const cohort = JSON.parse(fs.readFileSync('./data/curated-cohort-76.json', 'utf8'));

  const deals: Deal[] = await prisma.deal.findMany({
    where: { slug: { in: cohort.slugs } },
    select: {
      slug: true,
      name: true,
      aboutContent: true,
      description: true,
      retirement: true
    }
  });

  const found = new Set(deals.map((d: Deal) => d.slug));
  const missing = cohort.slugs.filter((s: string) => !found.has(s));
  const noContent = deals.filter((d: Deal) => !d.aboutContent || !d.description);

  console.log('Total in cohort:', cohort.slugs.length);
  console.log('Found in DB:', deals.length);
  console.log('');

  if (missing.length > 0) {
    console.log('=== MISSING FROM DB ===');
    missing.forEach((s: string) => console.log('  ' + s));
  } else {
    console.log('All slugs exist in DB');
  }

  console.log('');
  if (noContent.length > 0) {
    console.log('=== MISSING CONTENT ===');
    noContent.forEach((d: Deal) => console.log(`  ${d.slug} - about:${!!d.aboutContent} desc:${!!d.description}`));
  } else {
    console.log('All deals have content');
  }
}

checkAllContent().finally(() => prisma.$disconnect());
