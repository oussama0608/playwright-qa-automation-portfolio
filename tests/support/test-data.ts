export type Category = 'Electronics' | 'Books' | 'Home' | 'Sports';

export interface ProductInput {
  name: string;
  category: Category;
  price: string;
  stock: string;
}

/** Seed data the app starts with for every new session (see app/server.js). */
export const SEED_COUNT = 8;
export const BOOKS = ['Clean Code', 'The Pragmatic Programmer'];

let counter = 0;
/** Unique, readable names so failures are easy to trace in reports. */
export function uniqueName(prefix = 'QA Product'): string {
  counter += 1;
  return `${prefix} ${Date.now().toString(36)}-${counter}`;
}

export function buildProduct(overrides: Partial<ProductInput> = {}): ProductInput {
  return { name: uniqueName(), category: 'Electronics', price: '49.99', stock: '10', ...overrides };
}
