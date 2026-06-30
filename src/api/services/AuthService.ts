import { BaseService, ServiceResponse } from './BaseService';
import { AuthCredentials } from '../models/Auth';

export class AuthService extends BaseService {
  // createTokenRaw() is the primary test-facing method — it accepts loose credentials
  // so negative tests can pass intentionally malformed payloads (missing fields, empty
  // body, wrong types) without requiring a separate method per invalid shape.
  async createTokenRaw(credentials: Record<string, unknown>): Promise<ServiceResponse<Record<string, unknown>>> {
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
