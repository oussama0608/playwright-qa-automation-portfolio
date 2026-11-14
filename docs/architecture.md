# Architecture & design decisions

## Layers

```
 specs (what to test)          tests/specs/*.spec.ts
   │   uses
 fixtures (setup/teardown)     tests/support/fixtures.ts   ← API login, page objects
   │   uses
 page objects (how to interact) tests/pages/*.ts
   │
 Playwright Test runner        playwright.config.ts        ← retries, reporters, artifacts, webServer
   │
 Application under test        app/server.js (+ public/)
```

- **Specs** read like test cases: arrange → act → assert. They contain no CSS selectors.
- **Page Objects** expose *locators and user intents* (`createProduct`, `requestDelete`). Assertions stay in specs, except "page is ready" checks.
- **Fixtures** handle authentication and object creation, so each spec states only what it needs (`{ productsPage }`).

## Locator strategy (in priority order)

1. `getByRole(..., { name })`: mirrors how users and assistive tech see the page, and is resilient to markup changes.
2. `getByLabel`: form fields.
3. `getByTestId`: dynamic content without an accessible name (rows, counters, banners).
4. CSS/XPath: not used.

## Stability rules

| Rule | How it is enforced |
|---|---|
| No fixed sleeps | Web-first assertions (`toHaveText`, `toHaveCount`) auto-retry |
| No shared state | Server creates an isolated dataset per login session |
| No order dependency | `fullyParallel: true`; every test sets up its own state |
| Deterministic failures | `page.route()` to simulate 500 / 400 / 401 / network loss |
| Stale responses | App ignores out-of-order search responses; tests assert final state |
| Retries can't hide flakes | Retries only in CI (2); flaky tests are labelled in the report |

## Configuration & secrets

- `process.loadEnvFile()` (built into Node ≥ 20.12) loads `.env`, so no dotenv dependency is needed.
- `BASE_URL` switches the suite from the local app to any deployed environment.
- CI reads `DEMO_USER` / `DEMO_PASS` from GitHub Secrets.

## Cost & token efficiency

- Test runs are **100% deterministic**: no LLM calls at runtime and no paid APIs.
- AI assistance is used at *authoring* time only (drafting tests and documentation), then reviewed and executed.
- Repetitive tasks are handled by scripts (`npm run screenshots`, `npm run estimate`), not by prompts.

## Adapting to a client project

1. Set `BASE_URL` to the client's staging environment and remove the `webServer` block.
2. Replace `tests/pages/*` with Page Objects for the client's screens.
3. Replace the API-login fixture with the client's auth flow (or `storageState`).
4. Keep `playwright.config.ts`, the CI workflow and the reporting as they are.
