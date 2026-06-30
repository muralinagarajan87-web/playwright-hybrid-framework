import { BaseService, ServiceResponse, RawServiceResponse } from './BaseService';
import { Booking, BookingFilters, CreateBookingResponse, BookingId } from '../models/Booking';

/**
 * ## Body-handling pattern — two approaches, both intentional
 *
 * **`parseResponse<T>()`** (BaseService utility) — use in NEW methods that only have
 * positive-path tests. It throws immediately on any non-success status, so the caller
 * always receives a fully typed body.
 *
 * **Conditional `{} as T`** — used in methods that have NEGATIVE test cases that inspect
 * `response.status()` directly (e.g. `getBookingById` → TC_GET_004 expects 404;
 * `createBooking` → TC_CREATE_003 expects 500). These tests must not throw on non-200 —
 * they need the raw `response` object back so they can assert the error status code.
 *
 * This is a documented trade-off, not an incomplete migration.
 */
export class BookingService extends BaseService {
  // Auth token injected at fixture setup time via setAuthToken().
  // Centralised here so tests never pass token per-call — auth is a service-layer concern,
  // not a test concern. Rotating or scoping the token only requires changing the fixture.
  private authToken: string | null = null;

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  // Builds auth headers and throws immediately if no token has been set.
  // Authenticated methods call this; unauthenticated variants bypass it.
  private getAuthHeaders(): Record<string, string> {
    if (!this.authToken) {
      throw new Error(
        'Authenticated operation called without a token. ' +
        'Ensure the bookingService fixture injects a token via setAuthToken().'
      );
    }
    return { ...this.jsonHeaders, Cookie: `token=${this.authToken}` };
  }

  async getAllBookings(filters?: BookingFilters): Promise<ServiceResponse<BookingId[]>> {
    // Filter out undefined values before building URLSearchParams — passing
    // { firstname: undefined } would otherwise serialize as "?firstname=undefined"
    // (a string literal), silently sending a filter the API would not expect.
    const params = filters
      ? new URLSearchParams(
          Object.entries(filters).filter((e): e is [string, string] => e[1] !== undefined)
        ).toString()
      : '';
    const url = params ? `${this.baseUrl}/booking?${params}` : `${this.baseUrl}/booking`;
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.get(url, { headers: this.jsonHeaders })
    );
    const body = await response.json() as BookingId[];
    return { response, body, durationMs };
  }

  async getBookingById(id: number): Promise<ServiceResponse<Booking>> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.get(`${this.baseUrl}/booking/${id}`, { headers: this.jsonHeaders })
    );
    // Returns {} as Booking on non-200 to support negative tests (e.g. TC_GET_004) that
    // assert response.status() directly without reading body.
    // Use parseResponse<T>() in new methods where the caller always expects success.
    const body = response.status() === 200
      ? await response.json() as Booking
      : ({} as Booking);
    return { response, body, durationMs };
  }

  // Accepts `Booking` (strongly typed). Negative-test payloads that deliberately omit
  // required fields are declared in INVALID_BOOKING_PAYLOADS with `as unknown as Booking`
  // so the intentional misuse is visible in the test-data layer, not here.
  async createBooking(payload: Booking): Promise<ServiceResponse<CreateBookingResponse>> {
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

  async updateBooking(id: number, payload: Booking): Promise<ServiceResponse<Booking>> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.put(`${this.baseUrl}/booking/${id}`, {
        data: payload,
        headers: this.getAuthHeaders(),
      })
    );
    const body = response.status() === 200
      ? await response.json() as Booking
      : ({} as Booking);
    return { response, body, durationMs };
  }

  async updateBookingWithoutAuth(id: number, payload: Booking): Promise<RawServiceResponse> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.put(`${this.baseUrl}/booking/${id}`, {
        data: payload,
        headers: this.jsonHeaders,
      })
    );
    return { response, durationMs };
  }

  async partialUpdateBooking(
    id: number,
    payload: Partial<Booking>
  ): Promise<ServiceResponse<Booking>> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.patch(`${this.baseUrl}/booking/${id}`, {
        data: payload,
        headers: this.getAuthHeaders(),
      })
    );
    const body = response.status() === 200
      ? await response.json() as Booking
      : ({} as Booking);
    return { response, body, durationMs };
  }

  async deleteBooking(id: number): Promise<RawServiceResponse> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.delete(`${this.baseUrl}/booking/${id}`, {
        // getAuthHeaders() includes both JSON headers and Cookie — previously this method
        // only sent Cookie, missing Accept/Content-Type (header inconsistency bug).
        headers: this.getAuthHeaders(),
      })
    );
    return { response, durationMs };
  }

  async deleteBookingWithoutAuth(id: number): Promise<RawServiceResponse> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.delete(`${this.baseUrl}/booking/${id}`)
    );
    return { response, durationMs };
  }
}
