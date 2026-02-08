# Implementation Plan: Core Cash Flow Projection Engine and Visualization MVP

## Phase 0: Testing Infrastructure
Setup the tools necessary for TDD and coverage reporting.

- [x] Task: Install and configure Vitest and Coverage tools 113f845
    - [x] Install `vitest`, `@vitest/coverage-v8`, and `jsdom`
    - [x] Update `package.json` with a `test` script
    - [x] Configure `vitest.config.ts` (or `vite.config.ts`) for testing

## Phase 1: Domain Logic - Projection Engine (Solidification)
Hardening the existing `financialUtils.ts` to ensure accuracy and 100% coverage.

- [ ] Task: Verify types and interfaces
    - [ ] Ensure `types.ts` covers all necessary domain models (Transactions, Projections, Scenarios)
- [ ] Task: Implement comprehensive tests for financialUtils.ts (TDD)
    - [ ] Write unit tests for `formatCurrency` and `formatDate`
    - [ ] Write unit tests for `generateTimeline` covering:
        - [ ] Historical transaction application
        - [ ] Base projections (Daily, Weekly, Monthly, Yearly frequencies)
        - [ ] Scenario adjustments (Add, Set, Percent Inc/Dec)
        - [ ] Edge cases: Leap years, month end (e.g., 31st), empty data
    - [ ] Refactor `financialUtils.ts` only where necessary to pass tests or improve robustness
    - [ ] Verify 100% coverage for `utils/financialUtils.ts`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Domain Logic' (Protocol in workflow.md)

## Phase 2: UI Layer - Visualization Verification
Ensuring the existing components render correctly and handle data changes.

- [ ] Task: Implement tests for FinancialChart component
    - [ ] Write tests to verify chart rendering with base data
    - [ ] Write tests to verify scenario line rendering
    - [ ] Target >80% coverage for `components/FinancialChart.tsx`
- [ ] Task: Integration Verification
    - [ ] Verify `App.tsx` correctly consumes the engine results and handles the default state
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Layer' (Protocol in workflow.md)