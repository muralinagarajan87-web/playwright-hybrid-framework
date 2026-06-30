export const CHECKOUT_USER = {
  standard:            { firstName: 'John', lastName: 'Doe',   postalCode: '10001' },
  missingPostalCode:   { firstName: 'Jane', lastName: 'Smith', postalCode: '' },
} as const;
