# Implementation Plan: Fix CI E2E Failures

This plan focuses on resolving the intermittent and consistent E2E test failures caused by modal interceptions and timeouts.

## Phase 1: Local Reproduction & Diagnostic [checkpoint: e2e-diag]

- [ ] Task: Reproduce failures locally using `npm run test:e2e`.
- [ ] Task: Analyze local Playwright traces to pinpoint the exact moment of interception for each failing test.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Local Reproduction & Diagnostic' (Protocol in workflow.md)

## Phase 2: Robust Modal & Overlay Handling [checkpoint: e2e-robust-modals]

- [ ] Task: Create a set of Playwright helper functions or common logic for "Wait for Modal Dismissal".
- [ ] Task: Update `e2e/monthlyView.spec.ts` to ensure `MonthlySetupModal` is fully handled/dismissed.
- [ ] Task: Update `e2e/projections.spec.ts` to prevent "Add Projection" interception.
- [ ] Task: Update `e2e/scenarios.spec.ts` and `e2e/transactions.spec.ts` to ensure background interactions wait for overlays.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Robust Modal & Overlay Handling' (Protocol in workflow.md)

## Phase 3: Data Consistency & CI Optimization [checkpoint: e2e-ci-stable]

- [ ] Task: Verify `mockFirebaseService` data used in E2E tests for potential race conditions.
- [ ] Task: Adjust Playwright configuration (e.g., `expect` timeout, global timeout) if necessary for CI stability.
- [ ] Task: Run full suite locally multiple times to ensure zero flakiness.
- [ ] Task: Push changes and verify successful GitHub Actions run.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Data Consistency & CI Optimization' (Protocol in workflow.md)
