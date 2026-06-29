# CLAUDE.md — Framework Rules & Coding Standards

> These rules apply to ALL code generated or reviewed in this repository.  
> Read this file before writing any test, page object, service, or fixture.

---

## 1. Locator Strategy — Priority Order (Web Tests)

Always select locators in this exact priority order. Never skip to a lower priority when a higher one is available.

| Priority | Strategy | Example | Use When |
|---|---|---|---|
| 1 (Highest) | `data-test` attribute | `[data-test="login-button"]` | **Always prefer this first** |
| 2 | `data-testid` attribute | `[data-testid="submit"]` | When `data-test` is absent |
| 3 | `data-cy` / `data-qa` attributes | `[data-cy="username"]` | When above two are absent |
| 4 | ARIA role + accessible name | `getByRole('button', { name: 'Login' })` | For semantic elements without test IDs |
| 5 | ARIA label | `getByLabel('Username')` | For form inputs with labels |
| 6 | Placeholder text | `getByPlaceholder('Enter username')` | Only for inputs |
| 7 | Visible text | `getByText('Add to cart')` | Only for static text that won't change |
| **Never** | CSS class | `.btn-primary`, `.inventory_item` | Classes change with styling — fragile |
| **Never** | XPath | `//div[@class='...']//button` | Brittle, unreadable, maintenance nightmare |
| **Never** | DOM position | `nth-child(2)`, `.first()` | Position changes break tests |

### Rule: No Hallucinated Locators

- **Do NOT assume** a `data-test` attribute exists on an element without verifying it in the actual DOM.
- Before writing any locator, open the browser DevTools and inspect the element.
- If no `data-test` is present, use the next priority level.
- Never write a locator like `[data-test="submit-order"]` unless you have confirmed it exists.

---

## 2. Page Object Model (POM) — Structure Rules

### File Structure for Each Page

Every page object must follow this exact structure:

```typescript
// src/web/pages/LoginPage.ts

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  // Section 1: Locators — all readonly, all defined here, none in methods
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(private page: Page) {
    // Assign all locators in constructor — no locators defined inside methods
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton   = page.locator('[data-test="login-button"]');
    this.errorMessage  = page.locator('[data-test="error"]');
  }

  // Section 2: Actions — methods that perform UI operations
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText(): Promise<string> {
    return this.errorMessage.innerText();
  }

  // Section 3: Assertions — methods that assert page state
  // Prefer waitFor over arbitrary waits
  async expectOnInventoryPage(): Promise<void> {
    await this.page.waitForURL('**/inventory.html');
  }

  async expectErrorVisible(): Promise<void> {
    await this.errorMessage.waitFor({ state: 'visible' });
  }
}
```

### POM Rules

- **Locators go in the constructor only.** Never define a `page.locator()` inside an action method.
- **One class per page.** `LoginPage`, `InventoryPage`, `CartPage` — not one giant `Pages` class.
- **Methods are actions, not assertions.** Actions do things; they do not contain `expect()` calls. Assertions are separate methods or live in the test file.
- **Return `void` from action methods.** They perform actions, not queries.
- **Return values from query methods.** `getText()`, `getCount()`, `isVisible()` return typed values.
- **No hardcoded waits** (`page.waitForTimeout(2000)`). Use `waitFor`, `waitForURL`, or Playwright's auto-wait.
- **No raw `page.click()` in test files.** All interactions go through the POM method.

---

## 3. Assertion Rules — UI-First

### Always Assert the UI State, Not Just the Action

**Wrong approach (action without UI assertion):**
```typescript
// BAD — clicked the button but never verified what happened
await inventoryPage.addToCart('Sauce Labs Backpack');
```

**Correct approach (UI-first assertion):**
```typescript
// GOOD — action followed by immediate UI verification
await inventoryPage.addToCart('Sauce Labs Backpack');
await expect(inventoryPage.cartBadge).toHaveText('1');
await expect(inventoryPage.addToCartButton).toHaveText('Remove');
```

### Assertion Rules

- **Every action must be followed by an assertion** that verifies the UI reacted correctly.
- **Use Playwright's `expect()` assertions**, not raw boolean checks (`if`, `===`).
- **Prefer locator-based assertions** over value-based: `expect(locator).toBeVisible()` over `expect(await locator.isVisible()).toBe(true)`.
- **Assert the specific element, not the whole page.** Don't use `page.content()` and string-search.
- **Assert both the positive state AND the absence of the error state** (e.g., after successful login, assert both that inventory page is shown AND that no error message is visible).

### Preferred Playwright Assertions

```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();

// Text content
await expect(locator).toHaveText('Exact text');
await expect(locator).toContainText('partial text');

// Input value
await expect(locator).toHaveValue('input value');

// URL
await expect(page).toHaveURL(/inventory/);

// Count
await expect(locator).toHaveCount(3);

// Attribute
await expect(locator).toHaveAttribute('data-test', 'value');

// Enabled/Disabled
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
```

---

## 4. Test File Rules

### Test Structure Template

```typescript
import { test, expect } from '../fixtures/pages.fixture';
import { USERS } from '../../test-data/web/users';

test.describe('Login Module', () => {

  test('login with valid credentials', { tag: ['@sanity', '@regression'] }, async ({ loginPage, inventoryPage }) => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectOnPage();
    await expect(loginPage.errorMessage).toBeHidden();
  });

  test('login fails with invalid password', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.login(USERS.standard.username, 'wrong_password');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
  });

});
```

### Test Rules

- **One behaviour per test.** A test titled "login fails" tests exactly that — no extra cart steps.
- **Tests are independent.** No test relies on state left by another test. Use fixtures for shared setup.
- **No `page.waitForTimeout()`.** If you need to wait, you have a race condition — fix the root cause.
- **No hardcoded credentials in test files.** All test data comes from `test-data/`.
- **Descriptive test names.** Name reads as a sentence: `'login fails with invalid password'` not `'test2'`.
- **Tag every test.** Every `test()` must have `{ tag: '@sanity' }` or `{ tag: '@regression' }`. No untagged tests.

---

## 5. API Test Rules

### Service Layer Pattern

```typescript
// src/api/services/BookingService.ts
export class BookingService {
  constructor(private request: APIRequestContext, private baseURL: string) {}

  async createBooking(payload: Booking): Promise<CreateBookingResponse> {
    const response = await this.request.post(`${this.baseURL}/booking`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    });
    return response.json();
  }
}
```

### API Assertion Rules — Every Response Must Assert All Four

```typescript
// 1. Status code
expect(response.status()).toBe(200);

// 2. Response time (performance gate)
expect(response.headers()['x-response-time'] || Date.now() - start).toBeLessThan(3000);

// 3. Schema — every expected field must be present and the correct type
const body = await response.json();
expect(typeof body.bookingid).toBe('number');
expect(typeof body.booking.firstname).toBe('string');

// 4. Data integrity — what you sent is what you get back
expect(body.booking.firstname).toBe(payload.firstname);
expect(body.booking.totalprice).toBe(payload.totalprice);
```

### Cleanup Rule

Every API test that creates data must delete it. Use `afterEach` or fixture teardown:

```typescript
test.afterEach(async ({ bookingService, token }) => {
  if (createdBookingId) {
    await bookingService.deleteBooking(createdBookingId, token);
  }
});
```

---

## 6. Fixture Rules

### Auth Fixture (Web)

- Storage state (`storage-state/auth.json`) is created once per test run using `global-setup.ts`.
- Tests that require pre-login use `storageState` in the fixture — they do NOT log in manually.
- Login tests bypass this fixture — they test login directly using a fresh browser context.

### API Fixture

- Token is obtained once per test file via `beforeAll` or fixture scope `'worker'`.
- Token is injected into tests — tests do NOT call `POST /auth` themselves.
- Service instances (`BookingService`, `AuthService`) are created once and reused.

---

## 7. Test Data Rules

- All test data lives in `test-data/web/` or `test-data/api/`.
- **No hardcoded strings in test files** (no `'admin'`, `'password123'`, `'John'` inline in tests).
- Use `DataFactory` to generate randomised data for create/update operations — prevents state conflicts.
- Static reference data (user types, known product names) lives in constants files, not in tests.

```typescript
// test-data/web/users.ts
export const USERS = {
  standard:    { username: 'standard_user',          password: 'secret_sauce' },
  lockedOut:   { username: 'locked_out_user',         password: 'secret_sauce' },
  problem:     { username: 'problem_user',            password: 'secret_sauce' },
  performance: { username: 'performance_glitch_user', password: 'secret_sauce' },
};
```

---

## 8. Code Review Checklist

Before raising a PR or reviewing one, verify every item:

### Locators
- [ ] All locators use `data-test` (or next priority if unavailable — documented with a comment why)
- [ ] No class-based or XPath locators
- [ ] All locators defined in POM constructor, not inline in test files

### Page Objects
- [ ] Locators are `readonly` properties on the class
- [ ] Action methods contain only actions — no `expect()` calls
- [ ] No `waitForTimeout` anywhere in the file
- [ ] Page object file name matches class name exactly

### Tests
- [ ] Every test has a `{ tag: '@sanity' }` or `{ tag: '@regression' }` annotation
- [ ] Every action is followed by a UI assertion
- [ ] No test depends on another test's state
- [ ] Test data sourced from `test-data/` — no inline strings
- [ ] Test names are human-readable sentences

### API Tests
- [ ] Every response asserts status code, schema, and data integrity
- [ ] Created data is cleaned up in `afterEach`
- [ ] Token is obtained via fixture, not inside the test

### General
- [ ] No `console.log` left in code
- [ ] No `.only` or `.skip` committed (CI must run all tagged tests)
- [ ] TypeScript types are explicit — no `any`
- [ ] Imports are clean — no unused imports

---

## 9. Folder Conventions (Quick Reference)

```
src/web/pages/        → One class per page, named <PageName>Page.ts
src/web/components/   → Reusable parts (Header, ProductCard)
src/web/fixtures/     → Playwright fixtures that inject page objects
src/api/services/     → One class per API resource (BookingService, AuthService)
src/api/models/       → TypeScript interfaces for all request/response shapes
src/api/fixtures/     → Playwright fixtures that inject services + token
src/shared/config/    → Env-aware config (base URLs, credentials from env vars)
src/shared/utils/     → DataFactory, DateUtils
test-data/web/        → User constants, product constants
test-data/api/        → Valid and invalid payloads as constants
tests/web/            → Spec files only — no logic, just test steps
tests/api/            → Spec files only — no logic, just test steps
storage-state/        → auth.json (gitignored, generated at runtime)
```

---

## 10. What NOT to Do — Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|---|---|---|
| `page.locator('.btn-primary')` | CSS classes change with styling | Use `[data-test="..."]` |
| `page.waitForTimeout(3000)` | Flaky — arbitrary wait | Use `waitFor`, `waitForURL`, or Playwright auto-wait |
| Login in every test manually | Slow, brittle, tests login logic unintentionally | Use auth storage state fixture |
| `expect(await locator.isVisible()).toBe(true)` | Not retry-safe | Use `expect(locator).toBeVisible()` |
| `page.click('#some-id')` in test file | Bypasses POM | Call `page_object.methodName()` |
| `const data = { username: 'admin' }` inline in test | Hardcoded test data | Import from `test-data/` |
| `test.only(...)` committed | Skips all other tests in CI | Never commit `.only` |
| `any` type in TypeScript | Loses type safety | Define interfaces in `src/api/models/` |
| No tag on test | Test won't run in CI sanity/regression jobs | Tag every test `@sanity` or `@regression` |
