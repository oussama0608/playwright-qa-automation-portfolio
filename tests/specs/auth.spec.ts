import { test, expect } from '../support/fixtures';
import { credentials } from '../support/env';
import { ProductsPage } from '../pages/ProductsPage';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('valid credentials sign the user in @smoke', async ({ page, loginPage }) => {
    await loginPage.login(credentials.username, credentials.password);

    const products = new ProductsPage(page);
    await expect(page).toHaveURL(/\/products$/);
    await expect(products.heading).toBeVisible();
    await expect(products.currentUser).toHaveText(credentials.username);
  });

  test('wrong password shows an error and keeps the user on the login page @smoke', async ({ page, loginPage }) => {
    await loginPage.login(credentials.username, 'definitely-wrong');

    await expect(loginPage.error).toHaveText('Invalid username or password');
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.password).toHaveValue('definitely-wrong');
  });

  test('empty form shows required-field validation without calling the API', async ({ page, loginPage }) => {
    let loginCalls = 0;
    page.on('request', (req) => { if (req.url().endsWith('/api/login')) loginCalls += 1; });

    await loginPage.submit.click();

    await expect(loginPage.usernameError).toHaveText('Username is required');
    await expect(loginPage.passwordError).toHaveText('Password is required');
    await expect(loginPage.username).toHaveAttribute('aria-invalid', 'true');
    expect(loginCalls).toBe(0);
  });

  test('logout ends the session and protects private pages', async ({ page, loginPage }) => {
    await loginPage.login(credentials.username, credentials.password);
    const products = new ProductsPage(page);
    await expect(products.heading).toBeVisible();

    await products.logoutButton.click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/products');
    await expect(page).toHaveURL(/\/login\?next=%2Fproducts$/);
  });
});
