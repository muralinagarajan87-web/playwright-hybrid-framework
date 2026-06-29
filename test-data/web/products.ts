export const PRODUCTS = {
  backpack: {
    name: 'Sauce Labs Backpack',
    dataTestId: 'sauce-labs-backpack',
    price: '$29.99',
  },
  bikeLight: {
    name: 'Sauce Labs Bike Light',
    dataTestId: 'sauce-labs-bike-light',
    price: '$9.99',
  },
  boltTShirt: {
    name: 'Sauce Labs Bolt T-Shirt',
    dataTestId: 'sauce-labs-bolt-t-shirt',
    price: '$15.99',
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
