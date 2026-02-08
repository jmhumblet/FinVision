# Specification: Core Cash Flow Projection Engine and Visualization MVP

## Overview
This track solidifies the existing core engine responsible for calculating future cash flow projections and its visualization layer. The goal is to ensure 100% accuracy in domain logic via TDD and verify the UI's resilience.

## User Stories
- As a user, I want to see my projected balance for the next 12 months based on my recurring income and expenses with absolute confidence in the math.
- As a user, I want an interactive chart that accurately displays both my historical data and multiple "What-If" scenarios.

## Functional Requirements
- **Projection Engine (Refinement)**:
    - Accurate daily balance calculation for up to 1 year.
    - Support for all recurring frequencies (Once, Weekly, Monthly, Yearly).
    - Robust handling of "What-If" scenario adjustments (Add, Set, Percentages).
- **Visualization (Verification)**:
    - High-performance rendering of historical, projected, and scenario lines using `recharts`.
    - Correct data mapping from the engine to the chart.

## Technical Constraints
- **Domain Logic Coverage**: `utils/financialUtils.ts` MUST reach 100% unit test coverage.
- **UI Testing**: `components/FinancialChart.tsx` should target >80% coverage.
- **TDD Workflow**: Tests must be written to define expected behavior before any refactoring or fixes.