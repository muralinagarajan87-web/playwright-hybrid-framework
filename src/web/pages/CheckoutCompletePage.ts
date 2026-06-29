import { Page, Locator, expect } from '@playwright/test';

export class CheckoutCompletePage {
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backToProductsButton: Locator;

  constructor(private readonly page: Page) {
    this.completeHeader       = page.locator('[data-test="complete-header"]');
    this.completeText         = page.locator('[data-test="complete-text"]');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }

  async expectOnPage(): Promise<void> {
    await this.page.waitForURL('**/checkout-complete.html');
  }

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    await expect(this.completeText).toBeVisible();
    await expect(this.backToProductsButton).toBeVisible();
  }
}
