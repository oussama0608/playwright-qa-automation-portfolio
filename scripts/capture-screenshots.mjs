// Deterministic portfolio screenshots (no LLM involved).
// Usage: npm run test   (to generate playwright-report/)  then  npm run screenshots
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

try { process.loadEnvFile(); } catch { /* optional */ }
const PORT = Number(process.env.SCREENSHOT_PORT ?? 3100);
const BASE = `http://localhost:${PORT}`;
const OUT = resolve('docs/screenshots');
const user = process.env.DEMO_USER ?? 'qa_user';
const pass = process.env.DEMO_PASS ?? 'ChangeMe123!';
mkdirSync(OUT, { recursive: true });

const server = spawn(process.execPath, ['app/server.js'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
const browser = await chromium.launch();
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${BASE}/api/health`)).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });

  await page.goto(`${BASE}/login`);
  await page.screenshot({ path: `${OUT}/01-login.png` });

  await page.getByLabel('Username').fill(user);
  await page.getByLabel('Password').fill(pass);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByTestId('product-row').first().waitFor();
  await page.screenshot({ path: `${OUT}/02-products.png` });

  await page.getByRole('button', { name: 'Add product' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await page.getByTestId('error-name').getByText('Name must').waitFor();
  await page.screenshot({ path: `${OUT}/03-form-validation.png` });

  const report = resolve('playwright-report/index.html');
  if (existsSync(report)) {
    await page.goto(pathToFileURL(report).href);
    await page.getByText('chromium').first().waitFor();
    await page.screenshot({ path: `${OUT}/04-html-report.png`, fullPage: true });
  } else {
    console.warn('No playwright-report/ found – run "npm test" first to capture the report screenshot.');
  }
  console.log(`Screenshots saved to ${OUT}`);
} finally {
  await browser.close();
  server.kill();
}
