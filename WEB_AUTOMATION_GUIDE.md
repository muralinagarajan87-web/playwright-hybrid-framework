# Web UI Automation Guide
### Framework: Playwright + TypeScript | Application: SauceDemo (https://www.saucedemo.com)

---

## Table of Contents

1. [What This Framework Does](#1-what-this-framework-does)
2. [Prerequisites — What You Need Before Starting](#2-prerequisites--what-you-need-before-starting)
3. [Installation — Step by Step](#3-installation--step-by-step)
4. [Project Structure Explained](#4-project-structure-explained)
5. [How the Framework Works](#5-how-the-framework-works)
6. [Running Tests — Every Command You Need](#6-running-tests--every-command-you-need)
7. [Reading the HTML Test Report](#7-reading-the-html-test-report)
8. [How to Add a New Test Case](#8-how-to-add-a-new-test-case)
9. [How to Add a New Page Object](#9-how-to-add-a-new-page-object)
10. [Locator Strategy — Which Selector to Use](#10-locator-strategy--which-selector-to-use)
11. [Test Tags Explained](#11-test-tags-explained)
12. [Troubleshooting Common Issues](#12-troubleshooting-common-issues)

---

## 1. What This Framework Does

This framework automatically tests the **SauceDemo web application** (a demo e-commerce site) using a tool called **Playwright**. Instead of a human manually clicking through the website to verify it works, this framework runs tests that do it automatically in seconds.

**What it tests:**
- Login page (valid login, invalid login, locked user, empty fields)
- Product Catalog page (add to cart, sort products, verify product details)
- Shopping Cart and Checkout flow (complete purchase, form validation)
- End-to-end purchase flow (login → add product → checkout → order confirmation)

**Total tests:** 13 web UI tests

---

## 2. Prerequisites — What You Need Before Starting

You do not need to know programming to run tests. You only need to install the tools below.

### 2.1 Node.js and npm

Node.js is the engine that runs JavaScript/TypeScript on your computer. npm is its package manager (comes bundled with Node.js automatically).

**Check if already installed:**
Open a terminal (Mac: press `Cmd + Space`, type `Terminal`; Windows: press `Win + R`, type `cmd`) and run:

```bash
node --version
npm --version
```

If you see version numbers (e.g. `v20.11.0` and `10.2.3`), Node.js is already installed. Skip to step 3.

**Install Node.js (if not installed):**

- **macOS:**
  ```bash
  brew install node
  ```
  (If `brew` is not found, first install Homebrew from https://brew.sh then run the above.)

- **Windows:**
  1. Go to https://nodejs.org
  2. Click the green button labelled **"LTS"** (Long Term Support — the stable version)
  3. Download and run the `.msi` installer
  4. Follow the installer steps (click Next → Next → Finish)
  5. Restart your terminal after installation

- **Linux (Ubuntu/Debian):**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

**Verify the installation worked:**
```bash
node --version    # Should print: v20.x.x or higher
npm --version     # Should print: 10.x.x or higher
```

### 2.2 Git (to clone the repository)

**Check if installed:**
```bash
git --version
```

**Install if not present:**
- **macOS:** `brew install git`
- **Windows:** Download from https://git-scm.com/download/win and install
- **Linux:** `sudo apt-get install git`

### 2.3 A Code Editor (optional — only if you want to read or edit files)

We recommend **Visual Studio Code** (free):
- Download from https://code.visualstudio.com
- After installing, open the project folder by going to `File → Open Folder`

---

## 3. Installation — Step by Step

Follow these steps **in order**. Do not skip any step.

### Step 1 — Get the project onto your computer

**Option A — Clone from GitHub (if the project is on GitHub):**
```bash
git clone <repository-url>
cd Playwright-e2e
```
Replace `<repository-url>` with the actual URL from GitHub.

**Option B — If you received a ZIP file:**
1. Unzip the file to a folder (e.g. your Desktop)
2. Open your terminal
3. Navigate to the folder:
   ```bash
   cd ~/Desktop/Playwright-e2e
   ```
   On Windows:
   ```bash
   cd C:\Users\YourName\Desktop\Playwright-e2e
   ```

### Step 2 — Install all project dependencies

This downloads all the libraries the framework needs (Playwright, TypeScript, etc.):

```bash
npm install
```

You will see output like `added 123 packages`. This is normal. Wait until it finishes (usually 30–60 seconds).

### Step 3 — Install the Chromium browser for Playwright

Playwright needs its own browser to run tests. Install it with:

```bash
npx playwright install chromium
```

You will see it downloading Chromium. Wait until it finishes.

**If you get a permissions error on Linux:**
```bash
npx playwright install chromium --with-deps
```

### Step 4 — Verify everything is working

Run this command to see if Playwright is correctly installed:

```bash
npx playwright --version
```

You should see something like: `Version 1.x.x`

### Step 5 — Create the auth storage directory

The framework needs a folder to save the login session:

```bash
mkdir -p storage-state
```

### Step 6 — Run a quick test to confirm setup is complete

```bash
npx playwright test --project=web --grep @sanity
```

You should see tests running and passing. If they pass, your setup is complete.

---

## 4. Project Structure Explained

Below is the folder layout and what each folder/file does:

```
Playwright-e2e/
│
├── src/
│   └── web/
│       ├── pages/                  ← Page Object files (one per page of the website)
│       │   ├── LoginPage.ts        ← Locators and actions for the Login page
│       │   ├── InventoryPage.ts    ← Locators and actions for the Products page
│       │   ├── CartPage.ts         ← Locators and actions for the Cart page
│       │   ├── CheckoutInfoPage.ts ← Locators and actions for the Checkout form
│       │   ├── CheckoutOverviewPage.ts ← Locators and actions for Order Summary
│       │   └── CheckoutCompletePage.ts ← Locators and actions for Confirmation page
│       │
│       └── fixtures/
│           ├── pages.fixture.ts    ← Injects page objects into tests automatically
│           ├── global-setup.ts     ← Logs in ONCE before all tests and saves session
│           └── global-teardown.ts  ← Cleans up auth session file after all tests
│
├── tests/
│   └── web/
│       ├── login/
│       │   └── login.spec.ts       ← All login test cases
│       ├── catalog/
│       │   └── catalog.spec.ts     ← All product catalog test cases
│       ├── cart/
│       │   └── cart.spec.ts        ← All cart/checkout test cases
│       └── e2e/
│           └── purchase-flow.e2e.spec.ts ← Full end-to-end purchase test
│
├── test-data/
│   └── web/
│       ├── users.ts                ← Usernames and passwords for test accounts
│       └── products.ts             ← Product names used in tests
│
├── storage-state/
│   └── auth.json                   ← Saved login session (auto-generated, do not edit)
│
├── playwright.config.ts            ← Main configuration file for Playwright
├── package.json                    ← Project metadata and npm scripts
└── tsconfig.json                   ← TypeScript configuration
```

---

## 5. How the Framework Works

### 5.1 The Login Problem — Solved Once

Every test on the products page, cart page, and checkout page requires the user to be logged in. If every test logged in manually, it would be slow and the login step would be tested unnecessarily in every test.

**Solution — Global Setup:**
Before any test runs, the file `src/web/fixtures/global-setup.ts` runs once. It:
1. Opens a browser
2. Logs in with the standard test user
3. Saves the login session (cookies) to `storage-state/auth.json`
4. Closes the browser

Every test then starts with that saved session — already logged in, no login step needed.

**Exception:** Login tests themselves (`login.spec.ts`) intentionally clear the saved session so they can test login from scratch.

### 5.2 Page Object Model (POM) — Why We Use It

Instead of writing `page.click('[data-test="checkout"]')` directly inside a test (which is hard to maintain), we create a class for each page:

```typescript
// src/web/pages/CartPage.ts
export class CartPage {
  readonly checkoutButton: Locator;   // ← Locator defined ONCE here

  constructor(private readonly page: Page) {
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();   // ← Action uses the locator
  }
}
```

In a test, you simply write:
```typescript
await cartPage.proceedToCheckout();
```

**Benefits:**
- If the button's selector changes, you update it in ONE place only (the page object), not in every test
- Tests read like plain English sentences
- No copy-pasting of selectors across test files

### 5.3 Fixtures — How Page Objects Get Into Tests

You never create page objects manually inside tests. The file `src/web/fixtures/pages.fixture.ts` creates them and injects them automatically:

```typescript
// In your test file — page objects appear as function parameters:
test('my test', async ({ loginPage, inventoryPage }) => {
  //                     ^ injected automatically by the fixture
});
```

### 5.4 Test Data — No Hardcoding

All test data (usernames, passwords, product names) lives in `test-data/web/`. Tests import from there:

```typescript
import { USERS } from '../../../test-data/web/users';

await loginPage.login(USERS.standard.username, USERS.standard.password);
```

If the test credentials ever change, you update `test-data/web/users.ts` in one place and all tests pick up the change automatically.

---

## 6. Running Tests — Every Command You Need

Open your terminal, navigate to the project folder, then run any of the commands below.

### 6.1 Run ALL web tests

```bash
npx playwright test --project=web
```

### 6.2 Run ONLY sanity tests (fast check — critical tests only)

These run before every pull request to ensure nothing is broken:

```bash
npx playwright test --project=web --grep @sanity
```

### 6.3 Run ONLY regression tests (full suite)

These run on every merge to main/develop and nightly:

```bash
npx playwright test --project=web --grep @regression
```

### 6.4 Run a specific spec file

**Login tests only:**
```bash
npx playwright test tests/web/login/login.spec.ts --project=web
```

**Product catalog tests only:**
```bash
npx playwright test tests/web/catalog/catalog.spec.ts --project=web
```

**Cart and checkout tests only:**
```bash
npx playwright test tests/web/cart/cart.spec.ts --project=web
```

**End-to-end purchase flow only:**
```bash
npx playwright test tests/web/e2e/purchase-flow.e2e.spec.ts --project=web
```

### 6.5 Run a single test by its title

```bash
npx playwright test --project=web --grep "TC_LOGIN_001"
```

Replace `TC_LOGIN_001` with any test case ID or part of the test title.

### 6.6 Run tests in HEADED mode (watch the browser)

By default tests run invisibly (headless). To see the browser opening and actions happening:

```bash
npx playwright test --project=web --headed
```

### 6.7 Run tests in DEBUG mode (step through one action at a time)

```bash
npx playwright test --project=web --debug
```

A browser and the Playwright Inspector tool will open. Use the green Play button to step through each action.

### 6.8 Run tests and open the HTML report immediately after

```bash
npx playwright test --project=web && npx playwright show-report
```

### 6.9 Open the HTML report from the last run (without re-running tests)

```bash
npx playwright show-report
```

### 6.10 Run tests with a specific number of retries

```bash
npx playwright test --project=web --retries=2
```

### 6.11 Run tests in parallel with a specific number of workers

```bash
npx playwright test --project=web --workers=4
```

### 6.12 Run only positive tests

```bash
npx playwright test --project=web --grep @positive
```

### 6.13 Run only negative tests

```bash
npx playwright test --project=web --grep @negative
```

### Summary Table

| Goal | Command |
|---|---|
| All web tests | `npx playwright test --project=web` |
| Sanity only | `npx playwright test --project=web --grep @sanity` |
| Regression only | `npx playwright test --project=web --grep @regression` |
| Login spec only | `npx playwright test tests/web/login/login.spec.ts --project=web` |
| Catalog spec only | `npx playwright test tests/web/catalog/catalog.spec.ts --project=web` |
| Cart spec only | `npx playwright test tests/web/cart/cart.spec.ts --project=web` |
| E2E spec only | `npx playwright test tests/web/e2e/purchase-flow.e2e.spec.ts --project=web` |
| One test by ID | `npx playwright test --project=web --grep "TC_LOGIN_001"` |
| See browser | Add `--headed` to any command |
| Step through | Add `--debug` to any command |
| Open report | `npx playwright show-report` |

---

## 7. Reading the HTML Test Report

After running tests, Playwright generates a visual HTML report.

**Open it:**
```bash
npx playwright show-report
```

This opens a browser tab showing:

- **Green rows** = tests that passed
- **Red rows** = tests that failed
- **Click any test** to expand it and see every step that ran
- **Failed tests** show a screenshot of what the page looked like when it failed
- **Videos** of failed tests (if `video: 'retain-on-failure'` is set — already configured)
- **Traces** of failed tests (click "Trace" to replay every action in slow motion)

**Where is the report saved?**
In the `playwright-report/` folder at the root of the project.

---

## 8. How to Add a New Test Case

Follow these steps every time you want to add a new automated test.

### Example: Adding a test to verify a product can be removed from the cart

---

**Step 1 — Decide which spec file the test belongs to**

This is a cart behaviour, so it belongs in `tests/web/cart/cart.spec.ts`.

---

**Step 2 — Check if the page object has everything you need**

Open `src/web/pages/CartPage.ts`. You need a locator for the Remove button. If it is not there, add it (see Section 9 for how to add to a page object).

Inspect the SauceDemo website in Chrome DevTools (Right-click → Inspect) to find the `data-test` attribute of the Remove button. For example, it might be `[data-test="remove-sauce-labs-backpack"]`.

---

**Step 3 — Add the test to the spec file**

Open `tests/web/cart/cart.spec.ts` and add your test inside the `test.describe` block:

```typescript
test('TC_CHECKOUT_004 — verify a product can be removed from the cart', { tag: ['@regression', '@positive'] }, async ({ inventoryPage, cartPage }) => {
  await test.step('Add a product to the cart from the inventory page', async () => {
    await inventoryPage.navigate();
    await inventoryPage.addProductToCart('sauce-labs-backpack');
  });

  await test.step('Go to the cart page', async () => {
    await inventoryPage.goToCart();
    await cartPage.expectOnPage();
  });

  await test.step('Remove the product from the cart', async () => {
    await cartPage.removeItem('sauce-labs-backpack');
  });

  await test.step('Verify the cart is now empty', async () => {
    await cartPage.expectCartEmpty();
  });
});
```

**Rules for the test ID (TC_CHECKOUT_004):**
- Use the same prefix as the other tests in the same file (`TC_CHECKOUT_` for cart tests)
- Increment the number from the last existing test

**Rules for the tag:**
- `@sanity` — only if this is a critical path test (e.g. the single most important cart test)
- `@regression` — always include this
- `@positive` — for tests that verify expected success behaviour
- `@negative` — for tests that verify error/rejection behaviour

---

**Step 4 — Add the `removeItem` method to `CartPage.ts` (if it doesn't exist)**

See Section 9 for how to add methods to a page object.

---

**Step 5 — Run the new test to verify it passes**

```bash
npx playwright test tests/web/cart/cart.spec.ts --project=web --headed --grep "TC_CHECKOUT_004"
```

The `--headed` flag opens the browser so you can watch the test run.

---

**Step 6 — Run the full cart suite to make sure you didn't break anything**

```bash
npx playwright test tests/web/cart/cart.spec.ts --project=web
```

All tests should still pass.

---

## 9. How to Add a New Page Object

Use this when you are testing a new page that does not yet have a page object file.

### Example: Adding a Page Object for a "Product Detail" page

---

**Step 1 — Create the file**

Create a new file: `src/web/pages/ProductDetailPage.ts`

---

**Step 2 — Write the page object class**

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailPage {
  // ── Section 1: Locators ────────────────────────────────────────────────
  // All locators are defined here in the constructor. NEVER inside methods.
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly addToCartButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(private readonly page: Page) {
    this.productName          = page.locator('[data-test="inventory-item-name"]');
    this.productPrice         = page.locator('[data-test="inventory-item-price"]');
    this.productDescription   = page.locator('[data-test="inventory-item-desc"]');
    this.addToCartButton      = page.locator('[data-test="add-to-cart"]');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
  }

  // ── Section 2: Actions ─────────────────────────────────────────────────
  // Actions perform UI operations. They do NOT contain expect() assertions.
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async goBackToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }

  // ── Section 3: Assertions ──────────────────────────────────────────────
  // Assertions verify the page state. They USE expect().
  async expectOnPage(): Promise<void> {
    await this.page.waitForURL('**/inventory-item.html**');
  }

  async expectProductNameVisible(): Promise<void> {
    await expect(this.productName).toBeVisible();
  }

  async expectProductName(name: string): Promise<void> {
    await expect(this.productName).toHaveText(name);
  }
}
```

**Locator rules (must follow):**
1. Always use `[data-test="..."]` attributes first (inspect the element in Chrome DevTools to find it)
2. If no `data-test` attribute exists, use `getByRole()` or `getByText()`
3. NEVER use CSS classes like `.product-title` — they break when styling changes
4. NEVER define locators inside methods — only inside the `constructor`

---

**Step 3 — Register the new page object in the fixture file**

Open `src/web/fixtures/pages.fixture.ts` and add:

```typescript
import { ProductDetailPage } from '../pages/ProductDetailPage';   // ← add import

type WebFixtures = {
  // ... existing types ...
  productDetailPage: ProductDetailPage;   // ← add the type
};

export const test = base.extend<WebFixtures>({
  // ... existing fixtures ...
  productDetailPage: async ({ page }, use) => {          // ← add the fixture
    await use(new ProductDetailPage(page));
  },
});
```

---

**Step 4 — Use it in a test**

```typescript
test('TC_DETAIL_001 — verify product detail page shows correct information', { tag: ['@regression', '@positive'] }, async ({ inventoryPage, productDetailPage }) => {
  await test.step('Click on a product to open its detail page', async () => {
    // ...
  });

  await test.step('Verify the product name is visible', async () => {
    await productDetailPage.expectProductNameVisible();
  });
});
```

---

## 10. Locator Strategy — Which Selector to Use

When finding an element on the page, use this priority order (always start from the top):

| Priority | Method | Example | When to use |
|---|---|---|---|
| 1 (Best) | `data-test` attribute | `[data-test="login-button"]` | Always try this first — inspect the element in DevTools |
| 2 | `data-testid` attribute | `[data-testid="submit"]` | If `data-test` is absent |
| 3 | ARIA role | `getByRole('button', { name: 'Login' })` | For semantic elements without test IDs |
| 4 | Label text | `getByLabel('Username')` | For form inputs with visible labels |
| 5 | Visible text | `getByText('Add to cart')` | For buttons or links with stable text |
| Never | CSS class | `.btn-primary` | Classes change with styling — breaks tests |
| Never | XPath | `//div//button` | Brittle and unreadable |
| Never | Position | `.nth(2)`, `.first()` | Position changes break tests |

**How to find the `data-test` value:**
1. Open SauceDemo in Chrome
2. Right-click the element you want to interact with
3. Select **Inspect**
4. Look for `data-test="..."` in the highlighted HTML
5. Copy the value and use it in your locator: `page.locator('[data-test="copied-value"]')`

---

## 11. Test Tags Explained

Every test must have at least one tag. Tags control which tests run in CI/CD.

| Tag | Meaning | When tests with this tag run |
|---|---|---|
| `@sanity` | Critical, must-pass tests (fastest feedback) | On every pull request (PR gate) |
| `@regression` | Full suite — all tests | On merge to main/develop, and nightly at 2 AM |
| `@positive` | Tests that verify expected success behaviour | For filtering and reporting only |
| `@negative` | Tests that verify error/rejection behaviour | For filtering and reporting only |

**A test can have multiple tags:**
```typescript
{ tag: ['@sanity', '@regression', '@positive'] }   // Sanity AND regression AND positive
{ tag: ['@regression', '@negative'] }               // Regression only AND negative
```

**Guideline — when to use `@sanity`:**
Only mark a test `@sanity` if it is the single most critical test for that feature. For login, only the "successful login" test is `@sanity`. Error cases are `@regression` only.

---

## 12. Troubleshooting Common Issues

### "Cannot find module" error when running tests

**Cause:** `npm install` was not run, or was incomplete.

**Fix:**
```bash
rm -rf node_modules
npm install
```

---

### "Browser not found" or "Executable doesn't exist" error

**Cause:** Playwright browsers were not installed.

**Fix:**
```bash
npx playwright install chromium
```

---

### Tests fail with "net::ERR_CONNECTION_REFUSED"

**Cause:** The application URL is wrong or the site is down.

**Fix:** Check that `https://www.saucedemo.com` is accessible in your browser. If it is a different environment, update `WEB_BASE_URL` in your environment:
```bash
WEB_BASE_URL=https://staging.saucedemo.com npx playwright test --project=web
```

---

### "storage-state/auth.json does not exist" error

**Cause:** The global setup failed to create the auth file.

**Fix:**
```bash
mkdir -p storage-state
npx playwright test --project=web
```

The global setup will re-create `auth.json` at the start of the next test run.

---

### Tests are flaky (pass sometimes, fail sometimes)

**Never add `page.waitForTimeout(2000)` to fix this.** That is a fake fix that makes tests slow and still unreliable.

**Real fixes:**
- Ensure assertions use `await expect(locator).toBeVisible()` — Playwright auto-retries these
- Ensure you are waiting for the page to load with `waitForURL()` before interacting
- Check that the locator is unique (not matching multiple elements)

---

### Test runs but I cannot see the browser

**Cause:** Tests run headless (invisible) by default.

**Fix:** Add `--headed` to your command:
```bash
npx playwright test --project=web --headed
```

---

### I changed test data but tests still use the old data

**Cause:** TypeScript might be using a cached build.

**Fix:**
```bash
npx playwright test --project=web
```

Playwright transpiles TypeScript fresh on every run — no build step needed.

---

