import { prisma } from '../src/lib/prisma';

// Full list of top Whop affiliates
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
  'Viral Flow', 'League Mastery', 'Trading Options Academy', 'TMS', 'Josh'
];

async function findMatches() {
  // Get ALL deals with promo codes
  const dealsWithPromos = await prisma.deal.findMany({
    where: {
      PromoCode: { some: {} },
      NOT: { retirement: 'GONE' }
    },
    select: {
      name: true,
      slug: true,
      _count: { select: { PromoCode: true } }
    }
  });

  console.log(`Found ${dealsWithPromos.length} deals with promo codes in DB\n`);
  console.log('=== MATCHES (Top Whop Affiliates → DB Deals with Promo Codes) ===\n');

  const matches: Array<{whop: string, name: string, slug: string, promos: number}> = [];

  for (const whopName of topWhops) {
    // Create search terms - be liberal
    const searchTerms = [
      whopName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      // Also try key words
      ...whopName.toLowerCase().split(/\s+/).filter(w => w.length >= 3)
    ];

    for (const deal of dealsWithPromos) {
      const dealNameNorm = deal.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const dealSlugNorm = deal.slug.toLowerCase().replace(/[^a-z0-9]/g, '');

      for (const term of searchTerms) {
        if (term.length < 3) continue;

        // Check for matches
        if (
          (dealNameNorm.includes(term) && term.length >= 4) ||
          (dealSlugNorm.includes(term) && term.length >= 4) ||
          (term.includes(dealNameNorm) && dealNameNorm.length >= 4) ||
          (term.includes(dealSlugNorm) && dealSlugNorm.length >= 4)
        ) {
          matches.push({
            whop: whopName,
            name: deal.name,
            slug: deal.slug,
            promos: deal._count.PromoCode
          });
          break; // Don't add same deal multiple times for same whop
        }
      }
    }
  }

  // Dedupe by slug, keep first match
  const seen = new Set<string>();
  const unique = matches.filter(m => {
    if (seen.has(m.slug)) return false;
    seen.add(m.slug);
    return true;
  });

  // Sort by whop name
  unique.sort((a, b) => a.whop.localeCompare(b.whop));

  let count = 1;
  for (const m of unique) {
    console.log(`${count}. "${m.whop}" → ${m.name} (${m.slug}) [${m.promos} promos]`);
    count++;
  }

  console.log(`\n=== TOTAL MATCHES: ${unique.length} ===`);
}

findMatches().catch(console.error).finally(() => prisma.$disconnect());
