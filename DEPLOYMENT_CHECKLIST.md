# RegenOS v1.0 Team Testing Deployment Checklist

## Backend

- [ ] Confirm `apps-script/Code.js` is the only Apps Script source file.
- [ ] Run `clasp status` from `apps-script/`; only `Code.js` and `appsscript.json` should be tracked.
- [ ] Run `clasp push` from `apps-script/`.
- [ ] Update the stable web app deployment to the pushed version.
- [ ] Confirm the stable `/exec` endpoint returns `{"ok":true}`.

## Frontend

- [ ] Confirm `.env.production` contains the stable Apps Script `/exec` URL.
- [ ] Run `npm run build`.
- [ ] Confirm the build finishes without errors.
- [ ] Run `firebase use` and confirm the active project is `regen-os`.
- [ ] Run `firebase deploy --only hosting`.

## Team Testing Smoke Checks

- [ ] Sign in through Firebase Authentication.
- [ ] Open Monthly Close and load a test month.
- [ ] Save physical counts, including a valid zero quantity.
- [ ] Create and approve one inventory adjustment.
- [ ] Repeat the approval and confirm it does not post a second ledger entry.
- [ ] Confirm an approved adjustment cannot be rejected.
- [ ] Complete all five sign-offs and close a test month.
- [ ] Verify Stores, FG Rates, Factory Expenses, and Consumables can list and save records.
- [ ] Confirm the closed month rejects further protected changes.
