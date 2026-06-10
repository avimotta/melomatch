// MeloMatch loading state reproduction script
import { chromium } from 'playwright';
import { randomBytes } from 'crypto';

const BASE = 'http://localhost:3000';
const TEST_EMAIL = `test-${randomBytes(4).toString('hex')}@test.com`;
const TEST_PASS = 'TestPass123!';

// Log categories
const LOGS = { auth: [], discover: [], profile: [], messages: [], other: [] };

function categorize(line) {
  if (line.includes('🔐')) return 'auth';
  if (line.includes('DISCOVER')) return 'discover';
  if (line.includes('PROFILE')) return 'profile';
  if (line.includes('MESSAGES')) return 'messages';
  return 'other';
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});
const page = await context.newPage();

// Capture ALL console messages
page.on('console', (msg) => {
  const text = msg.text();
  const cat = categorize(text);
  LOGS[cat].push(`[${msg.type().toUpperCase()}] ${text}`);
});

// Also capture JS exceptions
page.on('pageerror', (err) => {
  LOGS.other.push(`[PAGE_ERROR] ${err.message}`);
});

console.log('=== STEP 1: Navigate to /login ===');
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
// Take a screenshot for debugging
await page.screenshot({ path: '/tmp/debug-01-login.png' });

console.log('\n=== STEP 2: Sign up ===');
await page.fill('input[type="email"]', TEST_EMAIL);
await page.fill('input[type="password"]', TEST_PASS);
await page.click('button[type="submit"]');

// Wait for navigation to /discover
await page.waitForURL('**/discover', { timeout: 15000 });
console.log('✅ Landed on /discover');

// Wait for content to load
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/debug-02-discover.png' });

console.log('\n=== STEP 3: Go to Messages ===');
// Click the Messages link in the navbar
const messagesLink = page.locator('a[href="/messages"]').first();
await messagesLink.click();

// Wait for navigation to /messages
await page.waitForURL('**/messages', { timeout: 15000 });
console.log('✅ Landed on /messages');

// Wait for content to load
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/debug-03-messages.png' });

console.log('\n=== STEP 4: Click browser Back ===');
await page.goBack({ waitUntil: 'networkidle' });

// Wait for the page to potentially get stuck
await page.waitForTimeout(5000);
await page.screenshot({ path: '/tmp/debug-04-back.png' });

// Check what's visible
const visibleText = await page.locator('main').textContent();
const spinnerVisible = visibleText?.includes('Loading musicians') || 
                       visibleText?.includes('Loading profile') ||
                       visibleText?.includes('Loading connections');

console.log(`\n=== RESULTS ===`);
console.log(`Spinner still visible after 5s: ${spinnerVisible}`);
console.log(`Current URL: ${page.url()}`);
console.log(`Page text (first 300 chars): ${visibleText?.substring(0, 300)}`);

// Print all logs organized
console.log(`\n\n========== AUTH LOGS (${LOGS.auth.length}) ==========`);
LOGS.auth.forEach(l => console.log(l));

console.log(`\n========== DISCOVER LOGS (${LOGS.discover.length}) ==========`);
LOGS.discover.forEach(l => console.log(l));

console.log(`\n========== MESSAGES LOGS (${LOGS.messages.length}) ==========`);
LOGS.messages.forEach(l => console.log(l));

console.log(`\n========== OTHER LOGS (${LOGS.other.length}) ==========`);
LOGS.other.forEach(l => console.log(l));

console.log(`\n========== PROFILE LOGS (${LOGS.profile.length}) ==========`);
LOGS.profile.forEach(l => console.log(l));

await browser.close();
