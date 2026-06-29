export const AUTH_CREDENTIALS = {
  valid: {
    username: 'admin',
    password: 'password123',
  },
  invalidPassword: {
    username: 'admin',
    password: 'wrongpassword',
  },
  missingUsername: {
    password: 'password123',
  },
  missingPassword: {
    username: 'admin',
  },
  empty: {},
} as const;
