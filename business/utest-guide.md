# uTest: onboarding & first-cycles playbook

uTest (by Applause) pays per **test cycle**: you get invited to test real products (websites, apps, devices), and you earn a base payment for completing the cycle **plus a payout per approved bug**. Payouts arrive via PayPal or Payoneer.

## Step 1: Sign up (you, ~5 min)
1. https://www.utest.com/signup: real name, email, country, date of birth (must match your payout account and ID).
2. Confirm the email, then set the password yourself.
3. Cookie banner: "Continue without Accepting" is fine.

> ⚠️ Scam warning shown by uTest itself: communicate **only** through the uTest/Applause platform. Nobody legit will ask you to pay, install odd software, or chat on Telegram/WhatsApp.

## Step 2: Complete the profile (this drives invitations)
Invitations are matched on **devices + location + skills**. An incomplete profile gets few or no invites.

**Devices:** add EVERY device you own, with exact OS/browser versions:
- Desktop: Windows 11 Pro, Chrome / Edge / Firefox (exact versions from `chrome://version` and similar)
- Your phone(s) and tablet(s): model, OS version, carrier
- Any smart TV, console, smartwatch, or streaming stick (these cycles have fewer testers and pay well)

**Languages:** Spanish (native), English (level), plus any other you speak, such as Arabic or French. Localization cycles need native speakers.

**Skills / experience** (copy-paste):
- Testing types: Functional, Exploratory, Regression, Usability, Localization (ES), Test case execution, **Automation (Playwright, TypeScript)**, API testing
- Tools: Playwright, Chrome DevTools, Postman, Git/GitHub, GitHub Actions, Jira-style bug reporting

**About me** (copy-paste, then edit):
> Full-stack developer specialised in QA automation with Playwright and TypeScript. I write clear, reproducible bug reports with evidence (screenshots, videos, console/network logs) and I understand how web apps work under the hood, so I find root causes rather than symptoms. Portfolio: https://github.com/oussama0608/playwright-qa-automation-portfolio

## Step 3: uTest Academy (free, do it before your first cycle)
Order that unlocks invites fastest:
1. **Orientation / Getting Started** (required to be "Ready for Cycles")
2. **Sandbox / Mock test cycle**: a practice cycle that's graded. Treat it seriously, because your rating starts here
3. **Bug reporting** courses (titles, actual vs expected, severity)
4. **Screen recording & logs** (how to capture console logs on desktop and mobile)
5. Then specialised courses: Web, Mobile, Localization, Accessibility

## Step 4: Rules that protect your rating
- **Read the cycle overview fully**: scope, out-of-scope, "known issues". Out-of-scope or duplicate bugs get rejected and hurt your rating.
- Check the **known issues** list and existing bugs **before** reporting.
- **Accept only cycles you can finish** before the deadline. Abandoning cycles lowers your rating.
- Fill in the **test case / review** sections when requested, because the base payment depends on them.
- Answer **Test Team Lead (TTL)** questions on your bugs within 24 h.

## Step 5: Bug report template that gets approved
```
Title: [Area] – [What breaks] when [action/condition]
       e.g. "Checkout – 'Place order' button stays disabled after editing the shipping address"

Environment: Windows 11 Pro · Chrome 13x.0.xxxx · 1920x1080 · Spain
Preconditions: logged in with a test account, 1 item in cart
Steps:
 1. ...
 2. ...
 3. ...
Actual result:   what happens (exact error text)
Expected result: what should happen (and why: spec, common behaviour)
Reproducibility: 3/3
Attachments: screen recording (show the steps from the start), screenshot,
             console log / network HAR if relevant
```
Tips:
- **One bug per report.** Never bundle.
- A video beats a long description. Keep it short and start it before step 1.
- Severity must be honest. Inflating it gets the bug reclassified and hurts your credibility.
- Free recorders: Xbox Game Bar (Win+Alt+R), OBS; on Android the built-in screen recorder.

## Step 6: How this connects to your freelance business
- Every approved bug = a real-world example of your reporting quality (you can't publish client details, but you **can** mention ratings/badges).
- Mention "uTest tester, rated X" in Upwork/Fiverr profiles once you have a rating.
- Watch for **automation-related** projects in the uTest community/Applause: they pay more than exploratory cycles.

## Realistic expectations
- First invitations can take days to weeks; more devices + finished Academy = faster.
- Early income is small (a few dollars to tens per cycle). Treat it as **training + reputation**, while Upwork/Fiverr bring the bigger projects.
