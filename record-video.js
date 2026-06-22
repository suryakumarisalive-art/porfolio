const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

const BASE = 'https://seoforage.vercel.app';
const VIDEO_DIR = '/home/user/porfolio/video-raw';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function smoothScroll(page, targetY, duration = 1200) {
  const startY = await page.evaluate(() => window.scrollY);
  const steps = 60;
  for (let i = 1; i <= steps; i++) {
    const ease = 1 - Math.pow(1 - i / steps, 3); // ease-out cubic
    await page.evaluate((y) => window.scrollTo(0, y), startY + (targetY - startY) * ease);
    await sleep(duration / steps);
  }
}

async function scrollToBottom(page, speed = 6) {
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewH = await page.evaluate(() => window.innerHeight);
  let current = 0;
  while (current < totalHeight - viewH) {
    current = Math.min(current + speed * 14, totalHeight - viewH);
    await page.evaluate((y) => window.scrollTo(0, y), current);
    await sleep(16);
  }
}

async function scrollToTop(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
}

(async () => {
  const { execSync } = require('child_process');
  execSync(`mkdir -p ${VIDEO_DIR}`);

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--ignore-certificate-errors', '--disable-gpu'],
  });

  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await ctx.newPage();

  // ── SCENE 1: Homepage hero ─────────────────────────────────────────────────
  console.log('Scene 1: Homepage hero...');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await sleep(2500); // let viewer absorb the hero

  // ── SCENE 2: Scroll slowly through the whole homepage ─────────────────────
  console.log('Scene 2: Scrolling homepage...');
  const homeHeight = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, homeHeight * 0.22, 1400);
  await sleep(1200);
  await smoothScroll(page, homeHeight * 0.42, 1400);
  await sleep(1200);
  await smoothScroll(page, homeHeight * 0.62, 1400);
  await sleep(1200);
  await smoothScroll(page, homeHeight * 0.82, 1400);
  await sleep(1200);
  await smoothScroll(page, homeHeight, 1200);
  await sleep(1500);

  // ── SCENE 3: Features page ────────────────────────────────────────────────
  console.log('Scene 3: Features page...');
  await scrollToTop(page);
  await sleep(300);
  // hover over nav link first
  const featLink = await page.$('a[href*="feature"], nav a:nth-child(1)');
  if (featLink) { await featLink.hover(); await sleep(400); }
  await page.goto(`${BASE}/features`, { waitUntil: 'networkidle' });
  await sleep(2000);
  const featHeight = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, featHeight * 0.35, 1600);
  await sleep(1000);
  await smoothScroll(page, featHeight * 0.7, 1600);
  await sleep(1000);
  await smoothScroll(page, featHeight, 1200);
  await sleep(1500);

  // ── SCENE 4: Pricing page ─────────────────────────────────────────────────
  console.log('Scene 4: Pricing page...');
  await scrollToTop(page);
  await sleep(300);
  await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' });
  await sleep(2200);
  const pricHeight = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, pricHeight * 0.4, 1400);
  await sleep(1200);
  await smoothScroll(page, pricHeight, 1400);
  await sleep(2000);

  // ── SCENE 5: Free Tools page ──────────────────────────────────────────────
  console.log('Scene 5: Free Tools page...');
  await scrollToTop(page);
  await sleep(300);
  await page.goto(`${BASE}/tools`, { waitUntil: 'networkidle' });
  await sleep(2000);
  const toolsHeight = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, toolsHeight * 0.3, 1400);
  await sleep(800);
  await smoothScroll(page, toolsHeight * 0.6, 1400);
  await sleep(800);
  await smoothScroll(page, toolsHeight, 1200);
  await sleep(1500);

  // ── SCENE 6: Click into a tool ────────────────────────────────────────────
  console.log('Scene 6: Tool detail...');
  await scrollToTop(page);
  await sleep(500);
  const toolCard = await page.$('a[href*="tool"], .tool-card a, main a');
  if (toolCard) {
    const href = await toolCard.getAttribute('href');
    await toolCard.hover();
    await sleep(600);
    if (href && (href.startsWith('/') || href.startsWith(BASE))) {
      await page.goto(href.startsWith('http') ? href : `${BASE}${href}`, { waitUntil: 'networkidle' });
      await sleep(2000);
      const h = await page.evaluate(() => document.body.scrollHeight);
      await smoothScroll(page, h * 0.5, 1400);
      await sleep(1000);
      await smoothScroll(page, h, 1200);
      await sleep(1500);
    }
  }

  // ── SCENE 7: Blog page ────────────────────────────────────────────────────
  console.log('Scene 7: Blog page...');
  await page.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
  await sleep(2000);
  const blogHeight = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, blogHeight * 0.5, 1600);
  await sleep(1000);
  await smoothScroll(page, blogHeight, 1400);
  await sleep(1500);

  // ── SCENE 8: Back to homepage, hover over CTA ─────────────────────────────
  console.log('Scene 8: CTA close-up...');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await sleep(1500);
  const cta = await page.$('a[href*="sign"], a[href*="get-started"], button, .cta');
  if (cta) {
    await cta.scrollIntoViewIfNeeded();
    await sleep(600);
    await cta.hover();
    await sleep(1200);
  }
  await sleep(1000);

  // ── SCENE 9: Mobile view ──────────────────────────────────────────────────
  console.log('Scene 9: Mobile view...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await sleep(2000);
  const mobHeight = await page.evaluate(() => document.body.scrollHeight);
  await smoothScroll(page, mobHeight * 0.25, 1400);
  await sleep(800);
  await smoothScroll(page, mobHeight * 0.55, 1400);
  await sleep(800);
  await smoothScroll(page, mobHeight, 1400);
  await sleep(2000);

  // ── END ───────────────────────────────────────────────────────────────────
  await browser.close();
  console.log('✅ Raw video saved to', VIDEO_DIR);
})();
