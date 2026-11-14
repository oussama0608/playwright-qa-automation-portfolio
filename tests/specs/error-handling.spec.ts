import { test, expect } from '../support/fixtures';
import { buildProduct, SEED_COUNT } from '../support/test-data';

/**
 * Failure scenarios are simulated with network interception (page.route),
 * so they are deterministic – no real outages, no arbitrary waits.
 */
test.describe('Error handling', () => {
  test('server error on load shows a banner and Retry recovers', async ({ page, productsPage }) => {
    await page.route('**/api/products?*', (route) =>
      route.fulfill({ status: 500, json: { error: 'Internal server error' } }));

    await productsPage.filterBy('Books'); // triggers a new request that fails
    await expect(productsPage.errorBanner).toContainText('Could not load products');

    await page.unroute('**/api/products?*');
    await productsPage.retryButton.click();

    await expect(productsPage.errorBanner).toBeHidden();
    await expect(productsPage.rows).toHaveCount(2);
  });

  test('network failure while saving keeps the form open with user input', async ({ page, productsPage }) => {
    const product = buildProduct();
    await page.route('**/api/products', (route) =>
      route.request().method() === 'POST' ? route.abort('internetdisconnected') : route.continue());

    await productsPage.createProduct(product);

    const { form } = productsPage;
    await expect(form.formError).toHaveText('Could not save product. Check your connection and try again.');
    await expect(form.dialog).toBeVisible();
    await expect(form.name).toHaveValue(product.name);
    await expect(form.save).toBeEnabled();
  });

  test('server-side validation errors are shown next to the field', async ({ page, productsPage }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({ status: 400, json: { error: 'Validation failed', fields: { name: 'Name already exists' } } }));

    await productsPage.createProduct(buildProduct());

    await expect(productsPage.form.fieldError('name')).toHaveText('Name already exists');
    await expect(productsPage.form.dialog).toBeVisible();
  });

  test('expired session redirects to login', async ({ page, productsPage }) => {
    await expect(productsPage.rows).toHaveCount(SEED_COUNT);
    await page.context().clearCookies();

    await productsPage.searchFor('mug');

    await expect(page).toHaveURL(/\/login\?next=%2Fproducts$/);
  });
});
