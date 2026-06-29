# Playwright Hybrid Automation Framework

A production-grade test automation framework covering **Web UI** and **API** testing, built with **Playwright** and **TypeScript**. Designed for scalability, readability, and zero flakiness.

---

## What This Framework Tests

| Domain | Application | Tests |
|---|---|---|
| Web UI | [SauceDemo](https://www.saucedemo.com) — e-commerce demo | 13 tests across Login, Catalog, Cart, Checkout, E2E |
| API | [Restful-Booker](https://restful-booker.herokuapp.com) — hotel booking REST API | 18 tests across Auth, GET, POST, PUT, PATCH, DELETE, E2E lifecycle |

**Total: 31 automated tests**

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Playwright](https://playwright.dev) | Latest | Browser automation + API testing |
| [TypeScript](https://www.typescriptlang.org) | 5.x | Type-safe test code |
| [Node.js](https://nodejs.org) | 20 LTS | Runtime |
| [GitHub Actions](https://github.com/features/actions) | — | CI/CD pipeline |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/muralinagarajan87-web/playwright-hybrid-framework.git
cd playwright-hybrid-framework

# 2. Install dependencies
npm install

# 3. Install Chromium browser (web tests only)
npx playwright install chromium

# 4. Run all tests
npx playwright test

# 5. Open the HTML report
npx playwright show-report
```

---

## Run Tests

### Web UI Tests

```bash
# All web tests
npx playwright test --project=web

# Sanity only (runs on every PR)
npx playwright test --project=web --grep @sanity

# Regression only (runs on merge + nightly)
npx playwright test --project=web --grep @regression

# Specific spec file
npx playwright test tests/web/login/login.spec.ts --project=web
npx playwright test tests/web/catalog/catalog.spec.ts --project=web
npx playwright test tests/web/cart/cart.spec.ts --project=web
npx playwright test tests/web/e2e/purchase-flow.e2e.spec.ts --project=web

# Watch the browser
npx playwright test --project=web --headed
```

### API Tests

```bash
# All API tests
npx playwright test --project=api

# Sanity only
npx playwright test --project=api --grep @sanity

# Regression only
npx playwright test --project=api --grep @regression

# Specific spec file
npx playwright test tests/api/auth/auth.spec.ts --project=api
npx playwright test tests/api/bookings/get-bookings.spec.ts --project=api
npx playwright test tests/api/bookings/create-update.spec.ts --project=api
npx playwright test tests/api/bookings/delete-booking.spec.ts --project=api
npx playwright test tests/api/e2e/booking-lifecycle.e2e.spec.ts --project=api
```

---

## Project Structure

```
├── src/
│   ├── web/
│   │   ├── pages/          # Page Object Model classes
│   │   └── fixtures/       # Playwright fixtures + global setup/teardown
│   ├── api/
│   │   ├── services/       # Service layer (AuthService, BookingService)
│   │   ├── models/         # TypeScript interfaces for API contracts
│   │   └── fixtures/       # API fixtures with automatic cleanup
│   └── shared/
│       ├── config/         # Environment-aware configuration
│       └── utils/          # DataFactory for test data generation
│
├── tests/
│   ├── web/                # Web spec files
│   └── api/                # API spec files
│
├── test-data/
│   ├── web/                # User accounts, product constants
│   └── api/                # Booking payloads, auth credentials
│
├── .github/workflows/      # CI/CD pipelines
│   ├── web-tests.yml       # Web sanity (PR) + regression (merge/nightly)
│   └── api-tests.yml       # API sanity (PR) + regression (merge/nightly)
│
├── WEB_AUTOMATION_GUIDE.md # Complete web automation onboarding guide
├── API_AUTOMATION_GUIDE.md # Complete API automation onboarding guide
└── playwright.config.ts    # Playwright configuration
```

---

## CI/CD Pipeline

| Event | Web | API |
|---|---|---|
| Pull Request | Sanity tests (`@sanity`) | Sanity tests (`@sanity`) |
| Merge to `main` or `develop` | Regression tests (`@regression`) | Regression tests (`@regression`) |
| Nightly at 02:00 UTC | Regression tests (`@regression`) | Regression tests (`@regression`) |
| Manual dispatch | Both sanity + regression | Both sanity + regression |

---

## Framework Highlights

### Web UI
- **Page Object Model** — locators defined once in constructors, never inline in tests
- **Global auth setup** — logs in once, shares session across all tests via `storageState`
- **UI-first assertions** — every action followed by a UI state verification
- **`test.step()`** — every test step is labeled in the HTML report
- **`data-test` attributes** — all locators use stable test-specific attributes

### API
- **8-layer validation** — status code, response time, schema, contract, business logic, data integrity, headers, persistence
- **Fixture-based teardown** — `bookingCleanup` auto-deletes test data after every test
- **Persistence verification** — GET after every POST/PUT to prove data was actually stored
- **DataFactory** — random payloads prevent test pollution in parallel runs
- **TypeScript models** — compile-time request schema validation via interfaces

---

## Detailed Guides

For complete baby-step onboarding documentation:

- [Web Automation Guide](WEB_AUTOMATION_GUIDE.md) — prerequisites, installation, how to add tests, locator strategy, troubleshooting
- [API Automation Guide](API_AUTOMATION_GUIDE.md) — prerequisites, installation, service layer, 8 validation layers, teardown, troubleshooting

---

## Test Coverage

### Web UI (13 tests)

| Test ID | Description | Tags |
|---|---|---|
| TC_LOGIN_001 | Successful login with valid credentials | `@sanity @regression @positive` |
| TC_LOGIN_002 | Login fails with invalid password | `@sanity @regression @negative` |
| TC_LOGIN_003 | Locked-out user is blocked | `@regression @negative` |
| TC_LOGIN_004 | Validation error when username is empty | `@regression @negative` |
| TC_LOGIN_005 | Validation error when password is empty | `@regression @negative` |
| TC_CAT_001 | Add product to cart | `@sanity @regression @positive` |
| TC_CAT_002 | Add multiple products independently | `@regression @positive` |
| TC_CAT_003 | Cart badge hidden when no products added | `@regression @negative` |
| TC_CAT_004 | Product details displayed correctly | `@regression @positive` |
| TC_CHECKOUT_001 | Complete full checkout flow | `@sanity @regression @positive` |
| TC_CHECKOUT_002 | Checkout form validation — all fields empty | `@regression @negative` |
| TC_CHECKOUT_003 | Checkout form validation — postal code missing | `@regression @negative` |
| TC_E2E_WEB_001 | Full purchase flow login to confirmation | `@sanity @regression @positive` |

### API (18 tests)

| Test ID | Description | Tags |
|---|---|---|
| TC_AUTH_001 | Valid token returned with correct credentials | `@sanity @regression @positive` |
| TC_AUTH_002 | Auth rejected with invalid password | `@sanity @regression @negative` |
| TC_AUTH_003 | Auth rejected when username field is missing | `@regression @negative` |
| TC_AUTH_004 | Empty request body handled without crash | `@regression @negative` |
| TC_GET_001 | Returns list of all booking IDs | `@sanity @regression @positive` |
| TC_GET_002 | Returns complete booking details by ID | `@sanity @regression @positive` |
| TC_GET_003 | Returns filtered bookings by firstname | `@regression @positive` |
| TC_GET_004 | Returns 404 for non-existent booking ID | `@regression @negative` |
| TC_CREATE_001 | New booking created with all fields | `@sanity @regression @positive` |
| TC_CREATE_002 | Booking created without optional field | `@regression @positive` |
| TC_CREATE_003 | Booking rejected when firstname is missing | `@regression @negative` |
| TC_UPDATE_001 | Full booking update via PUT | `@regression @positive` |
| TC_UPDATE_002 | PUT rejected without auth token | `@regression @negative` |
| TC_UPDATE_003 | Partial booking update via PATCH | `@regression @positive` |
| TC_DELETE_001 | Booking deleted with valid auth token | `@sanity @regression @positive` |
| TC_DELETE_002 | Delete rejected without auth token | `@regression @negative` |
| TC_DELETE_003 | Returns 405 for non-existent booking ID | `@regression @negative` |
| TC_E2E_API_001 | Full lifecycle: create → verify → update → verify → delete → confirm | `@sanity @regression @positive` |

---

## Author

Murali Nagarajan | Lead SDET
