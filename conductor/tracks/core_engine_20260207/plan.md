# Implementation Plan: Core Cash Flow Projection Engine and Visualization MVP

## Phase 1: Domain Logic - Projection Engine
This phase focuses on the core mathematical engine. All code here must reach 100% test coverage.

- [ ] Task: Define domain types and projection engine interface
    - [ ] Write types for Transactions, Frequencies, and Projection results in `types.ts`
    - [ ] Define the interface for the projection function
- [ ] Task: Implement Projection Engine (TDD)
    - [ ] Write tests for the projection engine in `utils/financialUtils.test.ts` covering all frequencies and edge cases
    - [ ] Implement the `calculateProjection` function in `utils/financialUtils.ts` to pass all tests
    - [ ] Verify 100% coverage for `financialUtils.ts`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Domain Logic' (Protocol in workflow.md)

## Phase 2: UI Layer - Visualization
This phase integrates the engine with the UI and renders the interactive chart.

- [ ] Task: Create Projection Data Hook
    - [ ] Write tests for `useProjectionData` hook
    - [ ] Implement hook to call the engine and format data for Recharts
- [ ] Task: Implement FinancialChart Component
    - [ ] Write tests for `FinancialChart` component (80% coverage)
    - [ ] Implement `FinancialChart` using Recharts
- [ ] Task: Integrate with App
    - [ ] Connect `FinancialChart` to the main `App.tsx`
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Layer' (Protocol in workflow.md)
