import { expect, type Locator, type Page } from '@playwright/test';
import type { ProductInput } from '../support/test-data';

/** The add/edit product modal. */
export class ProductForm {
  readonly dialog: Locator;
  readonly title: Locator;
  readonly name: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly stock: Locator;
  readonly save: Locator;
  readonly cancel: Locator;
  readonly formError: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /product/i });
    this.title = this.dialog.getByRole('heading');
    this.name = this.dialog.getByLabel('Name');
    this.category = this.dialog.getByLabel('Category');
    this.price = this.dialog.getByLabel('Price (USD)');
    this.stock = this.dialog.getByLabel('Stock');
    this.save = this.dialog.getByRole('button', { name: 'Save' });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
    this.formError = this.dialog.getByTestId('form-error');
  }

  fieldError(field: 'name' | 'category' | 'price' | 'stock'): Locator {
    return this.dialog.getByTestId(`error-${field}`);
  }

  async fill(data: Partial<ProductInput>) {
    if (data.name !== undefined) await this.name.fill(data.name);
    if (data.category !== undefined) await this.category.selectOption(data.category);
    if (data.price !== undefined) await this.price.fill(data.price);
    if (data.stock !== undefined) await this.stock.fill(data.stock);
  }
}

export class ProductsPage {
  readonly heading: Locator;
  readonly search: Locator;
  readonly categoryFilter: Locator;
  readonly addButton: Locator;
  readonly rows: Locator;
  readonly names: Locator;
  readonly emptyState: Locator;
  readonly resultCount: Locator;
  readonly errorBanner: Locator;
  readonly retryButton: Locator;
  readonly toast: Locator;
  readonly currentUser: Locator;
  readonly logoutButton: Locator;
  readonly form: ProductForm;
  readonly confirmDialog: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Products', level: 1 });
    this.search = page.getByRole('searchbox', { name: 'Search products' });
    this.categoryFilter = page.getByRole('combobox', { name: 'Filter by category' });
    this.addButton = page.getByRole('button', { name: 'Add product' });
    this.rows = page.getByTestId('product-row');
    this.names = page.getByTestId('product-name');
    this.emptyState = page.getByTestId('empty-state');
    this.resultCount = page.getByTestId('result-count');
    this.errorBanner = page.getByTestId('error-banner');
    this.retryButton = this.errorBanner.getByRole('button', { name: 'Retry' });
    this.toast = page.getByTestId('toast');
    this.currentUser = page.getByTestId('current-user');
    this.logoutButton = page.getByRole('button', { name: 'Log out' });
    this.form = new ProductForm(page);
    this.confirmDialog = page.getByRole('dialog', { name: 'Delete product' });
  }

  async goto() {
    await this.page.goto('/products');
    await expect(this.heading).toBeVisible();
  }

  /** Waits until the initial product list has rendered. */
  async waitForList(expectedCount?: number) {
    await expect(this.resultCount).toHaveText(/\d+ products?/);
    if (expectedCount !== undefined) await expect(this.rows).toHaveCount(expectedCount);
  }

  row(name: string): Locator {
    return this.rows.filter({ has: this.page.getByTestId('product-name').getByText(name, { exact: true }) });
  }

  async searchFor(text: string) {
    await this.search.fill(text);
  }

  async filterBy(category: string) {
    await this.categoryFilter.selectOption(category);
  }

  async createProduct(data: ProductInput) {
    await this.addButton.click();
    await expect(this.form.title).toHaveText('Add product');
    await this.form.fill(data);
    await this.form.save.click();
  }

  async editProduct(name: string, changes: Partial<ProductInput>) {
    await this.page.getByRole('button', { name: `Edit ${name}`, exact: true }).click();
    await expect(this.form.title).toHaveText('Edit product');
    await this.form.fill(changes);
    await this.form.save.click();
  }

  async requestDelete(name: string) {
    await this.page.getByRole('button', { name: `Delete ${name}`, exact: true }).click();
    await expect(this.confirmDialog).toBeVisible();
  }
}
