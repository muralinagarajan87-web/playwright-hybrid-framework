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

  missingFirstname: {
    lastname: 'Brown',
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: '2030-06-01',
      checkout: '2030-06-07',
    },
  },
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
