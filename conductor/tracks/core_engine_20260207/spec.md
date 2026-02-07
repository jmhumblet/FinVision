# Specification: Core Cash Flow Projection Engine and Visualization MVP

## Overview
This track implements the core engine responsible for calculating future cash flow projections based on a user's current balance and recurring transactions. It also includes the visualization layer to display these projections.

## User Stories
- As a user, I want to see my projected balance for the next 12 months based on my recurring income and expenses.
- As a user, I want to see an interactive chart that clearly shows my balance trends over time.

## Functional Requirements
- **Projection Engine**:
    - Calculate daily balances for 365 days starting from the current date.
    - Support recurring transactions with daily, weekly, bi-weekly, and monthly frequencies.
    - Correctly handle leap years and different month lengths.
- **Visualization**:
    - Render a line chart showing the projected balance.
    - Provide tooltips to show the balance on specific dates.

## Technical Constraints
- The projection engine is considered **Domain Logic** and must have 100% test coverage.
- Use `recharts` for the visualization.
- Calculations must be performant (under 100ms for a year's projection).
