import { chromium } from 'playwright';
import { randomBytes } from 'crypto';

const BASE = 'http://localhost:3000';
const EMAIL = `t-${randomBytes(4).toString('hex')}@test.com`;
const PASS = 'Test123!';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

// Capture console — prefix each with a timestamp
page.on('console', msg => {
  const t = Date.now();
  process.stdout.write(`[${t}] ${msg.type().toUpperCase()} ${msg.text()}\n`);
});
page.on('pageerror', err => process.stderr.write(`[PAGE_ERROR] ${err.message}\n`));

const wait = ms => new Promise(r => setTimeout(r, ms));

// ───── 1. Login ─────
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASS);
await page.click('button[type="submit"]');
await page.waitForURL('**/discover', { timeout: 15000 });
// Wait for ANY content to appear (not just the loading spinner)
await page.waitForFunction(() => {
  const t = document.body?.textContent || '';
  return t.includes('Discover') && !t.includes('Loading musicians');
}, { timeout: 15000 });
console.log('[TEST] ✅ Discover loaded');

// ───── 2. Navigate to Messages ─────
await page.locator('a[href="/messages"]').first().click();
await page.waitForURL('**/messages', { timeout: 15000 });
await wait(2000);

// ───── 3. Browser Back ─────
console.log('[TEST] >>> goBack()');
await page.goBack();

// Check immediately after back (no wait)
await wait(50);
let text = await page.locator('main').textContent() || '';
console.log(`[TEST] t+50ms  spinner=${text.includes('Loading musicians') || text.includes('Loading profile') || text.includes('Loading connections')}  text=${text.substring(0,120).replace(/\n/g,' ')}`);

// Check at intervals
for (let i = 0; i < 40; i++) {
  await wait(250);
  text = await page.locator('main').textContent() || '';
  const loading = text.includes('Loading musicians') || text.includes('Loading profile') || text.includes('Loading connections');
  const authSpinner = text.includes('animate-spin') && !text.includes('Discover') && !text.includes('Messages') && !text.includes('Edit');
  if (i < 5 || loading || authSpinner) {
    console.log(`[TEST] t+${(i+1)*250}ms loading=${loading} authSpinner=${authSpinner} text=${text.substring(0,120).replace(/\n/g,' ')}`);
  }
  if (!loading && !authSpinner) {
    console.log(`[TEST] ✅ Resolved at t+${(i+1)*250}ms`);
    break;
  }
  if (i === 39) {
    console.log(`[TEST] ❌ STUCK after 10s`);
    await page.screenshot({ path: '/tmp/debug-stuck.png' });
  }
}

await browser.close();
