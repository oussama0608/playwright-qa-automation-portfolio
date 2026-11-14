# Business kit: QA automation freelancing

| File | Use it for |
|---|---|
| [upwork-service.md](upwork-service.md) | Upwork profile title, overview, skills, Project Catalog item |
| [fiverr-gig.md](fiverr-gig.md) | Fiverr gig title, description, tags, FAQ |
| [pricing-packages.md](pricing-packages.md) | 3 packages + add-ons (prices derived from the estimator) |
| [proposal-template.md](proposal-template.md) | Short, personalised proposals that get replies |
| [final-report-template.md](final-report-template.md) | Client delivery report (see `docs/sample-test-report.md` for a filled example) |
| [project-acceptance-checklist.md](project-acceptance-checklist.md) | Go/no-go before accepting a job (legal, technical, commercial) |
| [estimator.mjs](estimator.mjs) | `npm run estimate -- --help`: deterministic hours, quote and profitability |

## uTest (crowdtesting)
uTest is not a gig marketplace. You join, complete the free uTest Academy basics, and get invited to paid **test cycles** (exploratory testing and bug bounties per valid bug). Use it to:
- build a track record and ratings quickly while Upwork/Fiverr reviews accumulate;
- practise writing bug reports (use the structure in `docs/sample-bug-report.md`).
Automation skills are a plus there, but cycles are mostly manual testing.

## Estimator examples
```bash
npm run estimate -- --simple 5                                         # Starter
npm run estimate -- --simple 6 --medium 7 --api 2 --ci                 # Standard
npm run estimate -- --simple 10 --medium 15 --complex 5 --api 5 --ci --browsers 4   # Advanced
npm run estimate -- --simple 4 --medium 6 --ci --price 400 --platform fiverr        # check a client's budget
```
Platform fees in the estimator are approximate. Check the current Upwork and Fiverr fee pages before quoting.
