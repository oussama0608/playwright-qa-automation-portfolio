# BUG-001: Product search returns no results when the query has leading/trailing spaces

| Field | Value |
|---|---|
| **Severity** | Minor (S3): functional defect with an easy workaround |
| **Priority** | Medium (P3): common with copy-pasted text and mobile keyboards |
| **Status** | Open |
| **Component** | Products → Search (backend `GET /api/products?q=`) |
| **Environment** | QA Demo Store v1.0.0 · Chromium 159 (Playwright 1.65.1) / Windows 11 · local (`http://localhost:3000`) |
| **Reproducibility** | 100% (5/5 attempts) |
| **Detected by** | Automated test `search-filter.spec.ts › BUG-001` |

## Summary
Searching for `"  mouse  "` (with surrounding spaces) shows **"No products match your search"**, although the product *Wireless Mouse* exists. Searching for `"mouse"` works as expected.

## Steps to reproduce
1. Sign in as a standard user.
2. Open **Products**.
3. Type `  mouse  ` (two spaces before and after) into **Search products**.

## Expected result
The list shows **1 product: Wireless Mouse**. Surrounding whitespace is ignored, as on most search inputs.

## Actual result
The list is empty and shows "0 products" and "No products match your search."

## Evidence
- API: `GET /api/products?q=%20%20mouse%20%20&category=All` → `200 []`
- Playwright trace / screenshot / video attached (from `test-results/…BUG-001…/`)

## Root cause (analysis)
`app/server.js` lower-cases the `q` parameter but does **not trim** it before the `includes()` comparison.

## Suggested fix
Trim the query on the server (`q.trim()`), and optionally on the client as well. The automated test is already in place as a regression check. Once fixed, remove `test.fail()` from the test.

## Impact
Users who paste product names (often with trailing spaces) believe the product does not exist. This may lead to duplicate products being created.
