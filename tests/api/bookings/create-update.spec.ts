import { test, expect } from '../../../src/api/fixtures/api.fixture';
import { BOOKING_PAYLOADS, INVALID_BOOKING_PAYLOADS } from '../../../test-data/api/bookings';
import { API_CONFIG } from '../../../src/shared/config/config';
import { DataFactory } from '../../../src/shared/utils/DataFactory';
import {
  assertSchema,
  assertDateOrder,
  createBookingResponseSchema,
  bookingSchema,
  bookingRequestSchema,
  partialBookingRequestSchema,
} from '../../../src/api/models/schemas/booking.schemas';

test.describe('Create & Update Bookings', () => {
  test('TC_CREATE_001 — verify a new booking is created successfully with all fields provided', { tag: ['@sanity', '@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    const payload = BOOKING_PAYLOADS.complete;
    // L1 — Request schema: validate the payload WE construct before it leaves the test
    assertSchema(bookingRequestSchema, payload);

    const { response, body, durationMs } = await bookingService.createBooking(payload);

    // Register for teardown before any assertions — fixture deletes this after the test
    bookingCleanup(body.bookingid);

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: AJV validates the full create response envelope against the API contract
    assertSchema(createBookingResponseSchema, body);
    // L5 — Contract: checkout must be on or after checkin — a booking system's most critical business rule
    assertDateOrder(body.booking.bookingdates.checkin, body.booking.bookingdates.checkout);
    // L7 — Data integrity: every sent field must be reflected in the response — no silent truncation
    expect(body.booking.firstname).toBe(payload.firstname);
    expect(body.booking.lastname).toBe(payload.lastname);
    expect(body.booking.totalprice).toBe(payload.totalprice);
    expect(body.booking.depositpaid).toBe(payload.depositpaid);
    expect(body.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(body.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    expect(body.booking.additionalneeds).toBe(payload.additionalneeds);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');

    // Persistence verification (DB-layer equivalent):
    // An independent GET proves the data was actually written to storage,
    // not just echoed back in the create response.
    const { response: verifyRes, body: verifyBody } = await bookingService.getBookingById(body.bookingid);
    expect(verifyRes.status()).toBe(200);
    assertSchema(bookingSchema, verifyBody);
    assertDateOrder(verifyBody.bookingdates.checkin, verifyBody.bookingdates.checkout);
    expect(verifyBody.firstname).toBe(payload.firstname);
    expect(verifyBody.totalprice).toBe(payload.totalprice);
    expect(verifyBody.bookingdates.checkin).toBe(payload.bookingdates.checkin);
  });

  test('TC_CREATE_002 — verify a booking is created successfully without the optional additionalneeds field', { tag: ['@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    const payload = BOOKING_PAYLOADS.withoutAdditionalNeeds;
    // L1 — Request schema
    assertSchema(bookingRequestSchema, payload);

    const { response, body, durationMs } = await bookingService.createBooking(payload);

    bookingCleanup(body.bookingid);

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: envelope must conform to the contract even without the optional field
    assertSchema(createBookingResponseSchema, body);
    // L5 — Date ordering
    assertDateOrder(body.booking.bookingdates.checkin, body.booking.bookingdates.checkout);
    // L6 — Business logic: optional field absence must not reject the request
    // L7 — Data integrity: all sent required fields reflected in response
    expect(body.booking.firstname).toBe(payload.firstname);
    expect(body.booking.lastname).toBe(payload.lastname);
    expect(body.booking.totalprice).toBe(payload.totalprice);
    expect(body.booking.depositpaid).toBe(payload.depositpaid);
    expect(body.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(body.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');

    // Persistence verification
    const { response: verifyRes, body: verifyBody } = await bookingService.getBookingById(body.bookingid);
    expect(verifyRes.status()).toBe(200);
    assertSchema(bookingSchema, verifyBody);
    expect(verifyBody.firstname).toBe(payload.firstname);
    expect(verifyBody.totalprice).toBe(payload.totalprice);
  });

  test('TC_CREATE_003 — verify the API rejects booking creation when the firstname field is missing', { tag: ['@regression', '@negative'] }, async ({ bookingService }) => {
    const { response, durationMs } = await bookingService.createBooking(INVALID_BOOKING_PAYLOADS.missingFirstname.data);

    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L6 — Business logic: Restful-Booker returns 500 for missing required fields because it
    // does not validate input before attempting the insert (known API defect — should be 400).
    // This assertion pins the current behaviour; if the API is ever fixed to return 400, this
    // test will catch the change and should be updated to assert 400.
    expect(response.status()).toBe(500);
  });

  test('TC_UPDATE_001 — verify a booking is fully updated with a valid auth token', { tag: ['@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    const created = await bookingService.createBooking(DataFactory.createBookingPayload());
    const bookingId = created.body.bookingid;
    bookingCleanup(bookingId);

    const updatePayload = BOOKING_PAYLOADS.updatePayload;
    // L1 — Request schema: PUT sends a complete booking object — same schema as POST
    assertSchema(bookingRequestSchema, updatePayload);

    const { response, body, durationMs } = await bookingService.updateBooking(bookingId, { ...updatePayload });

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: PUT response must conform to the booking contract
    assertSchema(bookingSchema, body);
    // L5 — Date ordering: updated dates must still satisfy the business rule
    assertDateOrder(body.bookingdates.checkin, body.bookingdates.checkout);
    // L7 — Data integrity: PUT response must reflect every updated field — no silent partial apply
    expect(body.firstname).toBe(updatePayload.firstname);
    expect(body.lastname).toBe(updatePayload.lastname);
    expect(body.totalprice).toBe(updatePayload.totalprice);
    expect(body.depositpaid).toBe(updatePayload.depositpaid);
    expect(body.bookingdates.checkin).toBe(updatePayload.bookingdates.checkin);
    expect(body.bookingdates.checkout).toBe(updatePayload.bookingdates.checkout);
    expect(body.additionalneeds).toBe(updatePayload.additionalneeds);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');

    // L6 — Persistence verification: changes must survive a round-trip GET
    const { body: persisted } = await bookingService.getBookingById(bookingId);
    assertSchema(bookingSchema, persisted);
    assertDateOrder(persisted.bookingdates.checkin, persisted.bookingdates.checkout);
    expect(persisted.firstname).toBe(updatePayload.firstname);
    expect(persisted.totalprice).toBe(updatePayload.totalprice);
    expect(persisted.bookingdates.checkin).toBe(updatePayload.bookingdates.checkin);
    expect(persisted.bookingdates.checkout).toBe(updatePayload.bookingdates.checkout);
  });

  test('TC_UPDATE_002 — verify a booking update is rejected without an auth token', { tag: ['@regression', '@negative'] }, async ({ bookingService, bookingCleanup }) => {
    const original = DataFactory.createBookingPayload();
    const created = await bookingService.createBooking(original);
    const bookingId = created.body.bookingid;
    bookingCleanup(bookingId);

    const { response, durationMs } = await bookingService.updateBookingWithoutAuth(bookingId, { ...BOOKING_PAYLOADS.updatePayload });

    // L2 — Status code: unauthenticated PUT must be rejected
    expect(response.status()).toBe(403);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L6 — Persistence verification: original data must be completely unchanged
    const { body: unchanged } = await bookingService.getBookingById(bookingId);
    expect(unchanged.firstname).toBe(original.firstname);
    expect(unchanged.lastname).toBe(original.lastname);
    expect(unchanged.totalprice).toBe(original.totalprice);
  });

  test('TC_UPDATE_003 — verify a booking can be partially updated using PATCH with a valid auth token', { tag: ['@regression', '@positive'] }, async ({ bookingService, bookingCleanup }) => {
    const original = DataFactory.createBookingPayload();
    const created = await bookingService.createBooking(original);
    const bookingId = created.body.bookingid;
    bookingCleanup(bookingId);

    const patchPayload = BOOKING_PAYLOADS.patchPayload;
    // L1 — Request schema: PATCH sends a partial object — at least 1 field, no required fields
    assertSchema(partialBookingRequestSchema, patchPayload);

    const { response, body, durationMs } = await bookingService.partialUpdateBooking(bookingId, patchPayload);

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: PATCH response must still conform to the full booking contract
    assertSchema(bookingSchema, body);
    // L5 — Date ordering: original dates must be preserved and still valid
    assertDateOrder(body.bookingdates.checkin, body.bookingdates.checkout);
    // L7 — Data integrity: only the patched fields must change
    expect(body.firstname).toBe(BOOKING_PAYLOADS.patchPayload.firstname);
    expect(body.totalprice).toBe(BOOKING_PAYLOADS.patchPayload.totalprice);
    // L5 — Contract: ALL unpatched fields must retain their exact original values
    expect(body.lastname).toBe(original.lastname);
    expect(body.depositpaid).toBe(original.depositpaid);
    expect(body.bookingdates.checkin).toBe(original.bookingdates.checkin);
    expect(body.bookingdates.checkout).toBe(original.bookingdates.checkout);
    expect(body.additionalneeds).toBe(original.additionalneeds);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });
});
