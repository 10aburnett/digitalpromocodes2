import { prisma } from '../src/lib/prisma';

// Current 78 slugs we already have (DO NOT DELETE THESE)
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
  'tms-heavy-hitters', 'josh-exclusive-vip-access'
]);

// Top Whop affiliates from the user's list
const topWhops = [
  'Divine', 'ParlayScience', 'GOAT Sports Bets', 'Social Army', 'Wealth Group',
  'Beat the Books', 'Scarface Trades', 'Stocks with Josh', 'GG33 Academy',
  'Ecom Degree University', 'Skylit', 'Your First Dollar', 'Frugal Season',
  'Trust My System', 'Alertsify', 'Hidden Society', 'DEAL SOLDIER', 'Potion Alpha',
  'MediaLabs', 'GFNF', 'Kaizen', 'Hold My Hand Wholesale', 'Juiced Bets',
  'Profit Lounge', 'Trophies Sports Picks', '6-Figure Creator', 'Team Bull Trading',
  'Media Metas', 'eMoney', 'HobbyHangout', 'Stock Talk Insiders', 'Big Gains Club',
  'Spy Essentials', 'The Haven', 'BetRecaps', 'PropFellas', 'RT Picks',
  'Mogul Stock Group', 'Stock Hours', 'Exclusive Analytics', 'Owls Options Traders',
  'Stock Levels University', 'Black Tie Analytics', 'Viral Vision', 'the zesty chefs',
  'Honey Drip Network', 'Ecom Tools', 'Stellar AIO', 'SPY BANK', 'TradeProElite',
  'Push Platform', 'Ambassador Academy', 'Larrys Lounge', 'KingCapSports',
  'Cash Flow University', 'The Sweepers', 'AdRevival', 'SwipeSignals', 'CourtSide Locks',
  'Trade With Insight', 'Shocked', 'Scalboost', 'Crystal Academy', 'EzTrades',
  'FU Money Club', 'Official Picks', 'Lunch Money', 'Miles High Club', 'SOUSA VIP',
  'Bandars Bounties', 'FLIPFLUENCE', 'PlayBit', 'Options Insider', 'Polar Chefs',
  'GLO Sports', 'Cook the Books', 'VALUE Spy Crew', 'PokeNotify', 'The Options Cartel',
  'Silently', 'RakeTrades', 'TopTierBetz', 'Traffic Hackers', 'Her Last Call Academy',
  'Equinox Traders', 'The Traveling Trader', 'Rise Now', 'Sourced Betting', 'Pokecop',
  'ecomtalent', 'New Age Trading', 'SICKBOYTRADES', 'Sindbad', 'Bravo Six Picks',
  'Bookie Bandit', 'The Agent Accelerator', 'Full Port University', 'Book of Alpha',
  'The Buy Box', 'COMMERCIVE', 'DataWise', 'ToolSuite', 'Zzz Money Club',
  'Tailored Trades', 'RisingPhoenixTrades', 'SAR Trading', 'Ecom Paradise',
  'Ticket Broker U', 'Team2Trading', 'Dodgys Dungeon', 'Live Academy',
  'Elite Options Trader', 'Rippy Club', 'Bettor Odds', '1of1DFS', 'Bet Bettor',
  'MC Sports Analytics', 'Tailed EnterPrize', 'Resellers Paradise', 'Only Bands Money',
  '50x Club', 'House Of Resell', 'OasisAlerts', 'DCRYPT', 'CHEESELOCKS', 'Whale Room',
  'BH Insights', 'Tickio', 'The Yard', 'Poke Signals', 'Sniper Trades', 'Creator Syndicate',
  'Zeto Picks', 'SnewJ Props', 'Aurora Trading', 'The Peachy Investor', 'Shiny Town',
  'Ghostsportzpickz', 'Futdreamss', 'Content Academy', 'The Market Lens', 'Degen Tavern',
  'Uncharted Territory', 'Startup', 'KAPITALAUFBAU', 'Proxcop', 'Top Floor Trading',
  'PowerTrades', 'DemonTrading', 'AdexTrades', 'Top Tier Signals', 'Topblast',
  'Your Best Bet', 'Paragn Network', 'Locker Room', 'Trade With Titans', 'Front Runners',
  'School of gods', 'Dr Profit Premium', 'Chroma Trading', 'Fidel Cache Flow',
  'Tuscanyrose', 'Promoguy', 'Market Fluidity', 'Social Club Academy', 'Arbitrage Ops',
  'Lowkey Discord', 'Trade By Design', 'Dropship Journey', 'PB Premium', 'PJ Trades',
  'KC Trades', 'Bread and Butter', 'OddsJuice', 'LIMITLES', 'LuxuryPaid',
  'Certified Crypto', 'YAUPICKS', 'Tikey Tickets', 'MTMVERSE', 'Endurance',
  'DREANZ', 'SharpMoney', 'HiddenAIO', 'Chart Hackers', 'Trade Assist', 'Kenan Grace',
  'OFM Empire', 'ABA100X', 'Toodegrees', 'Diamond Trading', 'House of Stimms',
  'SuperLuckeee', 'Viral Bricks', 'The Hustle Club', 'The Wholesale Atlas',
  'GG33 University', 'Akari', 'TikTok Money Maker', 'The Mail Room', 'Lions Den',
  'GOATIFY', 'Empire Sports Betting', 'Link Up Community', 'Jdub Trades', 'Divine Degen',
  'NextWave Indicators', 'Traders Blueprint', 'Skyridge', 'DispurGen', 'MONETIZE',
  '247 Terminal', 'Huracan Trading', 'Startup Preneurs', 'AutoFlipped', 'Bet Labs Sports',
  'AMNotify', 'Phantom Checker', 'Tempo Trades', 'TTS Insiders', 'Derivatives Trading',
  'Moon Trades', 'Asozial', 'PeloSwing', 'DealHawk', 'Levs Locks', 'Jonahs Stocks',
  'Shiftly', 'Kckd Notify', 'IG Growth Tool', 'WW Global Alliance', 'LiveCops',
  'WEALTH HUB', 'Kaikicks', 'Poke Pandemonium', 'Paper Gains', 'All In Abe',
  'Props Lab', 'Trade Craft Tools', 'Vulture', 'Max Options Trading', 'De Wolf van Washington',
  'Crypto Archie', 'Tiktok Titans', 'Bands VIP', '28 Club', 'The Lab', 'House of Profits',
  'The Doc Prop', 'Momentum', 'Shadows Chefs', 'The Krypto King', 'Retail',
  'CB Trading', 'Socialbuz', 'Free Cash Premium', 'Printers Paradise', 'Impact Team',
  'Traders Wealth', 'The Alliance', 'Trinity Trading', 'Alpine Trading', 'Zamunda',
  'LV Trades', 'Blastoise', 'Platinum Trading', 'STOCK KING SHARKS', 'Playbook Investment',
  'GammaEdge', 'THE ECOM MASTERCLASS', 'NPZ Trading', 'Savage Ecom', 'ChilliManPicks',
  '4ORTE', 'Deal Sniper', 'Unity Academy', 'Parlay Minds', 'Flash Fund', 'The Syndicate',
  'The Family', 'Baron Trading', 'Earnit Media', 'MoneyBoys Stock', 'Black Sheep Culture',
  'Assassin Stocks', 'Ascent Repricer', 'Traders Compound', 'Boka Trading', 'Exposcale',
  'MOTION MEMBERS', 'SPY Day Trading', 'Clutch Investments', 'Gargantua AIO', '502SLIPS',
  'The Fractal Exchange', 'Degen VIP', 'Nautilus Deals', 'Enrich Trades', 'SolarTools',
  'Megoda', 'PUSHING PROFIT', 'The Champagne Room', 'FlipAlert', 'Edge Zone',
  'FirstStepTrading', 'NotifyFrance', 'Arts Crypto Circle', 'Monster Bet',
  'TookThatTradingGroup', 'InTheCircle', 'UnknownCollect', 'bolo group', 'Trade Manager',
  'GabesAlerts', 'Resale Radar', 'SneakersyncLabs', 'VenomCooks', 'Price Hacking',
  'Botos Trading', 'Quantum Algo', 'PaysToWait', '242 Just Picks', 'Cakes Bakes',
  'Gambling Gurus', 'SelfMade Society', 'Elevate Community', 'Select Trading',
  'PokeFreeze Notify', 'ZTH Training', 'NextGen Publishers', 'ndotdiab', 'Boss Up Academy',
  '444 Capital Club', 'NikeShoeBot', 'THE ULTIMATE TRADING ARENA', 'Insiderz',
  'Creator Cashflow', 'FBA ACADEMY', 'Straight Shooters', 'Team 100K Trading',
  'Gains Gears', 'Shadow Flips', 'Voss Trading', 'No Sweat Bets', 'The Alpha Club',
  'Card Followers', 'Meme Mafia', 'MoonBoys Crypto', 'Pay2PlayUniversity', 'Dopamine',
  'Propbet Mafia', 'Spitfire Traders', 'TheWave', 'Profit Insider', 'SharpTank',
  'Uproas', 'Fyndit', 'PokeFinder', 'Profit Pioneers', 'The Sweatshop', 'MAI Bets',
  'Viral Flow', 'League Mastery', 'Trading Options Academy'
];

async function findMatches() {
  // Get all deals with promo codes
  const dealsWithPromos = await prisma.deal.findMany({
    where: {
      PromoCode: { some: {} },
      NOT: { retirement: 'GONE' }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
    }
  });

  console.log('=== NEW MATCHES (Top Whops with promos NOT in current 78) ===\n');

  const newMatches: Array<{topWhop: string, ourName: string, ourSlug: string}> = [];

  for (const whopName of topWhops) {
    const searchTerm = whopName.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const deal of dealsWithPromos) {
      const dealNameNorm = deal.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const dealSlugNorm = deal.slug.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check for matches
      if (
        (dealNameNorm.includes(searchTerm) && searchTerm.length >= 4) ||
        (dealSlugNorm.includes(searchTerm) && searchTerm.length >= 4) ||
        (searchTerm.includes(dealNameNorm) && dealNameNorm.length >= 4)
      ) {
        // Only include if NOT already in existing slugs
        if (!existingSlugs.has(deal.slug)) {
          newMatches.push({
            topWhop: whopName,
            ourName: deal.name,
            ourSlug: deal.slug
          });
        }
      }
    }
  }

  // Dedupe by slug
  const seen = new Set<string>();
  const uniqueMatches: typeof newMatches = [];

  for (const m of newMatches) {
    if (!seen.has(m.ourSlug)) {
      seen.add(m.ourSlug);
      uniqueMatches.push(m);
    }
  }

  // Filter: must have multi-word slug AND not be from same brand family as existing
  const genericSingleWords = ['creator', 'academy', 'exclusive', 'premium', 'member', 'trading', 'discord', 'sports-picks'];

  // Extract brand keywords from existing slugs to avoid duplicates
  const existingBrandKeywords = new Set<string>();
  for (const slug of existingSlugs) {
    // Add the full slug
    existingBrandKeywords.add(slug.replace(/-/g, ''));
    // Add significant parts (3+ chars)
    const parts = slug.split('-').filter(p => p.length >= 3);
    parts.forEach(p => existingBrandKeywords.add(p));
  }

  const filtered = uniqueMatches.filter(m => {
    // Must contain hyphen (multi-word)
    if (!m.ourSlug.includes('-')) return false;
    // Must not be a known generic slug
    if (genericSingleWords.includes(m.ourSlug)) return false;

    // Check if this is from same brand family as existing
    const slugNorm = m.ourSlug.replace(/-/g, '');
    for (const existing of existingSlugs) {
      const existingNorm = existing.replace(/-/g, '');
      // If slug contains existing brand or vice versa, it's a duplicate
      if (slugNorm.includes(existingNorm) || existingNorm.includes(slugNorm)) {
        return false;
      }
    }
    return true;
  });

  // Dedupe by brand (one product per brand)
  const seenBrands = new Set<string>();
  const deduped = filtered.filter(m => {
    const brand = m.topWhop.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenBrands.has(brand)) return false;
    seenBrands.add(brand);
    return true;
  });

  // Sort by topWhop name
  deduped.sort((a, b) => a.topWhop.localeCompare(b.topWhop));

  console.log('=== NEW BRAND MATCHES (one per brand, multi-word slugs) ===\n');
  deduped.forEach((m, i) => {
    console.log(`${i+1}. "${m.topWhop}" → ${m.ourSlug}`);
  });

  console.log(`\n=== TOTAL NEW BRANDS: ${deduped.length} ===`);
  console.log(`\nThese are NEW brands from top Whop affiliates with promo codes,`);
  console.log(`that are NOT already in your current 78-item list.`);
  console.log(`\nYou need 12 to reach 90. Pick your favorites from this list!`);
}

findMatches().catch(console.error).finally(() => prisma.$disconnect());
