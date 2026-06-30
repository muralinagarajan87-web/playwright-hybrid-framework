import { test } from '../../../src/web/fixtures/pages.fixture';
import { PRODUCTS } from '../../../test-data/web/products';
import { CHECKOUT_USER } from '../../../test-data/web/checkout';

test.describe('Shopping Cart & Checkout Module', () => {
  test('TC_CHECKOUT_001 — verify user can successfully complete the full checkout flow', { tag: ['@sanity', '@regression', '@positive'] }, async ({ inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
    await test.step('Navigate to the inventory page and add the Backpack to the cart', async () => {
      await inventoryPage.navigate();
      await inventoryPage.addProductToCart(PRODUCTS.backpack.dataTestId);
    });

    await test.step('Navigate to the cart and verify the Backpack is listed', async () => {
      await inventoryPage.goToCart();
      await cartPage.expectOnPage();
      await cartPage.expectItemInCart(PRODUCTS.backpack.name);
    });

    await test.step('Click Checkout to proceed to the checkout information page', async () => {
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.expectOnPage();
    });

    await test.step('Fill in first name, last name, and postal code, then click Continue', async () => {
      await checkoutInfoPage.fillCheckoutInfo(
        CHECKOUT_USER.standard.firstName,
        CHECKOUT_USER.standard.lastName,
        CHECKOUT_USER.standard.postalCode,
      );
      await checkoutInfoPage.continue();
    });

    await test.step('Verify the order overview shows the Backpack and a total price', async () => {
      await checkoutOverviewPage.expectOnPage();
      await checkoutOverviewPage.expectItemInSummary(PRODUCTS.backpack.name);
      await checkoutOverviewPage.expectTotalVisible();
    });

    await test.step('Click Finish to place the order', async () => {
      await checkoutOverviewPage.finish();
    });

    await test.step('Verify the order confirmation page is displayed with a success message', async () => {
      await checkoutCompletePage.expectOnPage();
      await checkoutCompletePage.expectOrderConfirmed();
    });
  });

  test('TC_CHECKOUT_002 — verify checkout form validation error when all fields are left empty', { tag: ['@regression', '@negative'] }, async ({ inventoryPage, cartPage, checkoutInfoPage }) => {
    await test.step('Add a product to the cart and navigate to the checkout information page', async () => {
      await inventoryPage.navigate();
      await inventoryPage.addProductToCart(PRODUCTS.backpack.dataTestId);
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.expectOnPage();
    });

    await test.step('Leave all fields empty and click Continue', async () => {
      await checkoutInfoPage.continue();
    });

    await test.step('Verify a validation error message is displayed', async () => {
      await checkoutInfoPage.expectErrorVisible();
    });

    await test.step('Verify the error message text reads "First Name is required"', async () => {
      await checkoutInfoPage.expectErrorContains('First Name is required');
    });
  });

  test('TC_CHECKOUT_003 — verify checkout form validation error when postal code is missing', { tag: ['@regression', '@negative'] }, async ({ inventoryPage, cartPage, checkoutInfoPage }) => {
    await test.step('Add a product to the cart and navigate to the checkout information page', async () => {
      await inventoryPage.navigate();
      await inventoryPage.addProductToCart(PRODUCTS.backpack.dataTestId);
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.expectOnPage();
    });

    await test.step('Fill in first and last name but leave postal code empty, then click Continue', async () => {
      await checkoutInfoPage.fillCheckoutInfo(
        CHECKOUT_USER.missingPostalCode.firstName,
        CHECKOUT_USER.missingPostalCode.lastName,
        CHECKOUT_USER.missingPostalCode.postalCode,
      );
      await checkoutInfoPage.continue();
    });

    await test.step('Verify a validation error message is displayed', async () => {
      await checkoutInfoPage.expectErrorVisible();
    });

    await test.step('Verify the error message text reads "Postal Code is required"', async () => {
      await checkoutInfoPage.expectErrorContains('Postal Code is required');
    });
  });
});
