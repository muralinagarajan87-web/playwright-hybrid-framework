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

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(baseURL);
  await page.locator('[data-test="username"]').fill(USERS.standard.username);
  await page.locator('[data-test="password"]').fill(USERS.standard.password);
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');

  await context.storageState({ path: 'storage-state/auth.json' });
  await browser.close();
}

export default globalSetup;
