import { test, expect } from '../support/fixtures';
import { credentials } from '../support/env';

test.describe('Navigation', () => {
  test('main menu moves between Products and About @smoke', async ({ page, productsPage }) => {
    const nav = page.getByRole('navigation', { name: 'Main' });

    await nav.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { name: 'About this app' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');

    await nav.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL(/\/products$/);
    await expect(productsPage.heading).toBeVisible();
  });

  test('unknown route returns a friendly 404 page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('deep link survives the login redirect', async ({ page, loginPage }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/login\?next=%2Fabout$/);

    await loginPage.login(credentials.username, credentials.password);

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByTestId('app-version')).toHaveText('Version 1.0.0');
  });
});
