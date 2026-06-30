import { test, expect } from '@web/fixtures/pages.fixture';
import { PRODUCTS } from '@data/web/products';

test.describe('Product Catalog Module', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.navigate();
  });

  test('TC_CAT_001 — verify a product can be added to the cart', { tag: ['@sanity', '@regression', '@positive'] }, async ({ inventoryPage }) => {
    await test.step('Click "Add to cart" for the Sauce Labs Backpack', async () => {
      await inventoryPage.addProductToCart(PRODUCTS.backpack.dataTestId);
    });

    await test.step('Verify the cart badge displays a count of 1', async () => {
      await inventoryPage.expectCartCount('1');
    });

    await test.step('Verify the "Add to cart" button changed to "Remove"', async () => {
      await inventoryPage.expectRemoveButtonVisible(PRODUCTS.backpack.dataTestId);
    });
  });

  test('TC_CAT_002 — verify multiple products can be added to the cart independently', { tag: ['@regression', '@positive'] }, async ({ inventoryPage }) => {
    await test.step('Add the Sauce Labs Backpack to the cart', async () => {
      await inventoryPage.addProductToCart(PRODUCTS.backpack.dataTestId);
    });

    await test.step('Verify the cart badge displays a count of 1', async () => {
      await inventoryPage.expectCartCount('1');
    });

    await test.step('Add the Sauce Labs Bike Light to the cart', async () => {
      await inventoryPage.addProductToCart(PRODUCTS.bikeLight.dataTestId);
    });

    await test.step('Verify the cart badge displays a count of 2', async () => {
      await inventoryPage.expectCartCount('2');
    });

    await test.step('Add the Sauce Labs Bolt T-Shirt to the cart', async () => {
      await inventoryPage.addProductToCart(PRODUCTS.boltTShirt.dataTestId);
    });

    await test.step('Verify the cart badge displays a count of 3', async () => {
      await inventoryPage.expectCartCount('3');
    });
  });

  test('TC_CAT_003 — verify cart badge is hidden and cart is empty when no products are added', { tag: ['@regression', '@negative'] }, async ({ inventoryPage, cartPage }) => {
    await test.step('Verify the cart badge is not visible on the inventory page', async () => {
      await inventoryPage.expectCartBadgeHidden();
    });

    await test.step('Navigate to the cart page', async () => {
      await inventoryPage.goToCart();
    });

    await test.step('Verify the cart page shows no items', async () => {
      await cartPage.expectCartEmpty();
    });
  });

  test('TC_CAT_004 — verify all product details are correctly displayed on the products page', { tag: ['@regression', '@positive'] }, async ({ inventoryPage }) => {
    await test.step('Verify at least one product is listed on the page', async () => {
      await expect(inventoryPage.inventoryItems).not.toHaveCount(0);
    });

    await test.step('Verify the first product has a non-empty name', async () => {
      await expect(inventoryPage.productName(0)).not.toBeEmpty();
    });

    await test.step('Verify the first product price contains a "$" symbol', async () => {
      await expect(inventoryPage.productPrice(0)).toContainText('$');
    });

    await test.step('Verify the "Add to cart" button for the Backpack is enabled', async () => {
      await expect(inventoryPage.addToCartButton(PRODUCTS.backpack.dataTestId)).toBeEnabled();
    });
  });
});
