# Project Acceptance Checklist

Use this before sending a proposal (✅ = go). **Two or more red flags = decline or reprice.**

## Legal & authorization
- [ ] The client owns the app or has written authorisation to test it
- [ ] Testing happens on **staging/test**, not production (or production is read-only with written approval)
- [ ] No load/stress testing on infrastructure the client doesn't control
- [ ] An NDA, if required, has been reviewed (no unlimited liability)
- [ ] Payment goes through platform escrow / milestone (never work outside the platform before trust exists)

## Technical fit
- [ ] Web application (or API) that Playwright can handle
- [ ] Stable test environment URL available
- [ ] Test accounts provided (never use real customer data or credentials)
- [ ] CAPTCHA / 2FA can be disabled or bypassed **in the test environment** by the client
- [ ] Test data can be created and cleaned up (API, seed scripts or reset)
- [ ] Third-party flows (payments, emails) have sandbox modes

## Scope & expectations
- [ ] Priority flows are listed and countable (= number of tests)
- [ ] "Done" is defined (number of tests, browsers, CI, report)
- [ ] Revisions and support window are agreed
- [ ] The client understands automation ≠ 100% coverage
- [ ] The deadline is realistic (estimator hours × 1.2 buffer)

## Commercial
- [ ] Effective hourly rate ≥ your minimum (`npm run estimate`)
- [ ] Client has payment verified / positive history
- [ ] Budget fits a package or a clear custom quote
- [ ] No "small test task" doing real work for free

## Red flags 🚩
- "Just test everything" with no flow list
- Asks to test a site they don't own, or to bypass security protections
- Wants production credentials shared in chat
- Budget far below estimate, with "more work later" promises
- Wants communication/payment off-platform
