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
