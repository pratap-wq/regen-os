# RegenOS Engineering Guide for Codex

## Project Identity
RegenOS is a custom ERP for Regenplastics Private Limited, built specifically for plastic recycling operations.

The system must trace every kilogram and every rupee from procurement to month-end close.

## Tech Stack
- React with Vite
- Firebase Hosting
- Firebase Authentication
- Google Apps Script REST API
- Google Sheets database
- Apps Script managed locally through clasp

## Source of Truth
- Frontend source: `src/`
- Apps Script backend source: `apps-script/Code.js`
- Do not treat old `apps-script/Code.gs` as source of truth.
- Do not edit Apps Script in browser unless emergency.
- Backend changes should be made in `apps-script/Code.js`, then pushed using `clasp push`.

## Core ERP Flow
RM Inward
→ Wash
→ Color Sorter optional
→ Extrusion
→ Finished Goods
→ Dispatch
→ Monthly Close

Everything must follow this flow.

## Main Rule
Never duplicate data entry.

If data already exists upstream, downstream modules should consume it or reference it.

## Folder Rules
- `src/pages/` = page assembly only
- `src/components/` = reusable UI components
- `src/services/` = business logic and calculations
- `src/api/` = API wrapper only
- `src/utils/` = generic helpers

Business calculations must not live inside pages.

## Coding Rules
- Preserve existing functionality.
- Do not remove working modules.
- Do not refactor unrelated files.
- Make minimum safe changes unless explicitly asked for refactor.
- Run `npm run build` after changes.
- Avoid fake/demo data in production screens.
- Avoid hardcoded business results.
- Keep UI consistent with existing RegenOS styling.
- Prefer complete replacement files for major changes.
- Keep pages readable and avoid large duplicated calculation blocks.

## Backend Rules
- Apps Script route names must match frontend `apiCall({ fn })`.
- Every frontend service function must have matching backend route.
- Every backend route must return JSON using `output()`.
- Backend must be backward compatible.
- Use `ensureHeaders_()` before writing to a sheet.
- Use `validateMonthLock(periodMonth)` before changing locked-period data.
- Do not delete operational records; use status fields like `DELETED`, `REJECTED`, or `INACTIVE`.
- Adjustment/correction flows should preserve audit history.

## Google Sheets Database Principle
Google Sheets are the database.
Sheets are operational ledgers and master tables.
Avoid destructive updates for audit-sensitive modules.

Important sheets include:
- RM_Inward
- Wash_Batches
- Sorting_Batches
- Extrusion_Batches
- Dispatches
- Stores_Inward
- Stores_Issue
- Inventory_Ledger
- Factory_Expenses
- Factory_Cost_Master
- Production_Materials
- FG_Rates
- Inventory_Adjustments
- Physical_Counts
- Month_Close
- Month_Locks

## Inventory Principle
Every kilogram must reconcile:

Opening Stock
+ Inward
- Consumption / Dispatch
+ Approved Adjustments
= Closing Stock

## Financial Principle
Every rupee must reconcile:

Sales
- RM Cost
- Stores Cost
- Factory Expenses
- Factory Cost Master
= Manufacturing Profit

## Monthly Close v1 Rules
Monthly Close is a review and control screen, not a free editing screen.

It should:
- Load production, dispatch, cost, inventory and physical stock data.
- Show material accountability.
- Show variances.
- Guide user to Inventory Adjustments for corrections.
- Use saved Physical_Counts for physical stock.
- Allow save/update physical stock as new audit snapshot.
- Use approved/auto-approved adjustments to reconcile variance.
- Prevent close if required checks are incomplete.

## Physical Stock Rules
Physical stock should not be deleted.
If wrong, save a corrected physical count.
Monthly Close uses the latest active saved count for that period.

Physical stock includes:
- RM Physical Kg
- Wash WIP Kg
- Sorting WIP Kg
- FG Kg
- Stores Physical Value
- Sign-offs
- Remarks

## Inventory Adjustment Rules
Inventory Adjustments are controlled reconciliation entries.

Current v1 behavior:
- Auto-approval is acceptable for team testing.
- Approved adjustment posts to inventory ledger.
- Deletion should not be used.
- Corrections should be visible through audit rows.

Future v1.1 behavior:
- Draft
- Submitted
- Approved
- Rejected
- Role-based approval
- CEO override

## Material Accountability Logic
For each material stage:
System Kg
Physical Kg
Variance
Approved Adjustment
Pending Adjustment
Remaining Difference
Status
Action

Statuses:
- Physical Pending
- Investigation Required
- Adjustment Pending
- Reconciled

No generic "Needs Attention" without an action.

Every warning must show next action:
- Enter physical stock
- Create adjustment
- Approve adjustment
- Review exception
- Complete sign-off

## UI Principles
RegenOS is a factory ERP, not a generic admin panel.

UI must be:
- Clear
- Operational
- Action-oriented
- Low-error
- Suitable for production, stores, accounts, and CEO users

Prefer:
- Dropdowns over free text where possible
- Tables with clear status/actions
- Metric cards
- Inline explanations for irreversible/audit-sensitive actions
- Strong labels and status pills

Avoid:
- Ambiguous statuses
- Unexplained warnings
- Silent failures
- Hidden calculations
- Requiring users to guess what to do next

## Dashboard Rules
Dashboards should consume services.
Dashboards should not duplicate calculations.
Any KPI used in multiple places should come from a shared service.

## Services Roadmap
Current:
- monthCloseEngine.js
- inventoryAdjustmentService.js
- physicalCountService.js

Future:
- inventoryEngine.js
- costEngine.js
- dashboardEngine.js
- profitEngine.js
- traceabilityEngine.js

## Existing Completed Modules
- Login
- RM Inward
- Wash
- Color Sorter
- Extrusion
- Dispatch
- Live Inventory
- Stores
- Factory Cost Master
- Factory Expenses
- Production Materials
- FG Rates
- Alerts
- Monthly Close v1 candidate
- Inventory Adjustments v1 candidate

## Under Active Validation
- Monthly Close
- Physical Stock save/update
- Inventory Adjustments
- Material Accountability
- Apps Script frontend/backend route alignment
- Google Sheets schemas

## Deployment Workflow
Frontend:
1. `npm run build`
2. `firebase deploy`

Backend:
1. Edit `apps-script/Code.js`
2. `cd apps-script`
3. `clasp push`

Before deployment:
- Build must pass.
- Frontend service calls must match Apps Script routes.
- Apps Script routes must exist in `Code.js`.
- No stale `Code.gs` should be treated as backend truth.

## Codex Behavior Rules
When asked to review:
- Do not modify files unless explicitly told.
- Report blockers separately from improvements.
- Distinguish build blockers, runtime blockers, data integrity risks, and future enhancements.

When asked to fix:
- Make minimum safe fix.
- Preserve behavior.
- Run build.
- Summarize changed files and rationale.

When asked to refactor:
- Refactor in small stages.
- Keep functionality equivalent.
- Do not combine refactor with feature changes unless requested.

## Review Checklist
Before approving any change, check:
- Does build pass?
- Are imports valid?
- Are routes registered in App.jsx?
- Is Sidebar updated if a new page exists?
- Does frontend service call exist in Apps Script?
- Does Apps Script route return `output()`?
- Does Google Sheet schema exist or get created?
- Are locked months protected?
- Are calculations centralized?
- Are UI actions clear?
- Is audit history preserved?

## RegenOS Vision
RegenOS should become the world's best ERP built specifically for plastic recycling, where every kilogram and every rupee is traceable from procurement through production to dispatch and month-end close.

