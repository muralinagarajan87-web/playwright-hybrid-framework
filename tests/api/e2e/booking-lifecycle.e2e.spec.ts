import { test, expect } from '../../../src/api/fixtures/api.fixture';
import { DataFactory } from '../../../src/shared/utils/DataFactory';
import { API_CONFIG } from '../../../src/shared/config/config';
import { assertSchema, createBookingResponseSchema, bookingSchema } from '../../../src/api/models/schemas/booking.schemas';

test('TC_E2E_API_001 — verify the complete booking lifecycle: create, verify, update, verify, delete, confirm deleted', { tag: ['@sanity', '@regression', '@positive'] }, async ({ bookingService, token, bookingCleanup }) => {
  // ── Step 1: Create booking ──────────────────────────────────────────────
  const originalPayload = DataFactory.createBookingPayload({
    firstname: 'E2E',
    lastname: 'Test',
    totalprice: 300,
    depositpaid: true,
    additionalneeds: 'Dinner',
  });

  const { response: createRes, body: createBody, durationMs: createTime } =
    await bookingService.createBooking(originalPayload);

  expect(createRes.status()).toBe(200);
  expect(createTime).toBeLessThan(API_CONFIG.responseTimeThreshold);
  // L4 — Response schema: AJV validates the full create envelope against the API contract
  assertSchema(createBookingResponseSchema, createBody);
  // L7 — Data integrity: every sent field reflected in create response
  expect(createBody.booking.firstname).toBe(originalPayload.firstname);
  expect(createBody.booking.lastname).toBe(originalPayload.lastname);
  expect(createBody.booking.totalprice).toBe(originalPayload.totalprice);
  expect(createBody.booking.depositpaid).toBe(originalPayload.depositpaid);
  expect(createBody.booking.bookingdates.checkin).toBe(originalPayload.bookingdates.checkin);
  expect(createBody.booking.additionalneeds).toBe(originalPayload.additionalneeds);

  const bookingId = createBody.bookingid;

  // Register before step 2 — if any step fails, fixture teardown cleans up the booking.
  // The Step 5 delete is the primary cleanup; this is the safety net.
  bookingCleanup(bookingId);

  // ── Step 2: Confirm create persisted via GET ────────────────────────────
  const { response: getRes1, body: getBody1, durationMs: getTime1 } =
    await bookingService.getBookingById(bookingId);

  expect(getRes1.status()).toBe(200);
  expect(getTime1).toBeLessThan(API_CONFIG.responseTimeThreshold);
  // L4 — Response schema: GET response must conform to the booking contract
  assertSchema(bookingSchema, getBody1);
  // L6 — Persistence verification: all fields must survive a round-trip GET
  expect(getBody1.firstname).toBe(originalPayload.firstname);
  expect(getBody1.lastname).toBe(originalPayload.lastname);
  expect(getBody1.totalprice).toBe(originalPayload.totalprice);
  expect(getBody1.depositpaid).toBe(originalPayload.depositpaid);
  expect(getBody1.bookingdates.checkin).toBe(originalPayload.bookingdates.checkin);
  expect(getBody1.additionalneeds).toBe(originalPayload.additionalneeds);

  // ── Step 3: Update booking via PUT ──────────────────────────────────────
  const updatePayload = DataFactory.createBookingPayload({
    firstname: 'E2E-Updated',
    totalprice: 999,
  });

  const { response: putRes, body: putBody, durationMs: putTime } =
    await bookingService.updateBooking(bookingId, updatePayload, token);

  expect(putRes.status()).toBe(200);
  expect(putTime).toBeLessThan(API_CONFIG.responseTimeThreshold);
  // L4 — Response schema: PUT response must conform to the booking contract
  assertSchema(bookingSchema, putBody);
  // L7 — Data integrity: PUT response reflects the new values immediately
  expect(putBody.firstname).toBe(updatePayload.firstname);
  expect(putBody.totalprice).toBe(updatePayload.totalprice);
  expect(putBody.depositpaid).toBe(updatePayload.depositpaid);
  expect(putBody.bookingdates.checkin).toBe(updatePayload.bookingdates.checkin);

  // ── Step 4: Confirm update persisted via GET ────────────────────────────
  const { response: getRes2, body: getBody2, durationMs: getTime2 } =
    await bookingService.getBookingById(bookingId);

  expect(getRes2.status()).toBe(200);
  expect(getTime2).toBeLessThan(API_CONFIG.responseTimeThreshold);
  // L4 — Response schema: GET after PUT must still conform to the booking contract
  assertSchema(bookingSchema, getBody2);
  // L6 — Persistence verification: PUT changes must be durable
  expect(getBody2.firstname).toBe(updatePayload.firstname);
  expect(getBody2.totalprice).toBe(updatePayload.totalprice);
  expect(getBody2.bookingdates.checkin).toBe(updatePayload.bookingdates.checkin);

  // ── Step 5: Delete booking ──────────────────────────────────────────────
  const { response: deleteRes, durationMs: deleteTime } =
    await bookingService.deleteBooking(bookingId, token);

  expect(deleteRes.status()).toBe(201);
  expect(deleteTime).toBeLessThan(API_CONFIG.responseTimeThreshold);
  // L4 — Response body: Restful-Booker returns 'Created' as delete confirmation
  expect(await deleteRes.text()).toBe('Created');

  // ── Step 6: Confirm deletion is permanent via GET → 404 ─────────────────
  const { response: getRes3, durationMs: getTime3 } =
    await bookingService.getBookingById(bookingId);

  expect(getRes3.status()).toBe(404);
  expect(getTime3).toBeLessThan(API_CONFIG.responseTimeThreshold);
});
