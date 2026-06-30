import { test as base } from '@playwright/test';
import { AuthService } from '../services/AuthService';
import { BookingService } from '../services/BookingService';
import { API_CONFIG } from '../../shared/config/config';
import { AUTH_CREDENTIALS } from '../../../test-data/api/auth';

// Callback type: tests call this immediately after creating a booking to register its ID.
// The fixture teardown then deletes every registered ID once the test ends — pass or fail.
// For real projects with direct DB access, point this teardown at a DatabaseService
// instead of the API layer (e.g. db.query('DELETE FROM bookings WHERE id = $1', [id])).
type BookingCleanupFn = (id: number) => void;

// Test-scoped fixtures — created fresh for each test
type ApiFixtures = {
  authService: AuthService;
  bookingService: BookingService;
  bookingCleanup: BookingCleanupFn;
};

// Worker-scoped fixtures — created once per parallel worker, shared across all tests in that worker.
// Worker fixtures can only depend on other worker-scoped fixtures, which is why `token` uses
// `playwright.request` (worker-scoped) instead of the test-scoped `request` fixture.
type ApiWorkerFixtures = {
  token: string;
};

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  // ── Worker-scoped ──────────────────────────────────────────────────────────
  token: [async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_CONFIG.baseUrl,
      extraHTTPHeaders: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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

  bookingService: async ({ request }, use) => {
    await use(new BookingService(request, API_CONFIG.baseUrl));
  },

  bookingCleanup: async ({ bookingService, token }, use) => {
    const registeredIds: number[] = [];

    await use((id: number): void => {
      if (id > 0) registeredIds.push(id);
    });

    // Teardown — runs after every test, regardless of pass or fail.
    // Errors are swallowed so cleanup never masks the real test failure.
    // A booking may already be gone (e.g. TC_DELETE_001 deletes it intentionally) — that is expected.
    for (const id of registeredIds) {
      try {
        await bookingService.deleteBooking(id, token);
      } catch {
        // intentionally swallowed
      }
    }
  },
});

export { expect } from '@playwright/test';
