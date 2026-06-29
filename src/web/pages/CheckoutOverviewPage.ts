import { Page, Locator, expect } from '@playwright/test';

export class CheckoutOverviewPage {
  readonly cartItems: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoValue: Locator;
  readonly summaryItemName: Locator;

  constructor(private readonly page: Page) {
    this.cartItems         = page.locator('[data-test="cart-item"]');
    this.totalLabel        = page.locator('[data-test="total-label"]');
    this.finishButton      = page.locator('[data-test="finish"]');
    this.cancelButton      = page.locator('[data-test="cancel"]');
    this.paymentInfoValue  = page.locator('[data-test="payment-info-value"]');
    this.shippingInfoValue = page.locator('[data-test="shipping-info-value"]');
    this.summaryItemName   = page.locator('[data-test="inventory-item-name"]');
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOnPage(): Promise<void> {
    await this.page.waitForURL('**/checkout-step-two.html');
  }

  async expectItemInSummary(productName: string): Promise<void> {
    await expect(this.summaryItemName.filter({ hasText: productName })).toBeVisible();
  }

  async expectTotalVisible(): Promise<void> {
    await expect(this.totalLabel).toBeVisible();
  }
}
