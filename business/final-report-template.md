# Test Automation Delivery Report

**Client:** {client} · **Application:** {app name} {version} · **Environment:** {staging URL}
**Period:** {start date} – {end date} · **Prepared by:** {your name}

## 1. Executive summary
{2–3 sentences: overall quality verdict, release recommendation, top risk.}

| Metric | Result |
|---|---|
| Automated tests delivered | {N} (UI {a} · API {b}) |
| Passed / Failed / Known defects | {p} / {f} / {k} |
| Flakiness check | {N×5} runs, {0} flaky |
| Full-suite duration | {mm:ss} on {workers} workers |
| Browsers | {Chromium, Firefox, WebKit, mobile} |

## 2. Scope
**In scope:** {flows}
**Out of scope:** {e.g. payments in production, load testing, visual regression}

## 3. Results by feature
| Feature | Tests | Pass | Fail | Notes |
|---|---|---|---|---|
| {Login} | {4} | {4} | {0} | |

## 4. Defects found
| ID | Title | Severity | Priority | Status | Link |
|---|---|---|---|---|---|
| {BUG-001} | {title} | {Major} | {P2} | Open | {report} |

Severity scale: **Critical** (blocks core flow, no workaround) · **Major** (core flow broken, workaround exists) · **Minor** (non-core / cosmetic with impact) · **Trivial**.

## 5. Automation issues (not product defects)
{Test-side or environment problems found and fixed, e.g. unstable test data or a missing test account. Keeps the client's picture of quality accurate.}

## 6. Deliverables
- [ ] Source code repository / branch: {link}
- [ ] CI pipeline: {workflow link}, triggers: {push, PR, schedule}
- [ ] HTML report: {artifact link}
- [ ] README with run instructions
- [ ] Bug reports ({n})

## 7. How to run
```bash
npm ci && npx playwright install --with-deps
npm test
npm run report
```

## 8. Recommendations
1. {Fix order for defects}
2. {Next flows to automate}
3. {Process: run on every PR, block merge on failure}

## 9. Support
{Support window and maintenance offer.}
