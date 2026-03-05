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

## AI Financial Assistant
**Status:** Unimplemented
**Description:**
A conversational AI interface designed to streamline financial management and provide insights. This addresses the core goal of AI Automation.
- **Natural Language Logging:** Allow users to enter transactions by typing or speaking (e.g., "Spent $45 on groceries yesterday"). The AI will parse the amount, date, and categorize it automatically.
- **Financial Q&A:** Users can ask questions about their data (e.g., "How much did I spend on dining out last month?" or "Will I have enough to pay rent on the 1st?").
- **Proactive Insights:** The assistant can proactively alert users to unusual spending patterns or upcoming cash flow issues based on predictive modeling.
- **Scenario Guidance:** The AI can suggest "What-If" scenarios based on the user's goals or current financial trajectory.
**Stitch Screen:** `PENDING_DESIGN_AI_ASSISTANT`
