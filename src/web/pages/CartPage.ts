import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly itemName: Locator;

  constructor(private readonly page: Page) {
    this.cartItems              = page.locator('[data-test="cart-item"]');
    this.checkoutButton         = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.itemName               = page.locator('[data-test="inventory-item-name"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async expectOnPage(): Promise<void> {
    await this.page.waitForURL('**/cart.html');
  }

  async expectItemInCart(productName: string): Promise<void> {
    await expect(this.itemName.filter({ hasText: productName })).toBeVisible();
  }

  async expectCartEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }
}
