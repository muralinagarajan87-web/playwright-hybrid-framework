import { APIResponse } from '@playwright/test';
import { BaseService } from './BaseService';
import { AuthCredentials } from '../models/Auth';

export class AuthService extends BaseService {
  async createToken(credentials: AuthCredentials): Promise<string> {
    const { response } = await this.measureResponse(() =>
      this.request.post(`${this.baseUrl}/auth`, {
        data: credentials,
        headers: this.jsonHeaders,
      })
    );
    const body = await response.json();
    if (!body.token) throw new Error(`Auth failed: ${body.reason}`);
    return body.token as string;
  }

  async createTokenRaw(credentials: object): Promise<{
    response: APIResponse;
    body: Record<string, unknown>;
    durationMs: number;
  }> {
    const { response, durationMs } = await this.measureResponse(() =>
      this.request.post(`${this.baseUrl}/auth`, {
        data: credentials,
        headers: this.jsonHeaders,
      })
    );
    const body = await response.json() as Record<string, unknown>;
    return { response, body, durationMs };
  }
}
