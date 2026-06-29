import { test, expect } from '../../../src/api/fixtures/api.fixture';
import { API_CONFIG } from '../../../src/shared/config/config';
import { DataFactory } from '../../../src/shared/utils/DataFactory';

test.describe('Delete Booking — DELETE /booking/:id', () => {
  test('TC_DELETE_001 — verify a booking is successfully deleted with a valid auth token', { tag: ['@sanity', '@regression', '@positive'] }, async ({ bookingService, token, bookingCleanup }) => {
    const created = await bookingService.createBooking(DataFactory.createBookingPayload());
    const bookingId = created.body.bookingid;

    // Register as a safety net: if the delete below fails mid-way, fixture teardown catches it
    bookingCleanup(bookingId);

    const { response, durationMs } = await bookingService.deleteBooking(bookingId, token);

    // L2 — Status code: Restful-Booker documents 201 as the success status for DELETE
    expect(response.status()).toBe(201);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response body: Restful-Booker returns 'Created' as the delete confirmation text
    expect(await response.text()).toBe('Created');
    // L6 — Business logic / persistence verification: deleted booking must not be retrievable
    const { response: getResponse, durationMs: getTime } = await bookingService.getBookingById(bookingId);
    expect(getResponse.status()).toBe(404);
    expect(getTime).toBeLessThan(API_CONFIG.responseTimeThreshold);
  });

  test('TC_DELETE_002 — verify booking deletion is rejected without an auth token', { tag: ['@regression', '@negative'] }, async ({ bookingService, bookingCleanup }) => {
    const created = await bookingService.createBooking(DataFactory.createBookingPayload());
    const bookingId = created.body.bookingid;

    // Register before the unauthenticated delete attempt — fixture ensures cleanup regardless
    bookingCleanup(bookingId);

    const { response, durationMs } = await bookingService.deleteBookingWithoutAuth(bookingId);

    // L2 — Status code: unauthenticated DELETE must be rejected
    expect(response.status()).toBe(403);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L6 — Business logic / persistence verification: booking must still exist after rejected delete
    const { response: getResponse } = await bookingService.getBookingById(bookingId);
    expect(getResponse.status()).toBe(200);
  });

  test('TC_DELETE_003 — verify the API returns 405 when deleting a non-existent booking ID', { tag: ['@regression', '@negative'] }, async ({ bookingService, token }) => {
    const { response, durationMs } = await bookingService.deleteBooking(999999, token);

    // L2 — Status code: 405 is the documented behaviour for non-existent IDs on Restful-Booker
    expect(response.status()).toBe(405);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
  });
});
