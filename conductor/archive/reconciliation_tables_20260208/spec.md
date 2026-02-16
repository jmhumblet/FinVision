# Specification: Reconciliation Workflow & Monthly Tables

## Overview
This track enhances the Monthly Focus View by replacing the simple setup modal with a robust "Reconciliation Workflow" and adding full transaction management capabilities zoomed into the current month. Crucially, the main view highlights the **Projected End-of-Month Remaining Budget**, giving users foresight they don't get from their banking app.

## Functional Requirements

### 1. Reconciliation Workflow (Smart Setup)
- **Trigger**: Appears on first login of the month OR when manually triggered.
- **Step 1: Unreconciled Transactions**:
    - Identify the date of the last reconciled state (or last user interaction).
    - List all *projected* transactions from that date up to Today.
    - User selects which ones occurred (default: all selected).
- **Step 2: Balance Verification**:
    - Calculate "Theoretical Balance" = [Last Known Balance] + [Selected Occurred Transactions].
    - Display this Theoretical Balance to the user.
    - Allow user to input their **Actual Bank Balance**.
- **Step 3: Auto-Adjustment**:
    - Calculate `Gap = Actual Balance - Theoretical Balance`.
    - If `Gap != 0`:
        - Create a "Reconciliation Adjustment" transaction automatically.
        - **Category**: "Other" (or a specific "Adjustment" system category).
        - **Description**: "Balance Correction".
        - **Date**: Today.

### 2. Monthly View Dashboard & Tables
- **Hero Counter**: Displays **"Projected Remaining"** (Forecasted End-of-Month Balance).
    - Calculation: `Current Actual Balance + Remaining Projected Income - Remaining Projected Expenses`.
- **Integration**: Embed the existing `TransactionTable` and `ProjectionTable` components.
- **Filtering**:
    - `TransactionTable`: Show only transactions where `date` falls within the currently selected month.
    - `ProjectionTable`: Show only projections active during the current month.
- **Navigation**:
    - Add "Previous Month" and "Next Month" buttons to the Monthly Dashboard header.
    - Updating the month updates the tables and the "Remaining Spendable" counters.

### 3. Cross-Month Entry Handling
- **Scenario**: User adds a transaction dated *outside* the currently viewed month.
- **Behavior**:
    - The transaction is saved.
    - A Toast notification appears: "Transaction added for [Date]. Not visible in current view."
    - Toast Action: "Go to [Month]" button that switches the view to that transaction's month.

## Non-Functional Requirements
- **Data Integrity**: The reconciliation process must never delete existing user-entered transactions, only add adjustments.
- **Clarity**: The UI must clearly explain *why* an adjustment transaction is being created.

## Acceptance Criteria
- [ ] Reconciliation modal correctly lists past due projections.
- [ ] Overwriting the theoretical balance creates a correct +/- adjustment transaction.
- [ ] Hero Counter displays the Projected End-of-Month Balance.
- [ ] Monthly Dashboard displays full tables filtered by month.
- [ ] Month navigation works correctly.
- [ ] Adding a transaction for a different month triggers the smart toast with navigation action.
