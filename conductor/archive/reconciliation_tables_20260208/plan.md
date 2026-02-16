# Implementation Plan: Reconciliation Workflow & Monthly Tables

## Phase 1: Logic & Data (TDD)

- [x] Task: Update `types.ts` to track `lastReconciledDate` in UserPreferences. [checkpoint: updated types]
- [x] Task: Implement `getUnreconciledProjections` in `financialUtils.ts` (logic to find projections between date X and Today).
- [x] Task: Implement `calculateReconciliationAdjustment` logic (returns the adjustment transaction).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Logic & Data' (Protocol in workflow.md)

## Phase 2: Reconciliation Modal UI

- [x] Task: Rename `MonthlySetupModal` to `ReconciliationModal` and refactor.
- [x] Task: Implement "Step 1: Unreconciled Transactions" list (checkboxes for past-due projections).
- [x] Task: Implement "Step 2: Balance Verification" with auto-calculation of gap.
- [x] Task: Implement "Step 3: Save & Adjust" to commit the balance correction transaction.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Reconciliation Modal UI' (Protocol in workflow.md)

## Phase 3: Monthly View Enhancements

- [x] Task: Implement `MonthNavigator` component (< Prev Month | Current | Next Month >).
- [x] Task: Update `MonthlyDashboard` to accept a selected `monthDate` (Date object).
- [x] Task: Embed `TransactionTable` and `ProjectionTable` into `MonthlyDashboard`.
- [x] Task: Implement filtering logic in `App.tsx` to pass only relevant data to the dashboard tables.
- [x] Task: Update Hero Counter calculation to be "Projected End-of-Month Balance".
- [x] Task: Conductor - User Manual Verification 'Phase 3: Monthly View Enhancements' (Protocol in workflow.md)

## Phase 4: Cross-Month Toast & Polish [checkpoint: aaa4d0c]

- [x] Task: Update `Toast` component to support action buttons (e.g., "Go to Month"). [checkpoint: toast action]
- [x] Task: Implement logic in `App.tsx` to detect when a new transaction is outside the current view. [checkpoint: toast action]
- [x] Task: Wire up the Toast action to change the `currentMonth` state. [checkpoint: toast action]
- [x] Task: Write E2E tests for the full reconciliation and navigation flow. [checkpoint: e2e tests]
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Cross-Month Toast & Polish' (Protocol in workflow.md)
