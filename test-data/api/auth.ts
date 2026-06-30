export const AUTH_CREDENTIALS = {
  valid: {
    username: 'admin',
    password: 'password123',
  },
  // ── Invalid credential combinations ────────────────────────────────────────
  // Each entry tests a different failure path through the auth endpoint.
  // TC_AUTH_002: wrong password with valid username
  invalidPassword: {
    username: 'admin',
    password: 'wrongpassword',
  },
  // TC_AUTH_006: wrong username with valid password (symmetric to invalidPassword)
  invalidUsername: {
    username: 'nonexistent_user',
    password: 'password123',
  },
  // ── Missing field combinations ──────────────────────────────────────────────
  // TC_AUTH_003: omitted username — server receives only password
  missingUsername: {
    password: 'password123',
  },
  // TC_AUTH_005: omitted password — server receives only username
  missingPassword: {
    username: 'admin',
  },
  // TC_AUTH_004: completely empty body — server receives {}
  empty: {},
} as const;
