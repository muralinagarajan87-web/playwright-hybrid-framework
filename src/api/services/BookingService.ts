import { APIResponse } from '@playwright/test';
import { BaseService } from './BaseService';
import { Booking, BookingFilters, CreateBookingResponse, BookingId } from '../models/Booking';

export class BookingService extends BaseService {
  async getAllBookings(filters?: BookingFilters): Promise<{
    response: APIResponse;
    body: BookingId[];
    durationMs: number;
  }> {
    const params = filters
      ? new URLSearchParams(filters as Record<string, string>).toString()
      : '';
    const url = params ? `${this.baseUrl}/booking?${params}` : `${this.baseUrl}/booking`;
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.get(url, { headers: this.jsonHeaders })
    );
    const body = await response.json() as BookingId[];
    return { response, body, durationMs };
  }

  async getBookingById(id: number): Promise<{
    response: APIResponse;
    body: Booking;
    durationMs: number;
  }> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.get(`${this.baseUrl}/booking/${id}`, { headers: this.jsonHeaders })
    );
    const body = response.status() === 200
      ? await response.json() as Booking
      : ({} as Booking);
    return { response, body, durationMs };
  }

  // Accepts `Booking` (strongly typed) for valid payloads.
  // Negative tests that deliberately send malformed data must cast at the call-site
  // (`payload as unknown as Booking`) so the intentional misuse is visible in test-data.
  async createBooking(payload: Booking): Promise<{
    response: APIResponse;
    body: CreateBookingResponse;
    durationMs: number;
  }> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.post(`${this.baseUrl}/booking`, {
        data: payload,
        headers: this.jsonHeaders,
      })
    );
    const body = response.status() === 200
      ? await response.json() as CreateBookingResponse
      : ({} as CreateBookingResponse);
    return { response, body, durationMs };
  }

  async updateBooking(id: number, payload: Booking, token: string): Promise<{
    response: APIResponse;
    body: Booking;
    durationMs: number;
  }> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.put(`${this.baseUrl}/booking/${id}`, {
        data: payload,
        headers: { ...this.jsonHeaders, Cookie: `token=${token}` },
      })
    );
    const body = response.status() === 200
      ? await response.json() as Booking
      : ({} as Booking);
    return { response, body, durationMs };
  }

  async updateBookingWithoutAuth(id: number, payload: Booking): Promise<{
    response: APIResponse;
    durationMs: number;
  }> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.put(`${this.baseUrl}/booking/${id}`, {
        data: payload,
        headers: this.jsonHeaders,
      })
    );
    return { response, durationMs };
  }

  async partialUpdateBooking(id: number, payload: Partial<Booking>, token: string): Promise<{
    response: APIResponse;
    body: Booking;
    durationMs: number;
  }> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.patch(`${this.baseUrl}/booking/${id}`, {
        data: payload,
        headers: { ...this.jsonHeaders, Cookie: `token=${token}` },
      })
    );
    const body = response.status() === 200
      ? await response.json() as Booking
      : ({} as Booking);
    return { response, body, durationMs };
  }

  async deleteBooking(id: number, token: string): Promise<{
    response: APIResponse;
    durationMs: number;
  }> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.delete(`${this.baseUrl}/booking/${id}`, {
        headers: { Cookie: `token=${token}` },
      })
    );
    return { response, durationMs };
  }

  async deleteBookingWithoutAuth(id: number): Promise<{
    response: APIResponse;
    durationMs: number;
  }> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.delete(`${this.baseUrl}/booking/${id}`)
    );
    return { response, durationMs };
  }
}
