import { test, expect } from '@playwright/test';
import { credentials } from '../support/env';
import { uniqueName } from '../support/test-data';

/** API-level tests: fast, browserless checks of the backend contract. */
test.describe('REST API', () => {
  test('rejects unauthenticated requests @smoke', async ({ request }) => {
    const res = await request.get('/api/products');
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: 'Authentication required' });
  });

  test('rejects invalid credentials', async ({ request }) => {
    const res = await request.post('/api/login', { data: { username: credentials.username, password: 'nope' } });
    expect(res.status()).toBe(401);
  });

  test('full product lifecycle: create → read → update → delete', async ({ request }) => {
    expect((await request.post('/api/login', { data: credentials })).ok()).toBeTruthy();
    const name = uniqueName('API Product');

    const created = await request.post('/api/products', { data: { name, category: 'Sports', price: 10, stock: 3 } });
    expect(created.status()).toBe(201);
    const { id } = await created.json();

    const list = await request.get('/api/products', { params: { q: name } });
    expect(await list.json()).toEqual([{ id, name, category: 'Sports', price: 10, stock: 3 }]);

    const updated = await request.put(`/api/products/${id}`, { data: { name, category: 'Sports', price: 12.345, stock: 0 } });
    expect(updated.status()).toBe(200);
    expect(await updated.json()).toMatchObject({ price: 12.35, stock: 0 });

    expect((await request.delete(`/api/products/${id}`)).status()).toBe(204);
    expect((await request.delete(`/api/products/${id}`)).status()).toBe(404);
  });

  test('returns field-level validation errors', async ({ request }) => {
    await request.post('/api/login', { data: credentials });

    const res = await request.post('/api/products', { data: { name: 'x', category: 'Toys', price: '10', stock: -1 } });

    expect(res.status()).toBe(400);
    expect((await res.json()).fields).toEqual({
      name: 'Name must be 3-60 characters',
      category: 'Select a valid category',
      price: 'Price must be greater than 0',
      stock: 'Stock must be a whole number of 0 or more',
    });
  });

  test('responds with security headers', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['content-security-policy']).toContain("default-src 'self'");
  });
});
