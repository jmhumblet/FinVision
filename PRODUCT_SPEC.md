# FinVision — Feature Simplification & Integration Spec

## Goal

The app currently has too many features that feel disconnected. A user moving between views has to mentally hold the relationships themselves — savings goals don't show up in net worth, the calendar can't create recurring items, and the debt strategist is a self-contained island. This document defines how we want to simplify and reconnect those features so the app feels coherent.

The guiding principle: **every major concept should be visible and actionable from wherever it's relevant**, not just in its dedicated view.

---

## 1 — Remove the Debt Payoff Strategy

### What changes
The dedicated Debt Payoff Strategy view is removed entirely. This includes the snowball/avalanche strategy selector, the payoff timeline chart, and the extra monthly payment calculator.

### What stays
Debts (name, balance, interest rate, minimum payment) remain in the system as **liabilities**. They continue to feed the Net Worth view's liability total and the Financial Health ratios. The ability to add, edit, and delete debts moves into the **Net Worth view**, directly under the Liabilities section.

### Why
The payoff strategy feature was a self-contained calculator with no integration into the rest of the app. It had no visible effect on the cash flow chart, net worth trajectory, or financial health scores. Removing it reduces cognitive load without losing the liability data that actually matters.

---

## 2 — Savings Goals integrated with Transactions

### Current state
Savings goals are a separate tracker where users manually type in a "current saved amount". There's no connection to actual money movement.

### What changes

**Deposits and withdrawals become real transactions.**
When a user wants to add money to a savings goal (or take money out), they log it as a transaction directly from the Savings view. The transaction is tagged to the specific goal. The goal's progress is then computed automatically from all tagged transactions — the user never manually edits "current amount" again.

This means:
- Saving €200 for a holiday fund creates a transaction that appears in the transaction history.
- Withdrawing €50 from that fund also creates a transaction.
- The goal's progress bar reflects the real sum of those movements.

**Savings transactions use a dedicated transfer type.**
Rather than being classified as income or expense (which would distort spending reports), savings movements are a neutral "transfer" type. They don't affect the income/expense balance on the Monthly view, but they do reduce the available cash balance.

**Recurring savings contributions.**
From a goal's card, the user can set up a recurring contribution (e.g. €100/month on the 1st). This creates a scheduled recurring item that appears in the cash flow chart and the bill calendar, so the user can see future savings commitments alongside bills and income.

**Transaction history per goal.**
Each goal card shows a collapsible history of all deposits and withdrawals, with dates and amounts.

---

## 3 — Savings Goals visible as Assets in Net Worth

### What changes
Each savings goal automatically appears as an asset in the **Net Worth view**, under a dedicated "Savings" section. The value shown is the current saved amount (derived from transactions). These are read-only in Net Worth — managed from the Savings view — with a direct link to navigate there.

This means the net worth calculation correctly includes money that has been set aside for goals, not just the operating cash balance and manually tracked assets.

---

## 4 — Calendar: Add Recurring Items Directly

### Current state
The Bill Calendar has an "Add Recurring" button in the day detail panel that shows a message telling the user to go to the main dashboard instead. It does nothing.

### What changes
Clicking "Add Recurring" on a selected date opens a form to create a recurring scheduled item (name, amount, income or expense, category, frequency — weekly/monthly/yearly, optional end date). The selected date becomes the start date of the recurrence.

**Backfill for past dates**: if the selected date is in the past, the system also automatically creates individual transactions for all occurrences between the start date and today. This way, historical data is immediately accurate without manual entry.

The newly created recurring item appears on the calendar for all future occurrences and feeds into the cash flow projection chart.

---

## 5 — Additional Integration Improvements

These are smaller gaps identified during the audit that undermine the sense of cohesion.

### 5a — Subscriptions shown distinctly in the Calendar
Subscriptions are recurring items, and they show up in the calendar as generic "Scheduled Bill" entries. There's no way to tell a subscription from a one-off bill just by looking at the calendar. Subscriptions should be visually distinct in the calendar (different icon), and the day detail panel should offer a shortcut to edit the subscription directly.

### 5b — Financial Health reflects Savings Goals
The Financial Health dashboard computes savings rate and emergency fund coverage, but has no knowledge of savings goals. The total amount saved across all goals should be included in these calculations so the scores are accurate.

### 5c — Main Dashboard shows savings context
The main dashboard's KPI cards show current balance, projected balance, and safe-to-spend. Users have no quick sense of how much of their money is committed to savings goals. A sub-line on the safe-to-spend card should indicate how much is currently held in savings goals, making the truly "free" amount clearer.

---

## Summary of Feature Relationships After Changes

| Feature | Feeds into |
|---|---|
| Savings Goals | Transactions (deposits/withdrawals), Net Worth (as assets), Financial Health (savings rate), Cash Flow Chart (recurring contributions), Bill Calendar (recurring contributions) |
| Debts | Net Worth (liabilities), Financial Health (debt ratios) |
| Recurring Items / Projections | Cash Flow Chart, Bill Calendar, Monthly View, Subscriptions view |
| Transactions | Monthly View, Main Dashboard balance, Savings Goals progress |
| Net Worth | Financial Health (asset/liability ratios) |
