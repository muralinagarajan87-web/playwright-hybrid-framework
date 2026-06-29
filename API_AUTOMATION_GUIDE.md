# API Automation Guide
### Framework: Playwright + TypeScript | API: Restful-Booker (https://restful-booker.herokuapp.com)

---

## Table of Contents

1. [What This Framework Does](#1-what-this-framework-does)
2. [Prerequisites — What You Need Before Starting](#2-prerequisites--what-you-need-before-starting)
3. [Installation — Step by Step](#3-installation--step-by-step)
4. [Project Structure Explained](#4-project-structure-explained)
5. [How the Framework Works](#5-how-the-framework-works)
6. [The 8 API Validation Layers](#6-the-8-api-validation-layers)
7. [Running Tests — Every Command You Need](#7-running-tests--every-command-you-need)
8. [Reading the HTML Test Report](#8-reading-the-html-test-report)
9. [How to Add a New API Test Case](#9-how-to-add-a-new-api-test-case)
10. [How to Add a New API Endpoint to the Service](#10-how-to-add-a-new-api-endpoint-to-the-service)
11. [Test Tags Explained](#11-test-tags-explained)
12. [Teardown and Data Cleanup](#12-teardown-and-data-cleanup)
13. [Troubleshooting Common Issues](#13-troubleshooting-common-issues)

---

## 1. What This Framework Does

This framework automatically tests the **Restful-Booker REST API** — a hotel booking system that supports creating, reading, updating, and deleting bookings. Instead of a human manually sending requests through a tool like Postman, this framework runs automated checks in seconds and reports exactly what passed or failed.

**What it tests:**
- Authentication (`POST /auth`) — token creation, invalid credentials, missing fields
- Get Bookings (`GET /booking`, `GET /booking/:id`) — list all, get by ID, filter, 404 handling
- Create and Update Bookings (`POST /booking`, `PUT /booking/:id`, `PATCH /booking/:id`) — full create, partial create, full update, partial update, authentication enforcement
- Delete Bookings (`DELETE /booking/:id`) — successful delete, authentication enforcement, non-existent ID
- End-to-End lifecycle — create → verify → update → verify → delete → confirm deleted

**Total tests:** 18 API tests

---

## 2. Prerequisites — What You Need Before Starting

No programming knowledge is needed to run tests. You only need to install the tools below.

### 2.1 Node.js and npm

**Check if already installed:**
```bash
node --version
npm --version
```

If you see version numbers (e.g. `v20.11.0` and `10.2.3`), skip to Section 3.

**Install Node.js:**

- **macOS:**
  ```bash
  brew install node
  ```
  (If `brew` is not found, install Homebrew first from https://brew.sh)

- **Windows:**
  1. Go to https://nodejs.org
  2. Click the green **"LTS"** button
  3. Download and run the `.msi` installer
  4. Follow installer prompts
  5. Restart your terminal after installation

- **Linux (Ubuntu/Debian):**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

**Verify:**
```bash
node --version    # Should print v20.x.x or higher
npm --version     # Should print 10.x.x or higher
```

### 2.2 Git (to clone the repository)

**Check if installed:**
```bash
git --version
```

**Install if not present:**
- **macOS:** `brew install git`
- **Windows:** https://git-scm.com/download/win
- **Linux:** `sudo apt-get install git`

---

## 3. Installation — Step by Step

Follow these steps **in exact order**.

### Step 1 — Get the project onto your computer

**Option A — Clone from GitHub:**
```bash
git clone <repository-url>
cd Playwright-e2e
```

**Option B — From a ZIP file:**
1. Unzip the file to your Desktop
2. Open your terminal and navigate to the folder:
   ```bash
   cd ~/Desktop/Playwright-e2e       # macOS / Linux
   cd C:\Users\YourName\Desktop\Playwright-e2e   # Windows
   ```

### Step 2 — Install all project dependencies

```bash
npm install
```

Wait for it to finish (30–60 seconds). You will see `added X packages`.

### Step 3 — Verify Playwright is installed

API tests do not need a browser. Playwright handles API requests natively without one. Run:

```bash
npx playwright --version
```

You should see: `Version 1.x.x`

### Step 4 — Run a quick test to confirm setup is complete

```bash
npx playwright test --project=api --grep @sanity
```

You should see green checkmarks. If all tests pass, your setup is complete.

---

## 4. Project Structure Explained

```
Playwright-e2e/
│
├── src/
│   └── api/
│       ├── models/                       ← TypeScript interfaces (shapes of requests/responses)
│       │   ├── Booking.ts                ← Defines what a Booking object looks like
│       │   └── Auth.ts                   ← Defines auth request/response shapes
│       │
│       ├── services/                     ← Service classes — one per API resource
│       │   ├── BaseService.ts            ← Shared logic (timing, base URL) for all services
│       │   ├── AuthService.ts            ← Methods for POST /auth
│       │   └── BookingService.ts         ← Methods for GET/POST/PUT/PATCH/DELETE /booking
│       │
│       └── fixtures/
│           └── api.fixture.ts            ← Injects services + token + cleanup into tests
│
├── tests/
│   └── api/
│       ├── auth/
│       │   └── auth.spec.ts              ← Tests for POST /auth
│       ├── bookings/
│       │   ├── get-bookings.spec.ts      ← Tests for GET /booking and GET /booking/:id
│       │   ├── create-update.spec.ts     ← Tests for POST, PUT, and PATCH /booking
│       │   └── delete-booking.spec.ts    ← Tests for DELETE /booking/:id
│       └── e2e/
│           └── booking-lifecycle.e2e.spec.ts  ← Full create→update→delete lifecycle test
│
├── test-data/
│   └── api/
│       ├── auth.ts                       ← Login credentials for auth tests
│       └── bookings.ts                   ← Static booking payloads for create/update tests
│
├── src/
│   └── shared/
│       ├── config/
│       │   └── config.ts                 ← Base URLs, response time threshold, credentials
│       └── utils/
│           └── DataFactory.ts            ← Generates random booking data for test isolation
│
├── playwright.config.ts                  ← Main Playwright configuration
└── package.json                          ← Project metadata and scripts
```

---

## 5. How the Framework Works

### 5.1 Services — The API Communication Layer

Instead of writing raw HTTP calls inside each test, all communication with the API lives in **Service** classes:

```
Test file  →  Service method  →  HTTP request  →  API  →  HTTP response  →  Service returns result  →  Test asserts
```

**Example — how `BookingService` sends a GET request:**

```typescript
// src/api/services/BookingService.ts
async getBookingById(id: number) {
  const { response, durationMs } = await this.measureResponse(() =>
    this.request.get(`${this.baseUrl}/booking/${id}`)
  );
  const body = response.status() === 200 ? await response.json() : {};
  return { response, body, durationMs };
}
```

A test simply calls:
```typescript
const { response, body, durationMs } = await bookingService.getBookingById(123);
```

It gets back three things:
- `response` — the full HTTP response (status code, headers, etc.)
- `body` — the parsed JSON response body
- `durationMs` — how long the request took in milliseconds

### 5.2 Models — TypeScript Shapes for Safety

Models define the exact shape of API request and response objects:

```typescript
// src/api/models/Booking.ts
export interface Booking {
  firstname: string;     // required
  lastname: string;      // required
  totalprice: number;    // required
  depositpaid: boolean;  // required
  bookingdates: {
    checkin: string;     // required — format: YYYY-MM-DD
    checkout: string;    // required — format: YYYY-MM-DD
  };
  additionalneeds?: string;   // optional (the ? means optional)
}
```

TypeScript uses this interface to catch mistakes at development time. If you try to send a payload that is missing `firstname`, TypeScript highlights it as an error before you even run the test. This is **compile-time request schema validation**.

### 5.3 Fixtures — How Services and Tokens Get Into Tests

Tests never create services manually. The `api.fixture.ts` file creates them and injects them:

```typescript
// In your test — services appear as function parameters:
test('my test', async ({ bookingService, token, bookingCleanup }) => {
  //                     ^ all injected automatically by the fixture
});
```

What the fixture provides:
- **`authService`** — to call the `/auth` endpoint
- **`bookingService`** — to call all `/booking` endpoints
- **`token`** — the auth token, obtained once per test automatically
- **`bookingCleanup`** — a function to register booking IDs for automatic deletion after the test

### 5.4 DataFactory — Random Test Data for Isolation

```typescript
// src/shared/utils/DataFactory.ts
DataFactory.createBookingPayload()
// Returns something like:
// {
//   firstname: 'Test_x4k2m9',
//   lastname: 'User_p7n1q3',
//   totalprice: 287,
//   depositpaid: true,
//   bookingdates: { checkin: '2026-07-01', checkout: '2026-07-07' },
//   additionalneeds: 'Breakfast'
// }
```

Using random data prevents tests from conflicting with each other when they run in parallel. Two tests creating a booking at the same time will create two different bookings with different names, so they do not interfere.

You can override specific fields:
```typescript
DataFactory.createBookingPayload({ firstname: 'FilterTest', totalprice: 500 })
// Creates a random booking but forces firstname to 'FilterTest' and totalprice to 500
```

### 5.5 Static Test Data — For Predictable Assertions

When a test needs to assert exact values (e.g. "does the API return exactly what I sent?"), it uses static payloads from `test-data/api/bookings.ts`:

```typescript
// test-data/api/bookings.ts
export const BOOKING_PAYLOADS = {
  complete: {
    firstname: 'James',
    lastname: 'Brown',
    totalprice: 150,
    ...
  }
};
```

Tests import and use these:
```typescript
const payload = BOOKING_PAYLOADS.complete;
const { body } = await bookingService.createBooking(payload);
expect(body.booking.firstname).toBe(payload.firstname);  // 'James'
```

If you change `BOOKING_PAYLOADS.complete.firstname` to `'Alice'`, the assertion automatically checks for `'Alice'` — no test code change needed. This is **data-driven testing**.

---

## 6. The 8 API Validation Layers

Every API response is validated across multiple layers. Here is what each layer checks:

| Layer | Name | What We Check | Example Assertion |
|---|---|---|---|
| L1 | Request construction | Correct headers, auth token, Content-Type sent (enforced in service layer) | Service sets `'Content-Type': 'application/json'` |
| L2 | Status code | HTTP status code matches the documented contract | `expect(response.status()).toBe(200)` |
| L3 | Response time | Request completed under the performance threshold (3000ms) | `expect(durationMs).toBeLessThan(3000)` |
| L4 | Response schema | All expected fields are present and have the correct data types | `expect(typeof body.firstname).toBe('string')` |
| L5 | Contract | Documented API behaviour matches actual behaviour | `expect(body.reason).toBe('Bad credentials')` |
| L6 | Business logic | Domain rules are enforced (e.g. auth required to delete) | `expect(response.status()).toBe(403)` on unauthenticated delete |
| L7 | Data integrity | Values you sent are exactly what you get back | `expect(body.booking.firstname).toBe(payload.firstname)` |
| L8 | Response headers | Content-Type and other headers are correct | `expect(headers['content-type']).toContain('application/json')` |

**Persistence verification (DB-equivalent layer):**

After every write operation (POST, PUT, DELETE), the framework performs an independent GET request to prove the change was actually saved — not just echoed back in the response:

```
POST /booking → assert CREATE response  →  GET /booking/:id  →  assert same values retrieved
```

This is the API-level equivalent of querying the database directly to verify data was written.

---

## 7. Running Tests — Every Command You Need

Open your terminal, navigate to the project folder, then run any command below.

### 7.1 Run ALL API tests

```bash
npx playwright test --project=api
```

### 7.2 Run ONLY sanity tests (critical fast check)

```bash
npx playwright test --project=api --grep @sanity
```

### 7.3 Run ONLY regression tests (full suite)

```bash
npx playwright test --project=api --grep @regression
```

### 7.4 Run a specific spec file

**Authentication tests only:**
```bash
npx playwright test tests/api/auth/auth.spec.ts --project=api
```

**GET booking tests only:**
```bash
npx playwright test tests/api/bookings/get-bookings.spec.ts --project=api
```

**Create and Update tests only:**
```bash
npx playwright test tests/api/bookings/create-update.spec.ts --project=api
```

**Delete booking tests only:**
```bash
npx playwright test tests/api/bookings/delete-booking.spec.ts --project=api
```

**End-to-end lifecycle test only:**
```bash
npx playwright test tests/api/e2e/booking-lifecycle.e2e.spec.ts --project=api
```

### 7.5 Run a single test by its ID

```bash
npx playwright test --project=api --grep "TC_AUTH_001"
```

Replace `TC_AUTH_001` with any test case ID or part of the test title.

### 7.6 Run only positive tests

```bash
npx playwright test --project=api --grep @positive
```

### 7.7 Run only negative tests

```bash
npx playwright test --project=api --grep @negative
```

### 7.8 Run tests with verbose output (see each request/response)

```bash
npx playwright test --project=api --reporter=list
```

### 7.9 Run tests and open the HTML report immediately

```bash
npx playwright test --project=api && npx playwright show-report
```

### 7.10 Open the HTML report from the last run

```bash
npx playwright show-report
```

### 7.11 Run all tests (both web and API together)

```bash
npx playwright test
```

### Summary Table

| Goal | Command |
|---|---|
| All API tests | `npx playwright test --project=api` |
| Sanity only | `npx playwright test --project=api --grep @sanity` |
| Regression only | `npx playwright test --project=api --grep @regression` |
| Auth spec only | `npx playwright test tests/api/auth/auth.spec.ts --project=api` |
| GET spec only | `npx playwright test tests/api/bookings/get-bookings.spec.ts --project=api` |
| Create/Update spec only | `npx playwright test tests/api/bookings/create-update.spec.ts --project=api` |
| Delete spec only | `npx playwright test tests/api/bookings/delete-booking.spec.ts --project=api` |
| E2E lifecycle spec | `npx playwright test tests/api/e2e/booking-lifecycle.e2e.spec.ts --project=api` |
| One test by ID | `npx playwright test --project=api --grep "TC_GET_001"` |
| Open report | `npx playwright show-report` |

---

## 8. Reading the HTML Test Report

After running tests, Playwright generates a visual HTML report.

**Open it:**
```bash
npx playwright show-report
```

**What you see:**
- **Green rows** = tests that passed
- **Red rows** = tests that failed
- **Click any test** to expand it and see the individual assertions
- **Failed tests** show exactly which assertion failed and what the actual vs expected value was
- Example of a failure message:
  ```
  Expected: 200
  Received: 401
  ```

**Where is the report saved?**
In the `playwright-report/` folder at the root of the project.

---

## 9. How to Add a New API Test Case

Follow these steps every time you want to add a new automated API test.

### Example: Adding a test to verify the API filters bookings by lastname

---

**Step 1 — Decide which spec file the test belongs to**

This is a GET operation with a filter, so it belongs in `tests/api/bookings/get-bookings.spec.ts`.

---

**Step 2 — Check if the service method exists**

Open `src/api/services/BookingService.ts`. The method `getAllBookings(filters?)` already accepts a `lastname` filter because it passes any key-value pair as a query parameter. No service change is needed.

If a method for your endpoint does NOT exist, see Section 10 for how to add one.

---

**Step 3 — Check if static test data is needed**

If your test needs to assert exact field values, add a payload to `test-data/api/bookings.ts`:

```typescript
// test-data/api/bookings.ts
export const BOOKING_PAYLOADS = {
  // ... existing payloads ...
  lastnameFilter: {
    firstname: 'Filter',
    lastname: 'LastnameTest',
    totalprice: 100,
    depositpaid: true,
    bookingdates: { checkin: '2030-08-01', checkout: '2030-08-05' },
  } satisfies Booking,
};
```

The `satisfies Booking` keyword makes TypeScript verify the object matches the `Booking` interface at compile time. This IS request schema validation.

---

**Step 4 — Write the test**

Open `tests/api/bookings/get-bookings.spec.ts` and add inside the `test.describe` block:

```typescript
test('TC_GET_005 — verify the API returns filtered bookings when queried by lastname', { tag: ['@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
  // Arrange: create a booking with a known lastname so we can filter for it
  const payload = DataFactory.createBookingPayload({ lastname: 'LastnameTest' });
  const created = await bookingService.createBooking(payload);
  const createdId = created.body.bookingid;

  // Register for teardown BEFORE assertions — cleanup runs even if a test fails
  bookingCleanup(createdId);

  // Act: call the API with a lastname filter
  const { response, body, durationMs } = await bookingService.getAllBookings({ lastname: 'LastnameTest' });

  // Assert
  // L2 — Status code
  expect(response.status()).toBe(200);
  // L3 — Response time
  expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
  // L4 — Response schema
  expect(Array.isArray(body)).toBe(true);
  // L7 — Data integrity: the booking we just created must appear in results
  const ids = body.map(b => b.bookingid);
  expect(ids).toContain(createdId);
  // L8 — Headers
  expect(response.headers()['content-type']).toContain('application/json');
});
```

**Key rules:**
- The test ID must be the next number (`TC_GET_005` follows `TC_GET_004`)
- Call `bookingCleanup(id)` immediately after creation — before any assertions
- Assert ALL 8 validation layers that are relevant to your scenario
- Use `DataFactory.createBookingPayload({ overrides })` for random base data with your specific override

---

**Step 5 — Run your new test to verify it passes**

```bash
npx playwright test --project=api --grep "TC_GET_005"
```

---

**Step 6 — Run the full GET suite to ensure nothing is broken**

```bash
npx playwright test tests/api/bookings/get-bookings.spec.ts --project=api
```

All existing tests must still pass.

---

**Step 7 — Decide the correct tags**

| Your test scenario | Tags to use |
|---|---|
| Happy path, critical to the feature | `['@sanity', '@regression', '@positive']` |
| Happy path, non-critical | `['@regression', '@positive']` |
| Error path (wrong input, auth failure, 404) | `['@regression', '@negative']` |
| The most critical negative case | `['@sanity', '@regression', '@negative']` |

Only ONE or TWO tests per feature file should have `@sanity`. Most tests should be `@regression` only.

---

## 10. How to Add a New API Endpoint to the Service

Use this when you need to test an API endpoint that does not yet have a service method.

### Example: Adding a method to get bookings by checkin date

---

**Step 1 — Add the method to BookingService**

Open `src/api/services/BookingService.ts` and add the new method:

```typescript
async getBookingsByCheckin(checkinDate: string): Promise<{
  response: APIResponse;
  body: BookingId[];
  durationMs: number;
}> {
  const url = `${this.baseUrl}/booking?checkin=${checkinDate}`;
  const { response, durationMs } = await this.measureResponse(() =>
    this.request.get(url, { headers: { Accept: 'application/json' } })
  );
  const body = await response.json() as BookingId[];
  return { response, body, durationMs };
}
```

**Pattern to follow:**
1. The method signature declares its return type explicitly — no `any`
2. Use `this.measureResponse()` to wrap the request — this measures response time automatically
3. Guard JSON parsing: only call `response.json()` when the status is expected to return JSON
4. Return `{ response, body, durationMs }` — all three are needed in the test

---

**Step 2 — Add the TypeScript model if the response shape is new**

If the new endpoint returns a new shape that is not already in `src/api/models/`, add an interface:

```typescript
// src/api/models/Booking.ts  — add to the existing file
export interface BookingWithDetails extends Booking {
  bookingid: number;
}
```

---

**Step 3 — Write the test using the new method**

```typescript
test('TC_GET_006 — verify the API returns bookings filtered by checkin date', { tag: ['@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
  const checkinDate = '2030-09-01';
  const payload = DataFactory.createBookingPayload({
    bookingdates: { checkin: checkinDate, checkout: '2030-09-07' }
  });
  const created = await bookingService.createBooking(payload);
  bookingCleanup(created.body.bookingid);

  const { response, body, durationMs } = await bookingService.getBookingsByCheckin(checkinDate);

  expect(response.status()).toBe(200);
  expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
  expect(Array.isArray(body)).toBe(true);
  const ids = body.map(b => b.bookingid);
  expect(ids).toContain(created.body.bookingid);
  expect(response.headers()['content-type']).toContain('application/json');
});
```

---

## 11. Test Tags Explained

Every test must have at least one tag from each category below.

### Category 1 — Test scope

| Tag | Meaning | When tests with this tag run |
|---|---|---|
| `@sanity` | Critical, must-pass test — immediate feedback on breakage | On every pull request (PR gate) |
| `@regression` | Full test suite | On merge to main/develop, and nightly at 2 AM UTC |

### Category 2 — Test type

| Tag | Meaning |
|---|---|
| `@positive` | Tests the expected success path (valid input → expected result) |
| `@negative` | Tests error handling (invalid input, missing auth, wrong ID → expected rejection) |

**How many sanity tests per file?**

| Spec file | Sanity tests | Reasoning |
|---|---|---|
| auth.spec.ts | TC_AUTH_001 (valid token), TC_AUTH_002 (invalid password) | Auth is foundational — both happy and rejection paths are critical |
| get-bookings.spec.ts | TC_GET_001 (list), TC_GET_002 (by ID) | Core read operations |
| create-update.spec.ts | TC_CREATE_001 (full create) | Create is the entry point for all other operations |
| delete-booking.spec.ts | TC_DELETE_001 (successful delete) | Core delete operation |
| booking-lifecycle.e2e.spec.ts | TC_E2E_API_001 | Full lifecycle must always work |

---

## 12. Teardown and Data Cleanup

### Why cleanup matters

Every test that creates a booking must delete it after the test. If tests do not clean up, the API environment fills with test data. Over thousands of runs, this can:
- Slow down GET /booking (returns too many records)
- Cause filter tests to match the wrong bookings
- Make the environment unusable for other teams

### How cleanup works in this framework

We use a **fixture-based teardown** pattern. Tests do NOT have try/finally blocks for cleanup. Instead:

**Step 1 — Create the booking:**
```typescript
const created = await bookingService.createBooking(payload);
const bookingId = created.body.bookingid;
```

**Step 2 — Register for cleanup immediately (before any assertions):**
```typescript
bookingCleanup(bookingId);
```

**Step 3 — Write your assertions normally:**
```typescript
expect(response.status()).toBe(200);
// ... more assertions
```

**Step 4 — Fixture teardown runs automatically after the test ends (pass or fail):**

The `bookingCleanup` fixture in `api.fixture.ts` automatically calls `DELETE /booking/:id` for every registered ID once the test completes — regardless of whether the test passed or failed. You never need to write cleanup code inside your test.

**Why is this better than try/finally?**

```typescript
// OLD pattern — fragile:
try {
  const { body } = await bookingService.createBooking(payload);
  bookingId = body.bookingid;   // ← if this fails, bookingId is undefined
  expect(body.firstname).toBe('James');
} finally {
  await bookingService.deleteBooking(bookingId, token);  // ← may try to delete undefined
}

// NEW pattern — bulletproof:
const { body } = await bookingService.createBooking(payload);
bookingCleanup(body.bookingid);   // ← registered immediately, BEFORE assertions
expect(body.firstname).toBe('James');
// fixture handles deletion automatically — even if the line above throws
```

### Tests that delete as part of the test itself

`TC_DELETE_001` and `TC_E2E_API_001` intentionally delete the booking as part of their test logic. They still register with `bookingCleanup` as a safety net. If the deletion in the test fails and throws, the fixture teardown will attempt the deletion again. The second delete attempt gets a 404 or 405, which the fixture silently ignores. Nothing breaks.

---

## 13. Troubleshooting Common Issues

### "Cannot find module" error

**Cause:** Dependencies not installed.

**Fix:**
```bash
rm -rf node_modules
npm install
```

---

### Tests fail with "Connection refused" or "ECONNREFUSED"

**Cause:** The API base URL is wrong or the Restful-Booker server is temporarily unavailable.

**Fix:**
1. Open https://restful-booker.herokuapp.com/booking in your browser — if this does not load, the server is down. Wait a few minutes.
2. If using a different environment, set the base URL:
   ```bash
   API_BASE_URL=https://your-api-server.com npx playwright test --project=api
   ```

---

### Tests fail with "Bad credentials" on auth tests

**Cause:** The credentials in `test-data/api/auth.ts` do not match what the API expects.

**Fix:** Check `test-data/api/auth.ts`:
```typescript
valid: {
  username: 'admin',      // ← must match the API's expected username
  password: 'password123' // ← must match the API's expected password
}
```
For Restful-Booker, the valid credentials are always `admin` / `password123`.

---

### A test passes but the next run fails (intermittent failure)

**Most common causes and fixes:**

| Cause | Fix |
|---|---|
| Previous test left orphaned data | The `bookingCleanup` fixture handles this — ensure you are calling `bookingCleanup(id)` in your test |
| API is slow and exceeds 3000ms threshold | The `API_CONFIG.responseTimeThreshold` is 3000ms. If the API is consistently slow on your environment, you can increase it in `src/shared/config/config.ts` |
| Test is filtering by a common name like 'John' | Always use `DataFactory.createBookingPayload()` with a unique name override for filter tests |

---

### TypeScript errors when writing a new test

**Cause:** You are passing the wrong shape to a service method.

**Example error:**
```
Argument of type '{ lastname: string }' is not assignable to parameter of type 'Booking'.
Property 'firstname' is missing in type '{ lastname: string }'.
```

**Fix:** Check `src/api/models/Booking.ts` to see which fields are required (`firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates`) and which are optional (`additionalneeds?`). Use `DataFactory.createBookingPayload()` to avoid building the full object manually:
```typescript
DataFactory.createBookingPayload({ lastname: 'Brown' })
// ↑ generates all required fields randomly, then overrides lastname with 'Brown'
```

---

### "Token is undefined" in a test

**Cause:** The auth fixture failed to obtain a token because `POST /auth` returned an error.

**Fix:**
1. Run only the auth test to see the error:
   ```bash
   npx playwright test tests/api/auth/auth.spec.ts --project=api
   ```
2. Check that `AUTH_CREDENTIALS.valid` in `test-data/api/auth.ts` has the correct username and password
3. Check that the API server is up and reachable

---

### I want to see the raw request and response for a failing test

Run the test with Playwright's trace viewer enabled:
```bash
npx playwright test --project=api --trace=on
npx playwright show-report
```

Click the failing test in the report, then click **Trace** to see the full request details.

---

*For questions or issues, raise a ticket in the project's issue tracker.*
