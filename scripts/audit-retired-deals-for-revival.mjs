/**
 * Audit Retired Deals for Revival
 *
 * Classifies retired/GONE deals into revival categories based on content quality.
 *
 * Outputs:
 * - data/revive-safe.json (aboutContentLen >= 300 AND 2+ other sections)
 * - data/revive-noindex.json (weaker content, 150-299 chars)
 * - data/revive-blocked.json (still thin/empty)
 *
 * Usage: node scripts/audit-retired-deals-for-revival.mjs
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// Thresholds for classification
const SAFE_ABOUT_MIN = 300;
const NOINDEX_ABOUT_MIN = 150;
const MIN_OTHER_SECTIONS = 2;

function getLen(str) {
  return str ? str.trim().length : 0;
}

function classifyDeal(deal) {
  const aboutLen = getLen(deal.aboutContent);
  const faqLen = getLen(deal.faqContent);
  const termsLen = getLen(deal.termsContent);
  const howToRedeemLen = getLen(deal.howToRedeemContent);
  const featuresLen = getLen(deal.featuresContent);
  const promoDetailsLen = getLen(deal.promoDetailsContent);

  // Count non-null sections (excluding aboutContent)
  const otherSections = [
    faqLen > 50 ? 'faq' : null,
    termsLen > 50 ? 'terms' : null,
    howToRedeemLen > 50 ? 'howToRedeem' : null,
    featuresLen > 50 ? 'features' : null,
    promoDetailsLen > 50 ? 'promoDetails' : null,
  ].filter(Boolean);

  const hasPromoCodes = deal._count.PromoCode > 0;
  const nonEmptyCodeCount = deal.PromoCode.filter(pc => pc.code && pc.code.trim().length > 0).length;

  const stats = {
    slug: deal.slug,
    name: deal.name,
    retired: deal.retired,
    retirement: deal.retirement,
    indexingStatus: deal.indexingStatus,
    aboutContentLen: aboutLen,
    faqLen,
    termsLen,
    howToRedeemLen,
    featuresLen,
    promoDetailsLen,
    otherSectionsCount: otherSections.length,
    otherSections,
    promoCodeCount: deal._count.PromoCode,
    nonEmptyCodeCount,
    hasPromoCodes: nonEmptyCodeCount > 0,
  };

  // Classification logic
  let classification;
  let reasons = [];

  if (aboutLen >= SAFE_ABOUT_MIN && otherSections.length >= MIN_OTHER_SECTIONS) {
    classification = 'reviveSafe';
    reasons.push(`aboutContent >= ${SAFE_ABOUT_MIN} chars`);
    reasons.push(`${otherSections.length} other sections with content`);
  } else if (aboutLen >= NOINDEX_ABOUT_MIN) {
    classification = 'reviveNoindex';
    if (aboutLen < SAFE_ABOUT_MIN) {
      reasons.push(`aboutContent ${aboutLen} chars (below ${SAFE_ABOUT_MIN})`);
    }
    if (otherSections.length < MIN_OTHER_SECTIONS) {
      reasons.push(`only ${otherSections.length} other sections (need ${MIN_OTHER_SECTIONS})`);
    }
  } else {
    classification = 'blocked';
    if (aboutLen < NOINDEX_ABOUT_MIN) {
      reasons.push(`aboutContent only ${aboutLen} chars (need >= ${NOINDEX_ABOUT_MIN})`);
    }
    if (aboutLen === 0) {
      reasons.push('no aboutContent');
    }
  }

  return {
    ...stats,
    classification,
    reasons,
  };
}

async function main() {
  console.log('🔍 Auditing retired deals for revival...\n');

  // Query all retired/GONE deals
  const retiredDeals = await prisma.deal.findMany({
    where: {
      OR: [
        { retired: true },
        { retirement: { not: 'NONE' } }
      ]
    },
    select: {
      slug: true,
      name: true,
      retired: true,
      retirement: true,
      indexingStatus: true,
      aboutContent: true,
      faqContent: true,
      termsContent: true,
      howToRedeemContent: true,
      featuresContent: true,
      promoDetailsContent: true,
      _count: {
        select: { PromoCode: true }
      },
      PromoCode: {
        select: { code: true }
      }
    }
  });

  console.log(`📊 Found ${retiredDeals.length} retired/GONE deals\n`);

  // Classify each deal
  const classified = retiredDeals.map(classifyDeal);

  const reviveSafe = classified.filter(d => d.classification === 'reviveSafe');
  const reviveNoindex = classified.filter(d => d.classification === 'reviveNoindex');
  const blocked = classified.filter(d => d.classification === 'blocked');

  console.log('📈 Classification results:');
  console.log(`   ✅ reviveSafe: ${reviveSafe.length} deals (good content, ready to revive)`);
  console.log(`   🔶 reviveNoindex: ${reviveNoindex.length} deals (weaker content, revive but keep NOINDEX)`);
  console.log(`   ❌ blocked: ${blocked.length} deals (still thin/empty)\n`);

  // Additional stats
  const withPromoCodes = classified.filter(d => d.hasPromoCodes);
  console.log(`📋 Additional stats:`);
  console.log(`   - With promo codes: ${withPromoCodes.length}`);
  console.log(`   - reviveSafe with promo codes: ${reviveSafe.filter(d => d.hasPromoCodes).length}`);
  console.log(`   - reviveNoindex with promo codes: ${reviveNoindex.filter(d => d.hasPromoCodes).length}\n`);

  // Ensure data directory exists
  const dataDir = join(__dirname, '..', 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  // Write output files
  const safePath = join(dataDir, 'revive-safe.json');
  const noindexPath = join(dataDir, 'revive-noindex.json');
  const blockedPath = join(dataDir, 'revive-blocked.json');

  writeFileSync(safePath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: reviveSafe.length,
    description: 'Deals with good content - safe to revive',
    criteria: {
      aboutContentMin: SAFE_ABOUT_MIN,
      minOtherSections: MIN_OTHER_SECTIONS
    },
    slugs: reviveSafe.map(d => d.slug),
    deals: reviveSafe
  }, null, 2));
  console.log(`✅ Saved ${reviveSafe.length} deals to ${safePath}`);

  writeFileSync(noindexPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: reviveNoindex.length,
    description: 'Deals with weaker content - revive but keep NOINDEX',
    criteria: {
      aboutContentMin: NOINDEX_ABOUT_MIN,
      aboutContentMax: SAFE_ABOUT_MIN - 1
    },
    slugs: reviveNoindex.map(d => d.slug),
    deals: reviveNoindex
  }, null, 2));
  console.log(`🔶 Saved ${reviveNoindex.length} deals to ${noindexPath}`);

  writeFileSync(blockedPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: blocked.length,
    description: 'Deals still thin/empty - do not revive yet',
    criteria: {
      aboutContentBelow: NOINDEX_ABOUT_MIN
    },
    slugs: blocked.map(d => d.slug),
    deals: blocked
  }, null, 2));
  console.log(`❌ Saved ${blocked.length} deals to ${blockedPath}`);

  // Print sample of each category
  console.log('\n📝 Sample from each category:');

  if (reviveSafe.length > 0) {
    console.log('\n   reviveSafe (first 5):');
    reviveSafe.slice(0, 5).forEach(d => {
      console.log(`     - ${d.slug} (about: ${d.aboutContentLen}, sections: ${d.otherSectionsCount}, codes: ${d.nonEmptyCodeCount})`);
    });
  }

  if (reviveNoindex.length > 0) {
    console.log('\n   reviveNoindex (first 5):');
    reviveNoindex.slice(0, 5).forEach(d => {
      console.log(`     - ${d.slug} (about: ${d.aboutContentLen}, sections: ${d.otherSectionsCount}, codes: ${d.nonEmptyCodeCount})`);
    });
  }

  if (blocked.length > 0) {
    console.log('\n   blocked (first 5):');
    blocked.slice(0, 5).forEach(d => {
      console.log(`     - ${d.slug} (about: ${d.aboutContentLen}, sections: ${d.otherSectionsCount}, codes: ${d.nonEmptyCodeCount})`);
    });
  }

  console.log('\n🎉 Audit complete!');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
