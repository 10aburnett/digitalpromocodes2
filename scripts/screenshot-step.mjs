// Capture screenshots at specified widths × pages.
import { chromium } from 'playwright';

const widths = [
  { name: '1440', width: 1440, height: 1900 },
  { name: '1280', width: 1280, height: 1700 },
  { name: '1024', width: 1024, height: 1700 },
  { name: '0375', width: 375,  height: 1500 },
];

const pages = [
  { name: 'home',  url: 'http://localhost:3000/' },
  { name: 'offer', url: 'http://localhost:3000/offer/toolsuite-vip' },
];

const tag = process.argv[2] || 'step';
const browser = await chromium.launch({ headless: true });

for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w.width, height: w.height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));

  for (const p of pages) {
    const out = `/tmp/${tag}-${p.name}-${w.name}.png`;
    console.log(`-> ${w.width}px  ${p.url}`);
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 90_000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: out, fullPage: false });
      console.log(`   ${out}`);
    } catch (e) {
      console.error(`   FAILED: ${e.message}`);
    }
  }
  await ctx.close();
}

await browser.close();
console.log('Done.');
