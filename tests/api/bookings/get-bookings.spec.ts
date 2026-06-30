import { test, expect } from '../../../src/api/fixtures/api.fixture';
import { API_CONFIG } from '../../../src/shared/config/config';
import { DataFactory } from '../../../src/shared/utils/DataFactory';
import {
  assertSchema,
  assertDateOrder,
  bookingListSchema,
  bookingSchema,
} from '../../../src/api/models/schemas/booking.schemas';

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
    // L4 — Response schema: AJV validates every field name, type, and date format in one call
    assertSchema(bookingSchema, body);
    // L5 — Date ordering: checkout must be on or after checkin — fundamental booking constraint
    assertDateOrder(body.bookingdates.checkin, body.bookingdates.checkout);
    // L6 — Business logic: GET is idempotent — calling the same resource twice must return
    // identical data. Catches server-side state mutations triggered by reads.
    const { body: body2 } = await bookingService.getBookingById(bookingId);
    expect(body2.firstname).toBe(body.firstname);
    expect(body2.lastname).toBe(body.lastname);
    expect(body2.totalprice).toBe(body.totalprice);
    expect(body2.depositpaid).toBe(body.depositpaid);
    expect(body2.bookingdates.checkin).toBe(body.bookingdates.checkin);
    expect(body2.bookingdates.checkout).toBe(body.bookingdates.checkout);
    // L6 (cont.) — name fields must not be empty strings
    expect(body.firstname.length).toBeGreaterThan(0);
    expect(body.lastname.length).toBeGreaterThan(0);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_GET_003 — verify the API returns only bookings matching the firstname filter', { tag: ['@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    // Use a guaranteed-unique firstname so we can assert EXACTLY one result is returned.
    // If the API ignores the filter and returns all bookings, body.length > 1 and the test fails.
    const uniqueFirstname = `Filter_${Date.now()}_${DataFactory.randomString(4)}`;
    const payload = DataFactory.createBookingPayload({ firstname: uniqueFirstname });
    const created = await bookingService.createBooking(payload);
    const createdId = created.body.bookingid;

    // Register before assertions — fixture handles teardown even if the filter query fails
    bookingCleanup(createdId);

    const { response, body, durationMs } = await bookingService.getAllBookings({ firstname: uniqueFirstname });

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: filtered result must still conform to the booking list contract
    assertSchema(bookingListSchema, body);
    // L5 — Filter precision: exactly ONE result must be returned — if the API ignores the filter
    // it returns thousands of bookings; if the filter is case-sensitive it returns zero.
    // Both bugs are caught here.
    expect(body).toHaveLength(1);
    // L7 — Data integrity: the single result must be the exact booking we just created
    expect(body[0].bookingid).toBe(createdId);
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
