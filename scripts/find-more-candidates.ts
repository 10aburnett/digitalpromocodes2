import { prisma } from '../src/lib/prisma';

// Current 78 slugs (from the curated list)
const existingSlugs = new Set([
  'divine-discord', 'parlaysciencepremium', 'goat-sports-bets', 'social-army', 'wealthgroup',
  'beat-the-books', 'scarface-trades', 'stockswithjosh', 'gg33-academy', 'ecomdegreeuniversity',
  'skylit', 'yourfirstdollar', 'frugal-season', 'trust-my-system', 'alertsify',
  'hidden-society', 'deal-soldier', 'potionalpha', 'medialabs', 'gfnf',
  'kaizen', 'holdmyhandwholesale', 'juiced-bets', 'profitlounge', 'trophiessportspicks',
  '6figurecreator', 'teambulltrading', 'mediametas', 'emoney', 'hobbyhangout',
  'stocktalkinsiders', 'biggainsclub', 'spyessentials', 'the-haven', 'betrecaps',
  'propfellas', 'rt-picks', 'mogul-stock-group', 'stockhours', 'owlsoptionstraders',
  'stocklevelsuniversity', 'blacktieanalytics', 'viralvision', 'thezestychefs',
  'honeydripnetwork', 'ecomtools', 'stellaraio', 'spybank', 'tradeproelite',
  'pushplatform', 'ambassadoracademy', 'larryslounge', 'kingcapsports', 'cashflowuniversity',
  'thesweepers', 'adrevival', 'swipesignals', 'courtside-locks', 'tradewithinsight',
  'shocked', 'scalboost', 'crystalacademy', 'eztrades', 'fumoney',
  'officialpicks', 'lunchmoney', 'mileshighclub', 'sousavip', 'bandarsbounties',
  'flipfluence', 'playbit', 'optionsinsider', 'polarchefs', 'glosports',
  'cookthebooks', 'valuespycrew', 'pokenotify',
  // Plus the ones we added
  'tms-heavy-hitters', 'josh-exclusive-vip-access'
]);

async function findCandidates() {
  // Get ALL candidates with promo codes not in existing list
  const candidates = await prisma.deal.findMany({
    where: {
      PromoCode: { some: {} },
      slug: { notIn: Array.from(existingSlugs) },
      NOT: { retirement: 'GONE' }
    },
    select: {
      name: true,
      slug: true,
      category: true,
    },
    orderBy: { name: 'asc' }
  });

  // Only filter: must NOT be a single-word slug (must contain hyphen)
  const filtered = candidates.filter(c => c.slug.includes('-'));

  console.log('=== CANDIDATES (multi-word slugs with promo codes) ===\n');

  filtered.slice(0, 80).forEach((c, i) => {
    console.log(`${i+1}. ${c.name} → ${c.slug}`);
  });

  console.log(`\n=== Total candidates: ${filtered.length} ===`);
}

findCandidates().catch(console.error).finally(() => prisma.$disconnect());
