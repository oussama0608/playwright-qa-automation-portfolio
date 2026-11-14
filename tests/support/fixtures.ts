import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { credentials } from './env';

type Fixtures = {
  loginPage: LoginPage;
  /** Products page with an authenticated session (login via API = fast & stable). */
  productsPage: ProductsPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    // page.request shares cookies with the browser context, so the UI is logged in too.
    const res = await page.request.post('/api/login', { data: credentials });
    expect(res.ok(), 'API login should succeed (check DEMO_USER / DEMO_PASS)').toBeTruthy();
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await productsPage.waitForList();
    await use(productsPage);
  },
});

export { expect };
