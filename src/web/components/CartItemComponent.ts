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

  async getProductName(): Promise<string> {
    return this.nameLocator.innerText();
  }
}
