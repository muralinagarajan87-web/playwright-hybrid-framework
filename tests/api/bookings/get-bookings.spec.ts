import { test, expect } from '../../../src/api/fixtures/api.fixture';
import { API_CONFIG } from '../../../src/shared/config/config';
import { DataFactory } from '../../../src/shared/utils/DataFactory';
import { assertSchema, bookingListSchema, bookingSchema } from '../../../src/api/models/schemas/booking.schemas';

test.describe('GET Bookings', () => {
  test('TC_GET_001 — verify the API returns a list of all booking IDs', { tag: ['@sanity', '@regression', '@positive'] }, async ({ bookingService }) => {
    const { response, body, durationMs } = await bookingService.getAllBookings();

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: AJV validates the full list structure against the API contract
    assertSchema(bookingListSchema, body);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_GET_002 — verify the API returns complete booking details for a valid booking ID', { tag: ['@sanity', '@regression', '@positive'] }, async ({ bookingService }) => {
    const list = await bookingService.getAllBookings();
    const bookingId = list.body[0].bookingid;

    const { response, body, durationMs } = await bookingService.getBookingById(bookingId);

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: AJV validates every field name, type, and format in one call
    assertSchema(bookingSchema, body);
    // L5 — Contract: dates must be in YYYY-MM-DD format (enforced by AJV "date" format above)
    // L6 — Business logic: name fields must not be empty strings
    expect(body.firstname.length).toBeGreaterThan(0);
    expect(body.lastname.length).toBeGreaterThan(0);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_GET_003 — verify the API returns filtered bookings when queried by firstname', { tag: ['@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    const payload = DataFactory.createBookingPayload({ firstname: 'FilterTest' });
    const created = await bookingService.createBooking(payload);
    const createdId = created.body.bookingid;

    // Register before assertions — fixture handles teardown even if filter query fails
    bookingCleanup(createdId);

    const { response, body, durationMs } = await bookingService.getAllBookings({ firstname: 'FilterTest' });

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: filtered result must still conform to the booking list contract
    assertSchema(bookingListSchema, body);
    // L7 — Data integrity: the booking we just created must appear in filtered results
    const ids = body.map(b => b.bookingid);
    expect(ids).toContain(createdId);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_GET_004 — verify the API returns 404 for a non-existent booking ID', { tag: ['@regression', '@negative'] }, async ({ bookingService }) => {
    const { response, durationMs } = await bookingService.getBookingById(999999);

    // L2 — Status code
    expect(response.status()).toBe(404);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
  });
});
