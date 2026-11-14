import { defineConfig, devices } from '@playwright/test';

// Load local overrides from .env if present (never committed). Node >= 20.12.
try { process.loadEnvFile(); } catch { /* .env is optional */ }

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: isCI,                 // fail CI if a stray test.only is committed
  retries: isCI ? 2 : 0,            // limited retries, CI only – flaky tests are flagged in the report
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-testid',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  // Starts the local demo app automatically. Set BASE_URL to test a deployed environment instead.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'node app/server.js',
        url: `${BASE_URL}/api/health`,
        reuseExistingServer: !isCI,
        timeout: 30_000,
        env: { PORT: String(PORT) },
      },
});
