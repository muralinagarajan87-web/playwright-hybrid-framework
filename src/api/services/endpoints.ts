export const API_ENDPOINTS = {
  auth:        '/auth',
  booking:     '/booking',
  bookingById: (id: number): string => `/booking/${id}`,
} as const;
