import { Booking } from '../../src/api/models/Booking';

// ── Valid payloads — all fields satisfy the Booking contract ────────────────

export const BOOKING_PAYLOADS = {
  complete: {
    firstname: 'James',
    lastname: 'Brown',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2030-06-01',
      checkout: '2030-06-07',
    },
    additionalneeds: 'Breakfast',
  } satisfies Booking,

  withoutAdditionalNeeds: {
    firstname: 'Alice',
    lastname: 'Cooper',
    totalprice: 200,
    depositpaid: false,
    bookingdates: {
      checkin: '2030-09-01',
      checkout: '2030-09-05',
    },
  } satisfies Booking,

  updatePayload: {
    firstname: 'Updated',
    lastname: 'User',
    totalprice: 999,
    depositpaid: false,
    bookingdates: {
      checkin: '2030-12-01',
      checkout: '2030-12-05',
    },
    additionalneeds: 'Dinner',
  } satisfies Booking,

  // Partial payload for PATCH — only the fields being updated
  patchPayload: {
    firstname: 'PatchedName',
    totalprice: 750,
  } satisfies Partial<Booking>,
};

// ── Deliberately invalid payloads — kept separate so BOOKING_PAYLOADS remains ──
// ── a clean set of valid contracts that TypeScript fully type-checks.           ──
//
// The `as unknown as Booking` casts make the intentional misuse visible here in
// the test-data layer, not buried inside test files. `_description` explains WHY
// each payload is invalid — essential context for the next developer.

export const INVALID_BOOKING_PAYLOADS = {
  missingFirstname: {
    _description: 'Missing required firstname — exercises API input validation (TC_CREATE_003)',
    data: {
      lastname: 'Brown',
      totalprice: 150,
      depositpaid: true,
      bookingdates: {
        checkin: '2030-06-01',
        checkout: '2030-06-07',
      },
    } as unknown as Booking,
  },
};

// ── E2E overrides — applied on top of a DataFactory base payload ────────────
// Kept here so no string literals appear inside the test file itself.

export const E2E_BOOKING_OVERRIDES = {
  firstname:       'E2E',
  lastname:        'Test',
  totalprice:      300,
  depositpaid:     true,
  additionalneeds: 'Dinner',
} satisfies Partial<Booking>;
