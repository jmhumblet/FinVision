# Implementation Plan: Core Cash Flow Projection Engine and Visualization MVP

## Phase 0: Testing Infrastructure
Setup the tools necessary for TDD and coverage reporting.

- [x] Task: Install and configure Vitest and Coverage tools 113f845
    - [x] Install `vitest`, `@vitest/coverage-v8`, and `jsdom`
    - [x] Update `package.json` with a `test` script
    - [x] Configure `vitest.config.ts` (or `vite.config.ts`) for testing

## Phase 1: Domain Logic - Projection Engine (Solidification)
Hardening the existing `financialUtils.ts` to ensure accuracy and 100% coverage.

- [x] Task: Verify types and interfaces 563ac1d
    - [x] Ensure `types.ts` covers all necessary domain models (Transactions, Projections, Scenarios)
- [x] Task: Implement comprehensive tests for financialUtils.ts (TDD) 8369418
    - [x] Write unit tests for `formatCurrency` and `formatDate`
    - [x] Write unit tests for `generateTimeline` covering:
        - [x] Historical transaction application
        - [x] Base projections (Daily, Weekly, Monthly, Yearly frequencies)
        - [x] Scenario adjustments (Add, Set, Percent Inc/Dec)
        - [x] Edge cases: Leap years, month end (e.g., 31st), empty data
    - [x] Refactor `financialUtils.ts` only where necessary to pass tests or improve robustness
    - [x] Verify 100% coverage for `utils/financialUtils.ts`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Domain Logic' (Protocol in workflow.md)

## Phase 1.5: E2E Infrastructure & Bug Fix
Address the manual verification failure by instituting automated E2E tests and fixing the scenario rendering bug.

- [x] Task: Install and Configure Playwright 961ab07
    - [x] Install Playwright and browser binaries
    - [x] Configure `playwright.config.ts` for local development
    - [x] Add `test:e2e` script to `package.json`
- [ ] Task: Reproduce Bug with E2E Test
    - [ ] Create `e2e/scenarios.spec.ts`
    - [ ] Write a test that adds a scenario and asserts the presence of the scenario line on the chart
    - [ ] Confirm test failure (Red Phase)
- [ ] Task: Fix Scenario Rendering Bug
    - [ ] Debug and fix `FinancialChart.tsx` / `financialUtils.ts` to ensure scenario lines render
    - [ ] Verify E2E test passes (Green Phase)

## Phase 2: UI Layer - Visualization Verification
Ensuring the existing components render correctly and handle data changes.

- [ ] Task: Implement tests for FinancialChart component
    - [ ] Write tests to verify chart rendering with base data
    - [ ] Write tests to verify scenario line rendering
    - [ ] Target >80% coverage for `components/FinancialChart.tsx`
- [ ] Task: Integration Verification
    - [ ] Verify `App.tsx` correctly consumes the engine results and handles the default state
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Layer' (Protocol in workflow.md)