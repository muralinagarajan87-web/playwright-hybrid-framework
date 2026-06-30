import { Booking } from '../../api/models/Booking';

export class DataFactory {
  static randomString(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static futureDate(daysFromNow: number): string {
    // Work entirely in UTC so the result is identical regardless of the CI runner's
    // local timezone. Mixing local setDate() with toISOString() (UTC) caused off-by-one
    // date errors in UTC+X timezones when tests ran near midnight local time.
    const now = new Date();
    const utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysFromNow);
    return new Date(utc).toISOString().split('T')[0] ?? '';
  }

  static createBookingPayload(overrides?: Partial<Booking>): Booking {
    return {
      firstname: `Test_${this.randomString()}`,
      lastname: `User_${this.randomString()}`,
      totalprice: this.randomInt(50, 500),
      depositpaid: true,
      bookingdates: {
        checkin: this.futureDate(1),
        checkout: this.futureDate(7),
      },
      additionalneeds: 'Breakfast',
      ...overrides,
    };
  }
}
