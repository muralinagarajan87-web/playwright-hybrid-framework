import { Booking } from '../../src/api/models/Booking';

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

  // Partial payload used for PATCH tests — only the fields being updated
  patchPayload: {
    firstname: 'PatchedName',
    totalprice: 750,
  } satisfies Partial<Booking>,

  // Deliberately missing `firstname` — used by TC_CREATE_003 to verify the API
  // rejects invalid input. Cast required because createBooking() is strongly typed.
  missingFirstname: {
    lastname: 'Brown',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2030-06-01',
      checkout: '2030-06-07',
    },
  } as unknown as Booking,
};

// Overrides applied on top of a DataFactory base payload for the E2E lifecycle test.
// Kept here so no string literals appear inside the test file itself.
export const E2E_BOOKING_OVERRIDES = {
  firstname:       'E2E',
  lastname:        'Test',
  totalprice:      300,
  depositpaid:     true,
  additionalneeds: 'Dinner',
} satisfies Partial<Booking>;
