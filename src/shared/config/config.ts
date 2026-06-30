export const WEB_CONFIG = {
  baseUrl: process.env.WEB_BASE_URL || 'https://www.saucedemo.com',
};

export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
  username: process.env.API_USERNAME || 'admin',
  password: process.env.API_PASSWORD || 'password123',
  responseTimeThreshold: 5000,
};
