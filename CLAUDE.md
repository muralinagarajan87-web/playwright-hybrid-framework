# CLAUDE.md — Framework Rules & Coding Standards

> These rules apply to ALL code generated or reviewed in this repository.
> Read this file before writing any test, page object, service, or fixture.
> Every rule here was written because the wrong approach was found and fixed —
> there is a reason behind each one.

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

### Rule: Verify Locators in the Browser Before Writing Them

- **Do NOT assume** a `data-test` attribute exists. Open DevTools and inspect the element first.
- If no `data-test` is present, use the next priority and add a comment explaining why.
- The wrong selector `[data-test="cart-item"]` was found in production — it did not exist in the DOM.
  The real selector was `[data-test="inventory-item"]`. Always verify.

---

## 2. Page Object Model (POM) — Structure Rules

### File Structure for Each Page

Every page object must follow this exact structure:

```typescript
// src/web/pages/CartPage.ts

import { Page, Locator, expect } from '@playwright/test';
import { CartItemComponent } from '../components/CartItemComponent';

export class CartPage {
  // Section 1: Locators — all readonly, all defined in the constructor
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    // SauceDemo uses [data-test="inventory-item"] as the cart item wrapper.
    // [data-test="cart-item"] does not exist in the DOM — verified in DevTools.
    this.cartItems      = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  // Section 2: Actions — interact with the page, return void
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  // Section 3: Assertions — expectOnPage() MUST check the URL, not an element
  async expectOnPage(): Promise<void> {
    await this.page.waitForURL('**/cart.html');
  }

  async expectItemInCart(productName: string): Promise<void> {
    await new CartItemComponent(this.cartItems).expectProductVisible(productName);
  }
}
```

### POM Rules

- **Locators go in the constructor only.** Never define `page.locator()` inside an action method.
- **One class per page.** `LoginPage`, `InventoryPage`, `CartPage` — not one giant `Pages` class.
- **`expectOnPage()` MUST assert the URL** — use `waitForURL()` or `expect(page).toHaveURL(...)`.
  Never use element visibility to prove which page you are on — a button being visible does
  not prove you are on a specific page. This mistake was found and corrected in `LoginPage`.
- **Action methods do things — no `expect()` calls inside them.** Assertions are separate methods.
- **Return `void` from action methods.** They perform actions, not queries.
- **Return typed values from query methods.** `getText()`, `getCount()` return typed results.
- **No hardcoded waits** (`page.waitForTimeout(2000)`). Use `waitFor`, `waitForURL`, or Playwright's auto-wait.
- **No raw `page.click()` in test files.** All interactions go through POM methods.

### Shared Component Pattern

When the same locator strategy is needed on more than one page, extract it into a component
in `src/web/components/`. This eliminates duplication and ensures a rename is fixed in one place.

```typescript
// src/web/components/CartItemComponent.ts
import { Locator, expect } from '@playwright/test';

export class CartItemComponent {
  private readonly nameLocator: Locator;

  constructor(container: Locator) {
    // Scoped to the container — not a page-level search — prevents false matches
    this.nameLocator = container.locator('[data-test="inventory-item-name"]');
  }

  async expectProductVisible(productName: string): Promise<void> {
    await expect(this.nameLocator.filter({ hasText: productName })).toBeVisible();
  }

  // Returns the FIRST matched item only — name is intentional.
  // For multi-item assertions, use filter({ hasText }) on the locator directly.
  async getFirstProductName(): Promise<string> {
    return this.nameLocator.first().innerText();
  }
}
```

Both `CartPage` and `CheckoutOverviewPage` use `CartItemComponent`. If SauceDemo ever renames
`[data-test="inventory-item-name"]`, the fix is made in one file, not two.

---

## 3. Assertion Rules — Web Tests

### Every Action Must Be Followed by an Assertion

**Wrong (action without verification):**
```typescript
await inventoryPage.addProductToCart(PRODUCTS.backpack.dataTestId);
// test ends here — we never checked if the cart updated
```

**Correct (UI-first assertion):**
```typescript
await inventoryPage.addProductToCart(PRODUCTS.backpack.dataTestId);
await inventoryPage.expectCartCount('1');                          // badge updated
await inventoryPage.expectRemoveButtonVisible(PRODUCTS.backpack.dataTestId); // button changed
```

### Assertion Rules

- **Every action must be followed by an assertion** that verifies the UI reacted correctly.
- **Assert both the positive state AND the absence of the error state.**
  After successful login: assert inventory page is shown AND error message is hidden.
- **Negative tests must prove the user stayed where they are** — not just that an error appeared.
  After a failed login: assert `loginPage.expectOnPage()` (URL check) + error is visible.
- **Use Playwright's `expect()` — not raw boolean checks.**
  Wrong: `expect(await locator.isVisible()).toBe(true)` — not retry-safe.
  Correct: `expect(locator).toBeVisible()` — Playwright auto-retries this.

### Preferred Playwright Assertions

```typescript
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toHaveText('Exact text');
await expect(locator).toContainText('partial text');
await expect(locator).toHaveValue('input value');
await expect(page).toHaveURL(/inventory/);
await expect(locator).toHaveCount(3);
await expect(locator).toHaveAttribute('data-test', 'value');
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
```

---

## 4. Test File Rules

### Test Structure Template

```typescript
import { test, expect } from '../../../src/web/fixtures/pages.fixture';
import { USERS } from '../../../test-data/web/users';

test.describe('Login Module', () => {

  test('TC_LOGIN_001 — verify successful login with valid credentials',
    { tag: ['@sanity', '@regression', '@positive'] },
    async ({ loginPage, inventoryPage }) => {

    await test.step('Enter credentials and click Login', async () => {
      await loginPage.login(USERS.standard.username, USERS.standard.password);
    });

    await test.step('Verify inventory page is shown and no error is visible', async () => {
      await inventoryPage.expectOnPage();
      await loginPage.expectNoError();
    });
  });

});
```

### Test Rules

- **One behaviour per test.** A test titled "login fails" tests exactly that — nothing else.
- **Tests are fully independent.** No test relies on state left by another test.
- **No `page.waitForTimeout()`.** If you need to wait, you have a root cause to fix.
- **No hardcoded credentials or strings in test files.** Everything comes from `test-data/`.
- **Descriptive test IDs and names.** Format: `TC_MODULE_NNN — sentence describing the behaviour`.
- **Tag every test** with `@sanity` or `@regression` AND `@positive` or `@negative`. No untagged tests.
- **Wrap steps in `test.step()`** so the Playwright HTML report shows a readable execution trace.

---

## 5. API Service Layer Architecture

### Layer Overview

```
BaseService (abstract base class in src/api/services/BaseService.ts)
├── ServiceResponse<T>    — { response, body: T, durationMs }
├── RawServiceResponse    — { response, durationMs }  (no body — DELETE, 4xx paths)
├── protected jsonHeaders — { 'Content-Type': 'application/json', Accept: 'application/json' }
├── protected measureResponse(fn)  — wraps any API call, returns response + timing
└── protected parseResponse<T>()   — throws immediately on non-success (new methods only)

BookingService extends BaseService
├── setAuthToken(token)        — injects token once; tests never pass it per-call
├── private getAuthHeaders()   — builds Cookie header; throws if token not set
├── getAllBookings(filters?)    → ServiceResponse<BookingId[]>
├── getBookingById(id)         → ServiceResponse<Booking>
├── createBooking(payload)     → ServiceResponse<CreateBookingResponse>
├── updateBooking(id, payload) → ServiceResponse<Booking>           [authenticated]
├── updateBookingWithoutAuth   → RawServiceResponse                 [negative test]
├── partialUpdateBooking       → ServiceResponse<Booking>           [authenticated]
├── deleteBooking(id)          → RawServiceResponse                 [authenticated]
└── deleteBookingWithoutAuth   → RawServiceResponse                 [negative test]

AuthService extends BaseService
└── createTokenRaw(credentials: Record<string, unknown>)
    → ServiceResponse<Record<string, unknown>>
    [accepts loose types intentionally — negative tests pass invalid credential shapes]
```

### BaseService — What Every Service Inherits

```typescript
// src/api/services/BaseService.ts

export interface ServiceResponse<T> {
  response: APIResponse;
  body: T;
  durationMs: number;
}

export interface RawServiceResponse {
  response: APIResponse;
  durationMs: number;
}

export class BaseService {
  protected readonly jsonHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  } as const;

  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string
  ) {}

  protected async measureResponse(fn: () => Promise<APIResponse>) {
    const start = Date.now();
    const response = await fn();
    return { response, durationMs: Date.now() - start };
  }

  // Use for NEW methods where the caller always expects success.
  // Throws with HTTP status + truncated body on non-success.
  protected async parseResponse<T>(response: APIResponse, successStatus = 200): Promise<T> {
    if (response.status() === successStatus) return response.json() as Promise<T>;
    const raw  = await response.text();
    const body = raw.length > 500 ? `${raw.substring(0, 500)}…` : raw;
    throw new Error(`API [${response.status()} ${response.statusText()}] — ${body}`);
  }
}
```

### Authentication Pattern — Token Is a Service-Layer Concern

The auth token is **never passed as a parameter** to individual service methods.
It is injected ONCE at fixture setup time via `setAuthToken()` and stored on the instance.

```typescript
// In the fixture (not in the test):
bookingService: async ({ request, token }, use) => {
  const service = new BookingService(request, API_CONFIG.baseUrl);
  service.setAuthToken(token);   // injected once here
  await use(service);
},

// In BookingService:
private getAuthHeaders(): Record<string, string> {
  if (!this.authToken) throw new Error('Token not set — call setAuthToken() first');
  return { ...this.jsonHeaders, Cookie: `token=${this.authToken}` };
}

// In the test — no token parameter anywhere:
const { response, body } = await bookingService.updateBooking(bookingId, payload);
```

Why: if you ever need to rotate, scope, or refresh the token, you change ONE fixture line,
not every test that calls a mutating operation.

### Two Body-Handling Patterns — Both Are Intentional

**`parseResponse<T>()`** — use in methods that only have positive-path tests.
Throws immediately on non-success so the caller always receives a fully typed body.

**Conditional `{} as T`** — use in methods that have negative test cases that inspect
`response.status()` directly (e.g. `getBookingById` for TC_GET_004 which expects 404,
`createBooking` for TC_CREATE_003 which expects 500). These tests must NOT throw — they
need the raw `response` object to assert the error status code.

This is a documented design decision, not incomplete code.

---

## 6. API Test Rules — 8-Layer Assertion Model

Every API test asserts across all applicable layers. The layers run in this order:

| Layer | What It Catches | Example |
|---|---|---|
| **L1 — Request schema + rules** | Our own test data is wrong before it reaches the API | `assertSchema(bookingRequestSchema, payload)` + `assertDateOrder(checkin, checkout)` |
| **L2 — Status code** | API rejected or misrouted the request | `expect(response.status()).toBe(200)` |
| **L3 — Response time** | Performance regression, cold-start degradation | `expect(durationMs).toBeLessThan(5000)` |
| **L4 — Response schema (AJV)** | API renamed a field, changed a type, added/removed required fields | `assertSchema(bookingSchema, body)` |
| **L5 — Business rules** | Date logic broken, domain invariants violated | `assertDateOrder(body.bookingdates.checkin, body.bookingdates.checkout)` |
| **L6 — Persistence / idempotency / security** | Data written to memory but not DB; GET mutates state; auth bypass | Independent GET after POST; calling GET twice returns identical data |
| **L7 — Data integrity** | Field silently truncated, transformed, or dropped | `expect(body.firstname).toBe(payload.firstname)` for every sent field |
| **L8 — HTTP headers** | Server returned HTML error page with 200; wrong content type | `expect(response.headers()['content-type']).toContain('application/json')` |

### L1 — Always Validate Both Structure AND Business Rules on the Request

```typescript
// Wrong — L1 only validates structure, not date logic
assertSchema(bookingRequestSchema, payload);

// Correct — L1 validates both structure AND business rules
assertSchema(bookingRequestSchema, payload);
assertDateOrder(payload.bookingdates.checkin, payload.bookingdates.checkout);
```

Why: if the request payload has bad dates, the failure message should say "your test data has bad dates",
not "the API returned bad dates". L1 catches test-data bugs at the source.

### L6 — Persistence Verification Is Not the Same as Checking the Create Response

After `POST /booking` returns 200, make a separate `GET /booking/{id}` call:

```typescript
// Phase 1 — API layer: did the request succeed?
const { response, body } = await bookingService.createBooking(payload);
expect(response.status()).toBe(200);

// Phase 2 — Storage layer: was the data actually written?
// A buggy API can return 200 and echo back data it never saved to the database.
const { response: verifyRes, body: verifyBody } = await bookingService.getBookingById(body.bookingid);
expect(verifyRes.status()).toBe(200);   // this is a DIFFERENT call to a DIFFERENT endpoint
expect(verifyBody.firstname).toBe(payload.firstname);
```

The status 200 at phase 1 and status 200 at phase 2 are testing two different truths.
Removing phase 2 leaves a gap where silent DB failures would never be caught.

### Full Test Example

```typescript
test('TC_CREATE_001 — verify a new booking is created with all fields',
  { tag: ['@sanity', '@regression', '@positive'] },
  async ({ bookingService, bookingCleanup }) => {

  const payload = BOOKING_PAYLOADS.complete;

  // L1 — Request schema + business rule validation (our data, before the network call)
  assertSchema(bookingRequestSchema, payload);
  assertDateOrder(payload.bookingdates.checkin, payload.bookingdates.checkout);

  const { response, body, durationMs } = await bookingService.createBooking(payload);

  // Register for teardown BEFORE assertions — cleanup runs even if assertions fail
  bookingCleanup(body.bookingid);

  expect(response.status()).toBe(200);                                    // L2
  expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);     // L3
  assertSchema(createBookingResponseSchema, body);                        // L4
  assertDateOrder(body.booking.bookingdates.checkin,
                  body.booking.bookingdates.checkout);                    // L5
  expect(body.booking.firstname).toBe(payload.firstname);                // L7
  expect(body.booking.totalprice).toBe(payload.totalprice);              // L7
  expect(response.headers()['content-type']).toContain('application/json'); // L8

  // L6 — Persistence verification: independent GET proves data was saved, not just echoed
  const { response: verifyRes, body: verifyBody } =
    await bookingService.getBookingById(body.bookingid);
  expect(verifyRes.status()).toBe(200);
  expect(verifyBody.firstname).toBe(payload.firstname);
});
```

### AJV Schema Validation

Use AJV (JSON Schema) to validate response shapes — not manual `typeof` checks.

```typescript
// Wrong — manual, incomplete, misses nested fields
expect(typeof body.bookingid).toBe('number');
expect(typeof body.booking.firstname).toBe('string');

// Correct — AJV validates every field, type, format, and required constraint in one call
assertSchema(createBookingResponseSchema, body);
```

Schemas live in `src/api/models/schemas/booking.schemas.ts`. The `assertSchema()` function
compiles each schema once (WeakMap cache) and reuses the compiled validator — compile is expensive,
so this matters when the same schema is used across multiple tests.

---

## 7. Fixture Rules

### Web Auth Fixture

`storage-state/auth.json` is created once per run in `global-setup.ts`.
Tests that need a pre-logged-in session use `storageState` in the fixture — they do NOT log in manually.
Login tests (`login.spec.ts`) bypass this by resetting to `{ cookies: [], origins: [] }`.

`global-setup.ts` must:
1. Be wrapped in `try/finally` so `browser.close()` always runs — without this, a failed login leaves a zombie Chromium process in CI.
2. Validate login succeeded by checking `[data-test="shopping-cart-link"]` is visible.
3. Validate `auth.json` was written and contains cookies — an empty file means every pre-auth test fails silently.

### API Fixture — Two-Tier Scoping

```typescript
// Worker-scoped: one token per parallel worker, shared across all tests in that worker.
// Token must be obtained using playwright.request (worker-scoped built-in) —
// NOT from the test-scoped `request` fixture, which would cause a TypeScript scope error.
token: [async ({ playwright }, use) => {
  const context = await playwright.request.newContext({ baseURL: API_CONFIG.baseUrl });
  const response = await context.post('/auth', { data: AUTH_CREDENTIALS.valid });
  const body = await response.json() as { token: string };
  await context.dispose();
  await use(body.token);
}, { scope: 'worker' }],

// Test-scoped: fresh service per test, token injected at setup — not per-call
bookingService: async ({ request, token }, use) => {
  const service = new BookingService(request, API_CONFIG.baseUrl);
  service.setAuthToken(token);
  await use(service);
},
```

### bookingCleanup Fixture — Registration Pattern

`bookingCleanup` is a **registration function**, not an afterEach hook.
Call it immediately after creating a booking, before any assertions.
The fixture teardown deletes all registered IDs once the test ends — pass or fail.

```typescript
// In the test — register before asserting:
const { response, body } = await bookingService.createBooking(payload);
bookingCleanup(body.bookingid);   // ← register here, before any expect()
expect(response.status()).toBe(200);

// In the fixture — teardown after the test completes:
bookingCleanup: async ({ bookingService }, use) => {
  const registeredIds: number[] = [];
  await use((id: number) => { if (id > 0) registeredIds.push(id); });

  // Log but do not throw — throwing here would mask the real test failure
  const failedIds: number[] = [];
  for (const id of registeredIds) {
    try { await bookingService.deleteBooking(id); }
    catch { failedIds.push(id); }
  }
  if (failedIds.length > 0) {
    console.warn(`⚠ Cleanup: ${failedIds.length} booking(s) failed to delete — IDs: ${failedIds.join(', ')}`);
  }
},
```

Why register before asserting: if an assertion throws, the cleanup still runs.
Why log and not throw: if cleanup fails, the test already has its result — throwing here would
overwrite the real failure with a cleanup error, making diagnosis harder.

---

## 8. Test Data Rules

### Valid vs Invalid Payloads — Keep Them Separate

```typescript
// test-data/api/bookings.ts

// BOOKING_PAYLOADS — all satisfy the Booking TypeScript contract fully
export const BOOKING_PAYLOADS = {
  complete: { firstname: 'James', ... } satisfies Booking,
  updatePayload: { firstname: 'Updated', ... } satisfies Booking,
  patchPayload: { firstname: 'Patched', totalprice: 750 } satisfies Partial<Booking>,
};

// INVALID_BOOKING_PAYLOADS — intentionally malformed; kept separate so BOOKING_PAYLOADS
// remains a clean set that TypeScript fully validates.
// The `as unknown as Booking` cast is visible HERE, in test-data — not buried in test files.
export const INVALID_BOOKING_PAYLOADS = {
  missingFirstname: {
    _description: 'Missing required firstname — exercises API input validation (TC_CREATE_003)',
    data: { lastname: 'Brown', totalprice: 150, ... } as unknown as Booking,
  },
};
```

Never put invalid payloads inside `BOOKING_PAYLOADS`. The type cast (`as unknown as Booking`)
documents the intentional misuse and should be visible to anyone reading the test-data file.

### DataFactory — Always Use UTC Dates

```typescript
// Wrong — mixes local setDate() with UTC toISOString()
// Near midnight in UTC+X timezones, futureDate(1) returns the same date as futureDate(0)
static futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];   // BUG: timezone mismatch
}

// Correct — all arithmetic in UTC
static futureDate(daysFromNow: number): string {
  const now = new Date();
  const utc = Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysFromNow
  );
  return new Date(utc).toISOString().split('T')[0];
}
```

### Other Data Rules

- All test data lives in `test-data/web/` or `test-data/api/`. No hardcoded strings in test files.
- `DataFactory.createBookingPayload()` generates random data — prevents parallel tests from colliding on name filters.
- Static reference data (usernames, product names) lives in constants files (`users.ts`, `products.ts`).
- Auth credentials all live in `test-data/api/auth.ts` — not duplicated in `config.ts`.

---

## 9. TypeScript Rules

These rules apply to all files in `src/` and `test-data/`.

### Never Use `any` or `object`

```typescript
// Wrong — defeats TypeScript entirely
async createTokenRaw(credentials: object): Promise<any>

// Wrong — still too loose
async createTokenRaw(credentials: object): Promise<Record<string, any>>

// Correct — semantically intentional, accepts all valid shapes
async createTokenRaw(credentials: Record<string, unknown>): Promise<ServiceResponse<Record<string, unknown>>>
```

`object` accepts literally anything that is not a primitive. `Record<string, unknown>` accepts
any object with string keys, which is what you actually mean for loose API credentials.

### Use Named Interfaces — No Inline Return Types

```typescript
// Wrong — duplicates ServiceResponse<T> shape as an inline anonymous type
async createTokenRaw(): Promise<{ response: APIResponse; body: Record<string, unknown>; durationMs: number }>

// Correct — uses the named interface from BaseService
async createTokenRaw(): Promise<ServiceResponse<Record<string, unknown>>>
```

### No Dead Code

Remove unused types, methods, and imports immediately. Dead code misleads developers:
- An unused `createToken()` method implies there are two ways to get a token.
- An unused `AuthResponse` union type implies it is used in validation somewhere.
- An unused import implies the module is needed.

Run `npx tsc --noEmit` to catch unused imports (TS6133 rule is enabled).

### No Type Casts That Bypass Undefined Safety

```typescript
// Wrong — if filters has optional undefined fields, they become the string "undefined" in the URL
new URLSearchParams(filters as Record<string, string>).toString()

// Correct — strip undefined values before building the query string
new URLSearchParams(
  Object.entries(filters).filter((e): e is [string, string] => e[1] !== undefined)
).toString()
```

---

## 10. Code Review Checklist

Before raising a PR or reviewing one, verify every item:

### Web — Locators
- [ ] All locators use `data-test` (or next priority with a comment explaining why)
- [ ] Locator was verified to exist in the DOM via DevTools — not assumed
- [ ] No class-based or XPath locators anywhere
- [ ] All locators defined in the constructor, not inside action methods

### Web — Page Objects
- [ ] `expectOnPage()` asserts URL via `waitForURL()` or `toHaveURL()` — NOT element visibility
- [ ] Locators that appear on multiple pages live in a shared component in `src/web/components/`
- [ ] Locators are `readonly` properties
- [ ] Action methods contain only actions — no `expect()` calls
- [ ] No `waitForTimeout` anywhere

### Web — Tests
- [ ] Every action is followed by a UI assertion
- [ ] Negative tests assert both error visible AND user stayed on current page (URL check)
- [ ] Tests are wrapped in `test.step()` for readable HTML reports
- [ ] Tagged with `@sanity`/`@regression` AND `@positive`/`@negative`
- [ ] No test depends on another test's state

### API — Service Layer
- [ ] All service methods return `ServiceResponse<T>` or `RawServiceResponse` — no inline return types
- [ ] All authenticated methods use `getAuthHeaders()` — no inline `Cookie` header construction
- [ ] Token is set via `setAuthToken()` — never passed as a method parameter
- [ ] Parameter types use `Record<string, unknown>` for loose shapes — never `object` or `any`
- [ ] `URLSearchParams` is built from filtered entries — no undefined values in query strings

### API — Tests
- [ ] L1: `assertSchema()` AND `assertDateOrder()` called on every request payload that has dates
- [ ] L2: Status code asserted
- [ ] L3: `durationMs < API_CONFIG.responseTimeThreshold` asserted
- [ ] L4: `assertSchema()` called on every response body
- [ ] L5: `assertDateOrder()` called on every response body that has booking dates
- [ ] L6: Persistence verification (independent GET after every POST/PUT) on positive tests
- [ ] L7: Every field we sent is compared back from the response
- [ ] L8: `content-type` header asserted
- [ ] `bookingCleanup(id)` called immediately after `createBooking`, before any assertion
- [ ] No test in a negative path calls `bookingCleanup` with a non-created resource

### TypeScript — All Files
- [ ] No `any`, no `object` — explicit interfaces or `Record<string, unknown>`
- [ ] No unused types, methods, or imports
- [ ] No inline return types when a named interface exists (`ServiceResponse<T>`)
- [ ] `npx tsc --noEmit` returns zero errors before every commit

### General
- [ ] No `console.log` left in code (cleanup warnings use `console.warn`)
- [ ] No `.only` or `.skip` committed
- [ ] Environment variables are in `.env.example` if a new one is added

---

## 11. Folder Conventions (Quick Reference)

```
src/web/pages/           → One class per page: <PageName>Page.ts
src/web/components/      → Shared locator components: <Name>Component.ts
src/web/fixtures/        → pages.fixture.ts, global-setup.ts, global-teardown.ts
src/api/services/        → BaseService.ts, BookingService.ts, AuthService.ts
src/api/models/          → TypeScript interfaces: Booking.ts, Auth.ts
src/api/models/schemas/  → AJV schemas + assertSchema() + assertDateOrder()
src/api/fixtures/        → api.fixture.ts (token, bookingService, bookingCleanup)
src/shared/config/       → config.ts (API_CONFIG, WEB_CONFIG — reads env vars)
src/shared/utils/        → DataFactory.ts
test-data/web/           → users.ts, products.ts, checkout.ts
test-data/api/           → bookings.ts (BOOKING_PAYLOADS, INVALID_BOOKING_PAYLOADS), auth.ts
tests/web/               → Spec files only — no logic, just test steps
tests/api/               → Spec files only — no logic, just test steps
storage-state/           → auth.json (gitignored, generated by global-setup at runtime)
.env.example             → Documents every environment variable the framework reads
```

---

## 12. What NOT to Do — Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|---|---|---|
| `page.locator('.btn-primary')` | CSS classes change with styling | `[data-test="..."]` |
| `page.waitForTimeout(3000)` | Flaky — arbitrary wait | `waitFor`, `waitForURL`, Playwright auto-wait |
| Login in every test manually | Slow; unintentionally tests login logic | Auth storage state fixture |
| `expect(await locator.isVisible()).toBe(true)` | Not retry-safe | `expect(locator).toBeVisible()` |
| `page.click('#id')` in test file | Bypasses POM | `pageObject.methodName()` |
| Hardcoded strings in test files | Breaks if data changes; hard to maintain | Import from `test-data/` |
| `expectOnPage()` checks element visibility | Does not prove which page you are on | `waitForURL()` or `toHaveURL()` |
| `test.only(...)` committed | All other tests skip in CI | Never commit `.only` |
| `any` or `object` TypeScript types | Loses type safety; misleads readers | Named interfaces or `Record<string, unknown>` |
| Inline return type instead of `ServiceResponse<T>` | Duplicates the interface shape | Use the named interface |
| `new URLSearchParams(filters as Record<string, string>)` | Serializes undefined as the string "undefined" | Filter with `Object.entries().filter()` first |
| Passing `token` as a method parameter | Auth is a service-layer concern; leaks into every test | `setAuthToken()` in the fixture |
| Invalid test data inside `BOOKING_PAYLOADS` | TypeScript treats it as valid; confuses maintainers | `INVALID_BOOKING_PAYLOADS` with `_description` |
| `afterEach` for API cleanup | Cleanup ID not accessible if test setup fails | `bookingCleanup` registration pattern |
| No `try/finally` in global-setup | Browser process hangs in CI on login failure | `let browser; try {...} finally { browser?.close() }` |
| `new Date() + setDate() + toISOString()` for future dates | UTC/local timezone mismatch corrupts dates near midnight | Use `Date.UTC()` throughout |
| Dead methods, types, or imports | Misleads developers about available code paths | Remove immediately |
