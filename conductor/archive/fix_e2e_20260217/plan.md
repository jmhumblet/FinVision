# Implementation Plan: Fix CI E2E Failures

This plan focuses on resolving the intermittent and consistent E2E test failures caused by modal interceptions and timeouts.

## Phase 1: Local Reproduction & Diagnostic [checkpoint: a6db0ed]

- [x] Task: Reproduce failures locally using `npm run test:e2e`. [a6db0ed]
- [x] Task: Analyze local Playwright traces to pinpoint the exact moment of interception for each failing test. [a6db0ed]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Local Reproduction & Diagnostic' (Protocol in workflow.md)

## Phase 2: Robust Modal & Overlay Handling [checkpoint: a6db0ed]

- [x] Task: Create a set of Playwright helper functions or common logic for "Wait for Modal Dismissal". [3442d4d]
- [x] Task: Update `e2e/monthlyView.spec.ts` to ensure `MonthlySetupModal` is fully handled/dismissed. [a6db0ed]
- [x] Task: Update `e2e/projections.spec.ts` to prevent "Add Projection" interception. [a6db0ed]
- [x] Task: Update `e2e/scenarios.spec.ts` and `e2e/transactions.spec.ts` to ensure background interactions wait for overlays. [a6db0ed]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Robust Modal & Overlay Handling' (Protocol in workflow.md)

## Phase 3: Data Consistency & CI Optimization [checkpoint: e2e-ci-stable]

- [x] Task: Verify `mockFirebaseService` data used in E2E tests for potential race conditions. [a6db0ed]
- [x] Task: Adjust Playwright configuration (e.g., `expect` timeout, global timeout) if necessary for CI stability. [837e65b]
- [x] Task: Run full suite locally multiple times to ensure zero flakiness. [837e65b]
- [x] Task: Push changes and verify successful GitHub Actions run. [a527773]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Data Consistency & CI Optimization' (Protocol in workflow.md)
