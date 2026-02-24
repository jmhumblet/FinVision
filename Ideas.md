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

## Net Worth Dashboard
**Status:** Unimplemented
**Description:**
A holistic view of the user's financial health, tracking assets vs. liabilities over time.
- **Total Net Worth KPI:** A prominent display of Total Assets minus Total Liabilities, with a trend indicator (e.g., +5% this month).
- **Asset Tracking:** A list of asset categories (Cash, Investments, Property, Vehicles) with manual entry or potential account linking.
- **Liability Tracking:** A list of liabilities (Mortgage, Loans, Credit Cards), potentially integrated with the Debt Payoff Strategist.
- **Historical Chart:** A line chart visualizing Net Worth progression over time (1Y, 5Y, Max).
**Stitch Screen:** `PENDING_DESIGN_NET_WORTH`
