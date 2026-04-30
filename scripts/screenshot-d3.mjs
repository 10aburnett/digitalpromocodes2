// Screenshots: sidebar-fix proof (TRADING vs no-filter) + reveal prominence (offer at 1440/1024/375).
import { chromium } from 'playwright';

const shots = [
  { name: 'home-nofilter-1440',     url: 'http://localhost:3000/',                          width: 1440, height: 1900 },
  { name: 'home-trading-1440',      url: 'http://localhost:3000/?whopCategory=TRADING',     width: 1440, height: 1900 },
  { name: 'home-sportsbet-1440',    url: 'http://localhost:3000/?whopCategory=SPORTS_BETTING', width: 1440, height: 1900 },
  { name: 'offer-1440',             url: 'http://localhost:3000/offer/toolsuite-vip',       width: 1440, height: 2000 },
  { name: 'offer-1024',             url: 'http://localhost:3000/offer/toolsuite-vip',       width: 1024, height: 1700 },
  { name: 'offer-0375',             url: 'http://localhost:3000/offer/toolsuite-vip',       width: 375,  height: 1500 },
];

const browser = await chromium.launch({ headless: true });

for (const s of shots) {
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  console.log(`-> ${s.width}px ${s.url}`);
  try {
    await page.goto(s.url, { waitUntil: 'networkidle', timeout: 90_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `/tmp/d3-${s.name}.png`, fullPage: false });
    console.log(`   /tmp/d3-${s.name}.png`);
  } catch (e) {
    console.error(`   FAILED: ${e.message}`);
  }
  await ctx.close();
}

await browser.close();
console.log('Done.');
