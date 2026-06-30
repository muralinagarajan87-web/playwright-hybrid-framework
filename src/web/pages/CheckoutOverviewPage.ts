import { Page, Locator, expect } from '@playwright/test';
import { CartItemComponent } from '../components/CartItemComponent';

export class CheckoutOverviewPage {
  readonly cartItems: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoValue: Locator;

  constructor(private readonly page: Page) {
    // SauceDemo uses [data-test="inventory-item"] on both cart and overview pages —
    // [data-test="cart-item"] does not exist in the DOM.
    this.cartItems         = page.locator('[data-test="inventory-item"]');
    this.totalLabel        = page.locator('[data-test="total-label"]');
    this.finishButton      = page.locator('[data-test="finish"]');
    this.cancelButton      = page.locator('[data-test="cancel"]');
    this.paymentInfoValue  = page.locator('[data-test="payment-info-value"]');
    this.shippingInfoValue = page.locator('[data-test="shipping-info-value"]');
    // summaryItemName removed — CartItemComponent owns this locator strategy, shared with
    // CartPage. Both pages target [data-test="inventory-item-name"] inside cart items;
    // centralising it means a single rename fixes both pages.
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOnPage(): Promise<void> {
    await this.page.waitForURL('**/checkout-step-two.html');
  }

  async expectItemInSummary(productName: string): Promise<void> {
    await new CartItemComponent(this.cartItems).expectProductVisible(productName);
  }

  async expectTotalVisible(): Promise<void> {
    await expect(this.totalLabel).toBeVisible();
  }
}
