import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  // No data-test on the title span — Priority 7 (visible text) is the next valid strategy
  readonly pageTitle: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle      = page.getByText('Products', { exact: true });
    this.cartBadge      = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink       = page.locator('[data-test="shopping-cart-link"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown   = page.locator('[data-test="product-sort-container"]');
  }

  addToCartButton(productId: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${productId}"]`);
  }

  removeButton(productId: string): Locator {
    return this.page.locator(`[data-test="remove-${productId}"]`);
  }

  productName(index: number): Locator {
    return this.inventoryItems.nth(index).locator('[data-test="inventory-item-name"]');
  }

  productPrice(index: number): Locator {
    return this.inventoryItems.nth(index).locator('[data-test="inventory-item-price"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async addProductToCart(productId: string): Promise<void> {
    await this.addToCartButton(productId).click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async expectOnPage(): Promise<void> {
    await this.page.waitForURL('**/inventory.html');
    await expect(this.pageTitle).toBeVisible();
  }

  async expectCartCount(count: string): Promise<void> {
    await expect(this.cartBadge).toHaveText(count);
  }

  async expectCartBadgeHidden(): Promise<void> {
    await expect(this.cartBadge).toBeHidden();
  }

  async expectRemoveButtonVisible(productId: string): Promise<void> {
    await expect(this.removeButton(productId)).toBeVisible();
  }
}
