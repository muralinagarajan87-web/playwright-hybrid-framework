import { test, expect } from '@api/fixtures/api.fixture';
import { API_CONFIG } from '@shared/config/config';
import { DataFactory } from '@shared/utils/DataFactory';
import {
  assertSchema,
  assertDateOrder,
  bookingListSchema,
  bookingSchema,
} from '@api/models/schemas/booking.schemas';

test.describe('GET Bookings', () => {
  test('TC_GET_001 — verify the API returns a list of all booking IDs', { tag: ['@sanity', '@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    // Create a controlled booking so this test never relies on the shared Heroku demo
    // server already having data. If the DB is wiped, this test still passes correctly.
    const seed = await bookingService.createBooking(DataFactory.createBookingPayload());
    const seedId = seed.body.bookingid;
    bookingCleanup(seedId);

    const { response, body, durationMs } = await bookingService.getAllBookings();

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: AJV validates the full list structure against the API contract
    assertSchema(bookingListSchema, body);
    // L5 — Contract: our controlled booking must appear in the list.
    // Asserting our own ID (not just body.length > 0) proves the API returns live data,
    // not a cached or empty response.
    expect(body.some(b => b.bookingid === seedId)).toBe(true);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_GET_002 — verify the API returns complete booking details for a valid booking ID', { tag: ['@sanity', '@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    // Create a controlled booking so this test owns its data and is not at risk from
    // a parallel DELETE test removing body[0] mid-execution (race condition under fullyParallel).
    const payload = DataFactory.createBookingPayload();
    const created = await bookingService.createBooking(payload);
    const bookingId = created.body.bookingid;
    bookingCleanup(bookingId);

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
    // L7 — Data integrity: response matches what was sent in the create
    expect(body.firstname).toBe(payload.firstname);
    expect(body.totalprice).toBe(payload.totalprice);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_GET_003 — verify the API returns only bookings matching the firstname filter', { tag: ['@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    // Guaranteed-unique firstname: timestamp + 6-char random suffix.
    // Exact-length randomString fix ensures no short-string collisions.
    const uniqueFirstname = `Filter_${Date.now()}_${DataFactory.randomString(6)}`;
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
    // L5 — Filter precision: exactly ONE result must be returned.
    // If the API ignores the filter → returns all bookings → body.length > 1 → FAIL.
    // If the filter is case-sensitive and breaks → returns zero → body.length === 0 → FAIL.
    expect(body).toHaveLength(1);
    // L7 — Data integrity: the single result must be the exact booking we created
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
