import { APIRequestContext, APIResponse } from '@playwright/test';

// ── Shared response shapes ──────────────────────────────────────────────────

/** Returned by service methods that always parse a response body. */
export interface ServiceResponse<T> {
  response: APIResponse;
  body: T;
  durationMs: number;
}

/** Returned by service methods that have no meaningful body (DELETE, 4xx-only paths). */
export interface RawServiceResponse {
  response: APIResponse;
  durationMs: number;
}

// ── Base class ───────────────────────────────────────────────────────────────

export class BaseService {
  protected readonly baseUrl: string;
  protected readonly request: APIRequestContext;

  // Centralised default headers — every service method uses this reference,
  // eliminating duplicate header objects across BookingService methods.
  protected readonly jsonHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  } as const;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  protected async measureResponse(
    fn: () => Promise<APIResponse>
  ): Promise<{ response: APIResponse; durationMs: number }> {
    const start = Date.now();
    const response = await fn();
    const durationMs = Date.now() - start;
    return { response, durationMs };
  }

  /**
   * Parses a successful response body using generic typing.
   * Throws immediately with HTTP status + truncated body when the response is not
   * the expected success status — surfaces the real failure at the call site instead
   * of propagating a silent `{} as T` that causes cryptic assertion errors downstream.
   *
   * Use this in NEW service methods. Existing methods retain the conditional body
   * pattern to support negative-test scenarios where callers inspect response.status()
   * directly rather than receiving a parsed body.
   */
  protected async parseResponse<T>(
    response: APIResponse,
    successStatus = 200
  ): Promise<T> {
    if (response.status() === successStatus) {
      return response.json() as Promise<T>;
    }
    const raw  = await response.text();
    const body = raw.length > 500 ? `${raw.substring(0, 500)}… (${raw.length} chars)` : raw;
    throw new Error(`API [${response.status()} ${response.statusText()}] — ${body}`);
  }
}
