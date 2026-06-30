import { Locator, expect } from '@playwright/test';

/**
 * Reusable component for the cart item card pattern that appears on both
 * CartPage ([data-test="cart-item"]) and CheckoutOverviewPage.
 *
 * Encapsulates the locator strategy in one place — if SauceDemo renames
 * [data-test="inventory-item-name"], the fix is made here only.
 */
export class CartItemComponent {
  private readonly nameLocator: Locator;

  constructor(container: Locator) {
    // Scope to within the provided container (e.g. the list of cart items),
    // not the whole page — prevents false matches if item names appear elsewhere.
    this.nameLocator = container.locator('[data-test="inventory-item-name"]');
  }

  async expectProductVisible(productName: string): Promise<void> {
    await expect(this.nameLocator.filter({ hasText: productName })).toBeVisible();
  }

  // Returns the name of the FIRST matched item inside the container.
  // If the container holds multiple items, use filter({ hasText }) on the locator directly
  // rather than calling this method and comparing — innerText() silently picks the first.
  async getFirstProductName(): Promise<string> {
    return this.nameLocator.first().innerText();
  }
}
