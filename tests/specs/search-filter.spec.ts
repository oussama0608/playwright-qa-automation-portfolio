import { test, expect } from '../support/fixtures';
import { BOOKS, SEED_COUNT } from '../support/test-data';

test.describe('Search and filters', () => {
  test('search by name is case-insensitive @smoke', async ({ productsPage }) => {
    await productsPage.waitForList(SEED_COUNT);

    await productsPage.searchFor('MOUSE');

    await expect(productsPage.names).toHaveText(['Wireless Mouse']);
    await expect(productsPage.resultCount).toHaveText('1 product');
  });

  test('category filter shows only matching products', async ({ productsPage }) => {
    await productsPage.filterBy('Books');

    await expect(productsPage.names).toHaveText(BOOKS);
    await expect(productsPage.page.getByTestId('product-category')).toHaveText(['Books', 'Books']);

    await productsPage.filterBy('All');
    await expect(productsPage.rows).toHaveCount(SEED_COUNT);
  });

  test('search and filter combine, and show an empty state when nothing matches', async ({ productsPage }) => {
    await productsPage.filterBy('Electronics');
    await productsPage.searchFor('key');
    await expect(productsPage.names).toHaveText(['Mechanical Keyboard']);

    await productsPage.searchFor('Yoga'); // exists, but in "Sports"
    await expect(productsPage.rows).toHaveCount(0);
    await expect(productsPage.emptyState).toBeVisible();
    await expect(productsPage.resultCount).toHaveText('0 products');
  });

  test('BUG-001: search ignores leading/trailing whitespace', async ({ productsPage }) => {
    // Known application defect – see docs/sample-bug-report.md.
    // test.fail() keeps CI green while the bug is open and alerts us when it gets fixed.
    test.info().annotations.push({ type: 'issue', description: 'BUG-001 – search query is not trimmed' });
    test.fail();

    await productsPage.searchFor('  mouse  ');

    await expect(productsPage.names).toHaveText(['Wireless Mouse'], { timeout: 2_000 });
  });
});
