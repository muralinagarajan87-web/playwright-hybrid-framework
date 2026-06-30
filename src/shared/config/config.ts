export const WEB_CONFIG = {
  baseUrl: process.env.WEB_BASE_URL || 'https://www.saucedemo.com',
};

// Credentials live in test-data/api/auth.ts — single source of truth for all auth payloads.
// Keeping them here as unused duplicates is a two-source-of-truth anti-pattern.
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
  responseTimeThreshold: 5000,
};
