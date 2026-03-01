# Unimplemented Features & Enhancements

## Market Trends & Insights
**Status:** Completely Missing
**Description:**
A dedicated module to provide users with external financial context. This feature should:
- Fetch and display key market indices (S&P 500, NASDAQ, etc.) or relevant financial indicators.
- Provide AI-driven analysis of how global trends (e.g., inflation rates, interest rate hikes) might impact the user's personal finances based on their projected cash flow.
- Include a news feed or curated articles related to personal finance and market movements.

## Scenario Merging
**Status:** Implemented
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

## Subscription Manager
**Status:** Implemented
**Description:**
A dedicated view to track and manage recurring subscriptions.
- List all recurring transactions with next due date and amount.
- Toggle between Monthly/Yearly cost views.
- Cancellation workflow assistant with guides on how to cancel popular services.
- Alerts for price increases or upcoming renewals.
**Stitch Screen:** `PENDING_DESIGN_SUBSCRIPTION_MGR`

## Smart Savings Goals
**Status:** Implemented
**Description:**
A dedicated module to create and track savings goals (e.g., "Emergency Fund", "New Car").
- Set a target amount and target date.
- Calculate required monthly contribution to reach the goal by the target date.
- Visual progress bar showing current savings vs target.
- Link to specific accounts or virtual "buckets".
**Stitch Screen:** `PENDING_DESIGN_SMART_SAVINGS`

## Smart Bill Calendar
**Status:** Unimplemented
**Description:**
A visual calendar view to track upcoming bills and income, providing a clear "when" for cash flow.
- **Monthly Grid View:** Display the current month with days as cells.
- **Event Pills:** Represents recurring transactions (Bills in Red, Income in Green).
- **Balance Warnings:** Highlight days where the projected balance drops below a threshold (e.g., $0).
- **Drag-to-Reschedule:** Allow users to drag flexible bills to different days to simulate payment timing.
- **Quick Add:** Click on a date to quickly add a one-time transaction or bill.
**Stitch Screen:** `PENDING_DESIGN_SMART_BILL_CALENDAR`

## "Safe-to-Spend" Daily Metric
**Status:** Unimplemented
**Description:**
A daily metric designed to give users immediate clarity on their discretionary spending capacity without jeopardizing upcoming obligations or savings goals.
- **Dynamic Calculation:** Subtracts upcoming fixed expenses, bills, and savings contributions from the current available balance, then divides by the days remaining until the next payday.
- **Visual Indicator:** Displayed prominently on the main dashboard (e.g., as a hero number or a gauge).
- **Rollover Mechanics:** If the user spends less than the daily amount, the surplus rolls over to increase the next day's safe-to-spend limit.
- **Overspending Alerts:** Gentle nudges when the daily limit is exceeded, showing the impact on the rest of the period.
**Stitch Screen:** `PENDING_DESIGN_SAFE_TO_SPEND_METRIC`
