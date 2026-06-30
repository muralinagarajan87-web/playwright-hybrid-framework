import { Page, Locator, expect } from '@playwright/test';
import { CartItemComponent } from '../components/CartItemComponent';

export class CartPage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    // SauceDemo uses [data-test="inventory-item"] as the cart item wrapper —
    // [data-test="cart-item"] does not exist in the DOM.
    this.cartItems              = page.locator('[data-test="inventory-item"]');
    this.checkoutButton         = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    // itemName removed — CartItemComponent owns the name locator strategy so a rename
    // of [data-test="inventory-item-name"] is fixed in one place, not two page classes.
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
    await new CartItemComponent(this.cartItems).expectProductVisible(productName);
  }

  async expectCartEmpty(): Promise<void> {
    await expect(this.cartItems).toHaveCount(0);
  }
}
