import { test as base } from '@playwright/test';
import { AuthService } from '../services/AuthService';
import { BookingService } from '../services/BookingService';
import { API_CONFIG } from '../../shared/config/config';
import { AUTH_CREDENTIALS } from '../../../test-data/api/auth';

// Callback type: tests call this immediately after creating a booking to register its ID.
// The fixture teardown then deletes every registered ID once the test ends — pass or fail.
type BookingCleanupFn = (id: number) => void;

// Test-scoped fixtures — created fresh for each test
type ApiFixtures = {
  authService: AuthService;
  bookingService: BookingService;
  bookingCleanup: BookingCleanupFn;
};

// Worker-scoped fixtures — created once per parallel worker, shared across all tests in that worker.
// Worker fixtures can only depend on other worker-scoped fixtures, which is why token uses
// playwright.request (worker-scoped) instead of the test-scoped request fixture.
type ApiWorkerFixtures = {
  token: string;
};

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  // ── Worker-scoped ──────────────────────────────────────────────────────────
  // TOKEN EXPIRY ASSUMPTION: Restful-Booker tokens do not expire, so a single
  // token per worker is safe for the lifetime of a test run. If this framework
  // is ever pointed at an API with short-lived tokens (e.g. JWT with 15min TTL),
  // replace this fixture with a per-test token (scope: 'test') or add a refresh
  // mechanism that calls /auth again when a 401 is detected mid-run.
  token: [async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_CONFIG.baseUrl,
      extraHTTPHeaders: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const response = await context.post('/auth', { data: AUTH_CREDENTIALS.valid });
    const body = await response.json() as { token: string };
    await context.dispose();
    await use(body.token);
  }, { scope: 'worker' }],

  // ── Test-scoped ────────────────────────────────────────────────────────────
  authService: async ({ request }, use) => {
    await use(new AuthService(request, API_CONFIG.baseUrl));
  },

  // Token is injected into the service at fixture setup time so tests never pass it
  // per-call. Auth is a service-layer concern — rotating or re-scoping the token only
  // requires changing this one fixture, not every test that calls DELETE/PUT/PATCH.
  bookingService: async ({ request, token }, use) => {
    const service = new BookingService(request, API_CONFIG.baseUrl);
    service.setAuthToken(token);
    await use(service);
  },

  bookingCleanup: async ({ bookingService }, use) => {
    const registeredIds: number[] = [];

    await use((id: number): void => {
      if (id > 0) registeredIds.push(id);
    });

    // Teardown runs after every test, pass or fail. bookingService already has the token
    // injected, so no token argument is needed here.
    const failedIds: number[] = [];
    for (const id of registeredIds) {
      try {
        await bookingService.deleteBooking(id);
      } catch {
        failedIds.push(id);
      }
    }

    // Log but do not throw — throwing here would mask the real test failure.
    // Visibility into failed cleanups enables detection of systemic issues (bad token,
    // quota limits, server downtime) before they silently grow the shared DB.
    if (failedIds.length > 0) {
      console.warn(
        `⚠ Cleanup: ${failedIds.length}/${registeredIds.length} booking(s) ` +
        `failed to delete — IDs: ${failedIds.join(', ')}`
      );
    }
  },
});

export { expect } from '@playwright/test';
