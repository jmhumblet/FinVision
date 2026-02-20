# Unimplemented Features & Enhancements

## Market Trends & Insights
**Status:** Completely Missing
**Description:**
A dedicated module to provide users with external financial context. This feature should:
- Fetch and display key market indices (S&P 500, NASDAQ, etc.) or relevant financial indicators.
- Provide AI-driven analysis of how global trends (e.g., inflation rates, interest rate hikes) might impact the user's personal finances based on their projected cash flow.
- Include a news feed or curated articles related to personal finance and market movements.

## Category-based Budgeting
**Status:** Enhancement needed in `Expense & Budget Tracker`
**Description:**
Extend the `MonthlyDashboard` to support strict budgeting per category.
- Allow users to set a "Budget Limit" for each category (e.g., "Dining Out: $200/month").
- Visual indicators (progress bars, color coding) when spending approaches or exceeds the limit.
- Alerts or notifications for budget overruns.

## Scenario Merging
**Status:** Enhancement needed in `What-If Scenario Builder`
**Description:**
Allow users to "commit" a scenario to their base financial plan.
- A "Merge to Base" action on a scenario card.
- When triggered, all adjustments and new projections in the scenario should be applied to the main `projections` list.
- The scenario itself can then be archived or deleted.

## Dashboard Customization
**Status:** Enhancement needed in `Financial Command Center`
**Description:**
Empower users to personalize their main dashboard.
- Drag-and-drop interface to reorder KPI cards and widgets.
- Toggle visibility of specific sections (e.g., hide "Recent Transactions" if preferred).
- Save layout preferences to the user profile.

## Debt Payoff Strategist
**Status:** Unimplemented
**Description:**
A dedicated tool to visualize and plan debt reduction.
- List various debts (Credit Cards, Loans) with balances and interest rates.
- Toggle between "Snowball" (lowest balance first) and "Avalanche" (highest interest first) strategies.
- Visual chart comparing payoff timelines and interest saved vs. minimum payments.
**Stitch Screen:** `e0be571bcf2a4426aa446c221a0dfd9c`

## Smart Savings Goals
**Status:** Implemented
**Description:**
Define specific savings targets (e.g., Vacation, Emergency Fund) and allocate 'Projected Remaining' cash flow towards them. Includes visual progress tracking, 'Safe to Spend' calculation, and integration with the Monthly Focus View.
A dedicated module to help users set and track savings targets.
- Users can define multiple savings goals (e.g., "New Car", "Emergency Fund", "Vacation").
- Each goal has a target amount and target date.
- Visualize progress towards each goal with charts and percentage indicators.
- Calculate required monthly contributions to reach the goal by the target date.
- Option to allocate "Available Balance" to specific goals, reducing the spendable amount in the main dashboard.
**Stitch Screen:** `75da098631554e8d8616eeb630dcf5a8`
