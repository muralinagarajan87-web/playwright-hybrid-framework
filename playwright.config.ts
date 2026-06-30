import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    // JSON output enables test-result trend dashboards, flaky-test detection,
    // and integration with external reporting tools (TestRail, Allure, etc.)
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  globalSetup: './src/web/fixtures/global-setup.ts',
  globalTeardown: './src/web/fixtures/global-teardown.ts',

  projects: [
    // ── Web: Chromium ─────────────────────────────────────────────────────
    // Primary browser for sanity (PR gate) and regression.
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

    // ── Web: Firefox ──────────────────────────────────────────────────────
    // Cross-browser coverage — regression only (not sanity, to keep PR gates fast).
    // Storage state (cookies) from global-setup is browser-agnostic JSON;
    // the same auth.json works across Chromium and Firefox.
    {
      name: 'web-firefox',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.WEB_BASE_URL || 'https://www.saucedemo.com',
        storageState: 'storage-state/auth.json',
        actionTimeout: 10_000,
        navigationTimeout: 30_000,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },

    // ── API ───────────────────────────────────────────────────────────────
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        // baseURL here and API_CONFIG.baseUrl in config.ts both read the same env var.
        // Service methods build absolute URLs from API_CONFIG.baseUrl, so they do not
        // rely on this baseURL. It is kept here so any raw `request` fixture usage in
        // future tests can use relative paths without needing an import of API_CONFIG.
        baseURL: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    },
  ],
});
