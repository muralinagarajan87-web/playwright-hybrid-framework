import { test, expect } from '../../../src/api/fixtures/api.fixture';
import { AUTH_CREDENTIALS } from '../../../test-data/api/auth';
import { API_CONFIG } from '../../../src/shared/config/config';
import { assertSchema, authSuccessSchema, authErrorSchema } from '../../../src/api/models/schemas/booking.schemas';

test.describe('Authentication — POST /auth', () => {
  test('TC_AUTH_001 — verify a valid auth token is returned with correct credentials', { tag: ['@sanity', '@regression', '@positive'] }, async ({ authService }) => {
    const { response, body, durationMs } = await authService.createTokenRaw(AUTH_CREDENTIALS.valid);

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: AJV validates the full structure against the published API contract
    assertSchema(authSuccessSchema, body);
    // L5 — Contract: no error reason field present on a successful auth response
    expect(body).not.toHaveProperty('reason');
    // L6 — Business logic: token must be a non-empty alphanumeric string — not garbage data
    expect(body.token).toMatch(/^[a-zA-Z0-9]+$/);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_AUTH_002 — verify authentication is rejected with an invalid password', { tag: ['@sanity', '@regression', '@negative'] }, async ({ authService }) => {
    const { response, body, durationMs } = await authService.createTokenRaw(AUTH_CREDENTIALS.invalidPassword);

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: AJV validates the full error structure
    assertSchema(authErrorSchema, body);
    // L5 — Contract: exact error message documented by API; no token issued
    expect(body.reason).toBe('Bad credentials');
    expect(body).not.toHaveProperty('token');
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_AUTH_003 — verify authentication is rejected when the username field is missing', { tag: ['@regression', '@negative'] }, async ({ authService }) => {
    const { response, body, durationMs } = await authService.createTokenRaw(AUTH_CREDENTIALS.missingUsername);

    // L2 — Status code
    expect(response.status()).toBe(200);
    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L4 — Response schema: structured error response must match the error contract
    assertSchema(authErrorSchema, body);
    // L5 — Contract: missing required field treated as bad credentials; no token issued
    expect(body.reason).toBe('Bad credentials');
    expect(body).not.toHaveProperty('token');
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('TC_AUTH_004 — verify authentication handles an empty request body without crashing', { tag: ['@regression', '@negative'] }, async ({ authService }) => {
    const { response, body, durationMs } = await authService.createTokenRaw(AUTH_CREDENTIALS.empty);

    // L3 — Response time
    expect(durationMs).toBeLessThan(API_CONFIG.responseTimeThreshold);
    // L6 — Business logic: server must not crash (500); must not issue a token
    expect(response.status()).not.toBe(500);
    expect(body).not.toHaveProperty('token');
    // L4 — Response schema: even for empty input the API returns a structured error body
    assertSchema(authErrorSchema, body);
    // L8 — Headers
    expect(response.headers()['content-type']).toContain('application/json');
  });
});
