import { test } from '../../../src/web/fixtures/pages.fixture';
import { USERS } from '../../../test-data/web/users';
import { PRODUCTS } from '../../../test-data/web/products';
import { CHECKOUT_USER } from '../../../test-data/web/checkout';

test.use({ storageState: { cookies: [], origins: [] } });

test('TC_E2E_WEB_001 — verify the complete end-to-end purchase flow from login to order confirmation', { tag: ['@sanity', '@regression', '@positive'] }, async ({ loginPage, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
  await test.step('Navigate to the login page', async () => {
    await loginPage.navigate();
  });

  await test.step('Login with valid standard user credentials', async () => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);
  });

  await test.step('Verify the inventory page is displayed and no error is shown', async () => {
    await inventoryPage.expectOnPage();
    await loginPage.expectNoError();
  });

  await test.step('Add the Sauce Labs Backpack to the cart', async () => {
    await inventoryPage.addProductToCart(PRODUCTS.backpack.dataTestId);
  });

  await test.step('Verify the cart badge shows 1 and the button changed to "Remove"', async () => {
    await inventoryPage.expectCartCount('1');
    await inventoryPage.expectRemoveButtonVisible(PRODUCTS.backpack.dataTestId);
  });

  await test.step('Navigate to the cart page', async () => {
    await inventoryPage.goToCart();
  });

  await test.step('Verify the Backpack is listed in the cart', async () => {
    await cartPage.expectOnPage();
    await cartPage.expectItemInCart(PRODUCTS.backpack.name);
  });

  await test.step('Click Checkout to proceed to the checkout information page', async () => {
    await cartPage.proceedToCheckout();
    await checkoutInfoPage.expectOnPage();
  });

  await test.step('Fill in checkout information and click Continue', async () => {
    await checkoutInfoPage.fillCheckoutInfo(
      CHECKOUT_USER.standard.firstName,
      CHECKOUT_USER.standard.lastName,
      CHECKOUT_USER.standard.postalCode,
    );
    await checkoutInfoPage.continue();
  });

  await test.step('Verify the order overview shows the Backpack and the total price', async () => {
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
