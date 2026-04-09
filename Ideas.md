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
**Status:** Implemented
**Description:**
A visual calendar view to track upcoming bills and income, providing a clear "when" for cash flow.
- **Monthly Grid View:** Display the current month with days as cells.
- **Event Pills:** Represents recurring transactions (Bills in Red, Income in Green).
- **Balance Warnings:** Highlight days where the projected balance drops below a threshold (e.g., $0).
- **Drag-to-Reschedule:** Allow users to drag flexible bills to different days to simulate payment timing.
- **Quick Add:** Click on a date to quickly add a one-time transaction or bill.
**Stitch Screen:** `PENDING_DESIGN_SMART_BILL_CALENDAR`

## Lifestyle Creep Monitor
**Status:** Unimplemented
**Description:**
A predictive tool that tracks the correlation between income growth and discretionary spending increases over time.
- Visualize the divergence between income growth and savings rate.
- Identify specific discretionary categories driving the "creep".
- AI-generated alerts when spending increases proportionally outpace income increases.
**Stitch Screen:** `PENDING_DESIGN_LIFESTYLE_CREEP_MONITOR`
## Automated Cash Flow Alerts
**Status:** Implemented
**Description:**
A proactive alert system that uses predictive modeling to warn users of impending cash flow issues.
- Analyzes upcoming bills and projected income to identify potential overdrafts before they happen.
- Notifies users when their account balance is projected to drop below a safe threshold within the next 30 days.
- Suggests actionable steps such as delaying non-essential purchases or moving funds from savings.
**Stitch Screen:** `PENDING_DESIGN_AUTO_CASH_FLOW_ALERTS`
## "Safe-to-Spend" Daily Metric
**Status:** Implemented
**Description:**
A daily metric designed to give users immediate clarity on their discretionary spending capacity without jeopardizing upcoming obligations or savings goals.
- **Dynamic Calculation:** Subtracts upcoming fixed expenses, bills, and savings contributions from the current available balance, then divides by the days remaining until the next payday.
- **Visual Indicator:** Displayed prominently on the main dashboard (e.g., as a hero number or a gauge).
- **Rollover Mechanics:** If the user spends less than the daily amount, the surplus rolls over to increase the next day's safe-to-spend limit.
- **Overspending Alerts:** Gentle nudges when the daily limit is exceeded, showing the impact on the rest of the period.
**Stitch Screen:** `PENDING_DESIGN_SAFE_TO_SPEND_METRIC`
## Emergency Fund Stress Test
**Status:** Unimplemented
**Description:**
A specialized module to evaluate the resilience of the user's financial plan against unexpected events.
- Simulate sudden loss of income, large unexpected expenses (e.g., medical, car repair), or macroeconomic shocks.
- Calculate how many months the current emergency fund and liquid assets can sustain the user's base expenses.
- Provide actionable recommendations to reach a target "runway" (e.g., 6 months of living expenses).
- Visual timeline showing the depletion rate of funds under different stress scenarios.
**Stitch Screen:** `PENDING_DESIGN_EMERGENCY_FUND_STRESS_TEST`
## Financial Health Score & Recommendations
**Status:** Implemented
**Description:**
A comprehensive dashboard providing a single "Health Score" (0-100) based on financial metrics.
- **Health Score Gauge:** Visual representation of the overall financial health.
- **Score Breakdown:** Detailed analysis of key factors:
    - Savings Rate (e.g., target 20%)
    - Debt-to-Income Ratio (e.g., target < 30%)
    - Emergency Fund Coverage (e.g., target 3-6 months)
    - Cash Flow Stability (positive months vs negative)
- **Actionable Insights:** AI-driven recommendations to improve the score (e.g., "Pay off $500 on Credit Card to improve Debt Score").
- **Historical Trend:** Track the health score over time to visualize improvement.
**Stitch Screen:** `PENDING_DESIGN_FINANCIAL_HEALTH`
## Variable Income Smoother
**Status:** Unimplemented
**Description:**
A predictive tool designed for non-traditional earners (freelancers, gig workers, commission-based) to stabilize their highly variable cash flow.
- Analyzes historical income data to calculate a conservative "smoothed" monthly income baseline.
- Suggests an optimal "buffer fund" amount to safely cover lean months based on the user's base expenses.
- Simulates future cash flow using the smoothed baseline, providing clarity on exactly how much is truly safe to spend right now.
- Offers interactive scenario toggles (e.g., "What if a major client drops?", "What if I hit my stretch goal?") to stress-test the smoothed budget.
**Stitch Screen:** `PENDING_DESIGN_VARIABLE_INCOME_SMOOTHER`

## Interactive Debt Payoff Strategist
**Status:** Unimplemented
**Description:**
A specialized module for managing debt, featuring Snowball vs. Avalanche strategy comparison and interactive payoff visualization. This feature should:
- Allow users to input multiple debts with their balances, interest rates, and minimum payments.
- Compare Snowball (lowest balance first) and Avalanche (highest interest first) payoff strategies.
- Visualize the timeline and total interest paid for each strategy.
- Let users simulate adding extra monthly payments to see the impact on their payoff date.
**Stitch Screen:** `PENDING_DESIGN_DEBT_PAYOFF_STRATEGIST`
