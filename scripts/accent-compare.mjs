// Render an offer page three times with three accent values, screenshot each.
// Overrides --accent-color via injected stylesheet so we don't need to mutate globals.css.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const URL = 'http://localhost:3000/offer/toolsuite-vip';
const OUT = '/tmp';

const variants = [
  { name: 'A-cyan-500',   accent: '#06B6D4', hover: '#0891B2' },
  { name: 'B-teal-600',   accent: '#0891B2', hover: '#0E7490' },
  { name: 'C-blue-600',   accent: '#2563EB', hover: '#1D4ED8' },
];

const overrideCSS = (accent, hover) => `
  :root, [data-theme="dark"] {
    --accent-color: ${accent} !important;
    --accent-hover: ${hover} !important;
    --input-focus: ${accent} !important;
  }
  .bg-accent       { background-color: ${accent} !important; }
  .text-accent     { color: ${accent} !important; }
  .border-accent   { border-color: ${accent} !important; }
  .hover\\:bg-accent:hover { background-color: ${hover} !important; }
`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1800 }, // tall enough for above-the-fold + first sections
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

// Quiet down console noise
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

console.log(`Navigating to ${URL}…`);
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });

// Let any client-side hydration settle
await page.waitForTimeout(1500);

for (const v of variants) {
  console.log(`Variant ${v.name}: applying ${v.accent}…`);
  await page.addStyleTag({ content: overrideCSS(v.accent, v.hover) });
  await page.waitForTimeout(400); // let paint settle
  const path = `${OUT}/accent-${v.name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`  → ${path}`);
}

await browser.close();
console.log('Done.');
