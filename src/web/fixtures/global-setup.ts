import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { USERS } from '../../../test-data/web/users';

async function globalSetup(config: FullConfig): Promise<void> {
  // API-only CI sets this to skip the browser launch — Chromium is not installed there
  if (process.env.SKIP_BROWSER_SETUP === 'true') return;

  const storageDir = path.join(process.cwd(), 'storage-state');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const webProject = config.projects.find(p => p.name === 'web');
  const baseURL = (webProject?.use?.baseURL as string) || 'https://www.saucedemo.com';

  // browser declared outside try so the finally block can always close it — without this,
  // a failed login leaves a Chromium process hanging and stalls the CI runner indefinitely.
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(baseURL);
    await page.locator('[data-test="username"]').fill(USERS.standard.username);
    await page.locator('[data-test="password"]').fill(USERS.standard.password);
    await page.locator('[data-test="login-button"]').click();
    await page.waitForURL('**/inventory.html', { timeout: 15_000 });

    // waitForURL is necessary but not sufficient — validate the authenticated shell rendered.
    const isLoggedIn = await page
      .locator('[data-test="shopping-cart-link"]')
      .isVisible({ timeout: 5_000 });

    if (!isLoggedIn) {
      throw new Error(
        'Global setup: URL changed to inventory but cart link is not visible. ' +
        'Verify USERS.standard credentials and that SauceDemo is accessible.'
      );
    }

    await context.storageState({ path: 'storage-state/auth.json' });

    // Validate the storage state contains cookies — an empty jar means the session
    // did not persist and every pre-auth web test would fail with a silent auth miss.
    const raw   = fs.readFileSync('storage-state/auth.json', 'utf-8');
    const state = JSON.parse(raw) as { cookies?: unknown[] };
    if (!state.cookies || state.cookies.length === 0) {
      throw new Error(
        'Global setup: auth.json was created but contains no cookies. Session did not persist.'
      );
    }

    await context.close();
  } finally {
    if (browser) await browser.close();
  }
}

export default globalSetup;
