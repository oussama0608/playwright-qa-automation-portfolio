# Test Execution Report: QA Demo Store v1.0.0

**Date:** 2026-11-14 · **Environment:** local (`http://localhost:3000`) · **Browser:** Chromium (Desktop Chrome profile) · **Build:** `main`

## Executive summary

The application is **stable for release**, with one minor known defect (BUG-001). All critical user journeys (login, product management, error recovery) pass. The suite showed no flakiness in a 5× repeated run.

| Metric | Result |
|---|---|
| Total tests | 24 |
| Passed | 23 |
| Expected failure (known bug) | 1 (BUG-001) |
| Failed | 0 |
| Flaky | 0 (120/120 passed with `--repeat-each=5`, retries disabled) |
| Duration | 11.7 s (2 workers, i5-6500 / 16 GB) |
| Mobile emulation (Pixel 7) | 24/24 passed |

## Results by area

| Area | Tests | Status |
|---|---|---|
| Authentication | 4 | ✅ Pass |
| Navigation | 3 | ✅ Pass |
| Search & filters | 4 | ✅ 3 pass · ⚠️ 1 known defect (BUG-001) |
| Product CRUD | 4 | ✅ Pass |
| Error handling | 4 | ✅ Pass |
| REST API | 5 | ✅ Pass |

## Defects

| ID | Title | Severity | Status |
|---|---|---|---|
| BUG-001 | Search returns no results with leading/trailing spaces | Minor | Open, see [bug report](sample-bug-report.md) |

## Issues found and fixed during automation (not product defects)

| Issue | Type | Resolution |
|---|---|---|
| All UI tests failed on the first run, while API tests passed | Environment / setup | The first trace showed the server returning HTML pages as JSON-serialised buffers. Fixed in the demo server before the suite was baselined. |

## Out of scope
Visual regression, accessibility audit, performance/load, Firefox/WebKit (configured, not executed in this run).

## Recommendations
1. Fix BUG-001 (one-line server change) and remove `test.fail()`.
2. Enable the full browser matrix weekly via the scheduled workflow.
3. Add axe-core accessibility checks to the smoke suite.
