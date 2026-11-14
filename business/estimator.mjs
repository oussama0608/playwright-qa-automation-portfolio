#!/usr/bin/env node
// Deterministic hours & profitability estimator for QA automation quotes.
// Usage:
//   npm run estimate -- --simple 6 --medium 5 --complex 2 --rate 30 --ci --browsers 2 --platform upwork
//   npm run estimate -- --help
const HELP = `
QA Automation Estimator
  --simple N      tests on a single page/form            (default 0)  0.35 h each
  --medium N      multi-step flows (login→action→verify) (default 0)  0.75 h each
  --complex N     data setup, API mocking, file upload…  (default 0)  1.5 h each
  --api N         API contract tests                     (default 0)  0.3 h each
  --ci            include GitHub Actions setup                        +2.0 h
  --browsers N    browser projects (1-4)                 (default 1)  +8% per extra
  --rate USD      your target hourly rate                (default 30)
  --platform P    upwork | fiverr | direct               (default upwork)
  --price USD     check profitability of a fixed price you're considering
`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { console.log(HELP); process.exit(0); }
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = Number(args[i + 1]);
  if (!Number.isFinite(v) || v < 0) { console.error(`Invalid value for --${name}`); process.exit(1); }
  return v;
};
const platformIdx = args.indexOf('--platform');
const platform = platformIdx === -1 ? 'upwork' : String(args[platformIdx + 1]).toLowerCase();
const FEES = { upwork: 0.10, fiverr: 0.20, direct: 0.03 }; // approx. platform / payment fees – verify current rates
if (!(platform in FEES)) { console.error('platform must be upwork | fiverr | direct'); process.exit(1); }

const simple = opt('simple', 0), medium = opt('medium', 0), complex = opt('complex', 0), api = opt('api', 0);
const browsers = Math.min(Math.max(opt('browsers', 1), 1), 4);
const rate = opt('rate', 30);
const ci = args.includes('--ci');

const testCount = simple + medium + complex + api;
if (testCount === 0) { console.log(HELP); process.exit(1); }

// Coefficients assume this repo is reused as the framework template (AI-assisted authoring, human-reviewed).
const authoring = simple * 0.35 + medium * 0.75 + complex * 1.5 + api * 0.3;
const setup = 1;                                     // framework, config, POM skeleton
const ciHours = ci ? 2 : 0;
const browserFactor = 1 + 0.08 * (browsers - 1);     // cross-browser debugging
const stabilization = authoring * 0.15;              // repeat-each runs, flake fixes
const reporting = 1 + testCount * 0.05;              // bug reports + final report
const communication = 1 + testCount * 0.03;
const base = (setup + authoring * browserFactor + ciHours + stabilization + reporting + communication);
const risk = base * 0.15;                            // unknowns buffer
const hours = Math.ceil((base + risk) * 2) / 2;

const fee = FEES[platform];
const quote = Math.ceil((hours * rate) / (1 - fee) / 10) * 10;
const fmt = (n) => `$${n.toFixed(0)}`;

const rows = [
  ['Tests', `${testCount} (simple ${simple}, medium ${medium}, complex ${complex}, api ${api})`],
  ['Browsers', String(browsers)],
  ['CI setup', ci ? 'yes' : 'no'],
  ['Estimated hours (incl. 15% risk)', `${hours} h`],
  [`Recommended quote (${platform}, fee ${(fee * 100).toFixed(0)}%)`, fmt(quote)],
  ['Net after fees', fmt(quote * (1 - fee))],
  ['Effective net hourly rate', `${fmt((quote * (1 - fee)) / hours)}/h`],
];

const price = opt('price', 0);
if (price > 0) {
  const net = price * (1 - fee);
  const eff = net / hours;
  rows.push(['—', '—'], ['Proposed price', fmt(price)], ['Net after fees', fmt(net)],
    ['Effective hourly', `${fmt(eff)}/h`],
    ['Verdict', eff >= rate ? '✅ profitable at your target rate' : eff >= rate * 0.75 ? '⚠️  below target – OK only for reviews/portfolio' : '❌ decline or reduce scope']);
}

const w = Math.max(...rows.map(([k]) => k.length));
console.log('\nQA Automation Estimate\n' + '-'.repeat(w + 30));
for (const [k, v] of rows) console.log(`${k.padEnd(w)}  ${v}`);
console.log('');
