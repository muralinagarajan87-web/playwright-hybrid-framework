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
