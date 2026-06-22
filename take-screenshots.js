const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

const OUT = '/home/user/porfolio/screenshots';
const BASE = 'https://seoforage.vercel.app';

async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: opts.fullPage || false, ...opts });
  console.log(`✓ ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--ignore-certificate-errors'] });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();

  // ── 1. Homepage – above the fold ──────────────────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot(page, '01-homepage-hero');

  // ── 2. Homepage – full page scroll ────────────────────────────────────────
  await shot(page, '02-homepage-full', { fullPage: true });

  // ── 3. Scroll to Features section ─────────────────────────────────────────
  await page.evaluate(() => {
    const el = document.querySelector('[id*="feature"], section:nth-of-type(2), h2');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  await shot(page, '03-features-section');

  // ── 4. Scroll to Pricing ──────────────────────────────────────────────────
  await page.evaluate(() => {
    const all = [...document.querySelectorAll('h2, h3, section')];
    const el = all.find(e => e.textContent.toLowerCase().includes('pric'));
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  await shot(page, '04-pricing-section');

  // ── 5. Scroll to Testimonials ─────────────────────────────────────────────
  await page.evaluate(() => {
    const all = [...document.querySelectorAll('h2, h3, section, div')];
    const el = all.find(e => e.textContent.toLowerCase().includes('testimonial') || e.textContent.toLowerCase().includes('what people'));
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  await shot(page, '05-testimonials-section');

  // ── 6. Free Tools page ────────────────────────────────────────────────────
  await page.goto(`${BASE}/tools`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '06-free-tools-page');
  await shot(page, '06b-free-tools-full', { fullPage: true });

  // ── 7. Pricing page ───────────────────────────────────────────────────────
  await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '07-pricing-page');
  await shot(page, '07b-pricing-full', { fullPage: true });

  // ── 8. Features page ──────────────────────────────────────────────────────
  await page.goto(`${BASE}/features`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '08-features-page');
  await shot(page, '08b-features-full', { fullPage: true });

  // ── 9. Blog page ──────────────────────────────────────────────────────────
  await page.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '09-blog-page');

  // ── 10. Mobile view – homepage ────────────────────────────────────────────
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '10-mobile-homepage');
  await shot(page, '10b-mobile-homepage-full', { fullPage: true });

  // ── 11. Mobile – open hamburger menu ─────────────────────────────────────
  const burger = await page.$('button[aria-label*="menu"], button[aria-label*="Menu"], .hamburger, [class*="burger"], [class*="mobile-menu"] button');
  if (burger) {
    await burger.click();
    await page.waitForTimeout(500);
    await shot(page, '11-mobile-nav-open');
  }

  // ── 12. Tablet view – homepage ────────────────────────────────────────────
  await page.setViewportSize({ width: 768, height: 1024 }); // iPad
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '12-tablet-homepage');

  await browser.close();
  console.log('\n✅ All screenshots saved to', OUT);
})();
