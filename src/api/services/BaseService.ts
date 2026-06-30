import { APIRequestContext, APIResponse } from '@playwright/test';

export class BaseService {
  protected readonly baseUrl: string;
  protected readonly request: APIRequestContext;

  // Centralised default headers — every service method uses these directly,
  // eliminating the duplicate copies that previously lived in BookingService.
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
}
