export const API_ENDPOINTS = {
  auth:       '/auth',
  booking:    '/booking',
  ping:       '/ping',
  bookingById: (id: number): string => `/booking/${id}`,
} as const;
