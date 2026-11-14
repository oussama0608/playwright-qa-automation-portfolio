import { test, expect } from '../support/fixtures';
import { buildProduct, SEED_COUNT } from '../support/test-data';

test.describe('Product management (CRUD)', () => {
  test('create a product @smoke', async ({ productsPage }) => {
    const product = buildProduct({ category: 'Home', price: '15.5', stock: '7' });

    await productsPage.createProduct(product);

    await expect(productsPage.form.dialog).toBeHidden();
    await expect(productsPage.toast).toHaveText('Product created');
    const row = productsPage.row(product.name);
    await expect(row.getByTestId('product-category')).toHaveText('Home');
    await expect(row.getByTestId('product-price')).toHaveText('$15.50');
    await expect(row.getByTestId('product-stock')).toHaveText('7');
    await expect(productsPage.rows).toHaveCount(SEED_COUNT + 1);
  });

  test('form validation blocks invalid data', async ({ page, productsPage }) => {
    let writes = 0;
    page.on('request', (req) => { if (req.url().includes('/api/products') && req.method() !== 'GET') writes += 1; });

    await productsPage.addButton.click();
    const { form } = productsPage;
    await form.fill({ name: 'ab', price: '-5', stock: '2.5' });
    await form.save.click();

    await expect(form.fieldError('name')).toHaveText('Name must be 3-60 characters');
    await expect(form.fieldError('category')).toHaveText('Select a valid category');
    await expect(form.fieldError('price')).toHaveText('Price must be greater than 0');
    await expect(form.fieldError('stock')).toHaveText('Stock must be a whole number of 0 or more');
    await expect(form.name).toBeFocused();
    await expect(form.dialog).toBeVisible();

    // Fixing one field clears only that error on the next submit.
    await form.fill({ name: 'Valid name' });
    await form.save.click();
    await expect(form.fieldError('name')).toBeEmpty();
    await expect(form.fieldError('price')).not.toBeEmpty();

    await form.cancel.click();
    await expect(productsPage.rows).toHaveCount(SEED_COUNT);
    expect(writes).toBe(0);
  });

  test('edit an existing product', async ({ productsPage }) => {
    await productsPage.editProduct('Desk Lamp', { price: '34', stock: '15' });

    await expect(productsPage.toast).toHaveText('Product updated');
    const row = productsPage.row('Desk Lamp');
    await expect(row.getByTestId('product-price')).toHaveText('$34.00');
    await expect(row.getByTestId('product-stock')).toHaveText('15');
  });

  test('delete asks for confirmation and removes the product', async ({ productsPage }) => {
    // Cancel keeps the record
    await productsPage.requestDelete('Yoga Mat');
    await productsPage.confirmDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(productsPage.row('Yoga Mat')).toHaveCount(1);

    // Confirm removes it
    await productsPage.requestDelete('Yoga Mat');
    await expect(productsPage.confirmDialog).toContainText('Delete "Yoga Mat"?');
    await productsPage.confirmDialog.getByRole('button', { name: 'Delete' }).click();

    await expect(productsPage.toast).toHaveText('Product deleted');
    await expect(productsPage.row('Yoga Mat')).toHaveCount(0);
    await expect(productsPage.rows).toHaveCount(SEED_COUNT - 1);
  });
});
