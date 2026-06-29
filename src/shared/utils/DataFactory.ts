import { Booking } from '../../api/models/Booking';

export class DataFactory {
  static randomString(length = 6): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static futureDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0] ?? '';
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
