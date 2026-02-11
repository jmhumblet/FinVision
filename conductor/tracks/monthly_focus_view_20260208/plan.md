# Implementation Plan: Monthly Focus View & Initial Setup

This plan outlines the steps to implement the Monthly Focus View and the mandatory initial setup flow at the start of each month.

## Phase 1: Foundation & Data Layer [checkpoint: 5373240]

In this phase, we'll update the data structures and services to support monthly checkpoints and user preferences.

- [x] Task: Update `types.ts` to include `UserPreferences` and `MonthlyCheckpoint` models. 5373240
- [x] Task: Implement `getMonthlyCheckpoint` and `saveMonthlyCheckpoint` in `firebaseService.ts`. 5373240
- [x] Task: Create unit tests for monthly checkpoint logic in `financialUtils.test.ts`. 5373240
- [x] Task: Implement logic to detect the "first visit of the month" in `financialUtils.ts`. 5373240
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation & Data Layer' (Protocol in workflow.md) 5373240

## Phase 2: Initial Setup UI (TDD) [checkpoint: e2b03a4]

In this phase, we'll build the mandatory full-screen modal that captures the starting balance and clears transactions.

- [x] Task: Write failing tests for `MonthlySetupModal` component. 1f31a31
- [x] Task: Implement `MonthlySetupModal` with balance input and transaction checklist. 06a1335
- [x] Task: Add "Set as Default View" preference toggle to the modal. 06a1335
- [x] Task: Implement logic to mark projected transactions as "occurred" based on setup selection. 06a1335
- [x] Task: Conductor - User Manual Verification 'Phase 2: Initial Setup UI' (Protocol in workflow.md) 06a1335

## Phase 3: Monthly Focus View UI (TDD)

In this phase, we'll create the dashboard for the Monthly View.

- [ ] Task: Write failing tests for `MonthlyDashboard` component.
- [ ] Task: Implement `MonthlyDashboard` with Hero Counter (Remaining Spendable).
- [ ] Task: Implement Summary Card (Income vs. Expenses) and Budget Progress Bar.
- [ ] Task: Implement navigation logic to respect `defaultView` preference.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Monthly Focus View UI' (Protocol in workflow.md)

## Phase 4: Integration & E2E Verification

In this phase, we'll wire everything together and verify the complete flow.

- [ ] Task: Integrate `MonthlySetupModal` into `App.tsx` with conditional rendering.
- [ ] Task: Add settings option to manually trigger Monthly Setup or change default view.
- [ ] Task: Write E2E tests in `playwright` for the full monthly setup and dashboard flow.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Integration & E2E Verification' (Protocol in workflow.md)
