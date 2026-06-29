import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  globalSetup: './src/web/fixtures/global-setup.ts',
  globalTeardown: './src/web/fixtures/global-teardown.ts',

  projects: [
    {
      name: 'web',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.WEB_BASE_URL || 'https://www.saucedemo.com',
        storageState: 'storage-state/auth.json',
        actionTimeout: 10_000,
        navigationTimeout: 30_000,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    },
  ],
});
