# Specification: Monthly Focus View & Initial Setup

## Overview
This track introduces a new "Monthly View" focused on the current month's financial health. It includes a mandatory initial setup flow at the start of each month to ensure data accuracy and allows users to set this view as their default landing page.

## Functional Requirements

### 1. Monthly View Dashboard
- **Hero Counter**: A prominent numerical display of "Remaining Spendable" for the current month.
- **Summary Card**: A "Month at a Glance" view showing Total Projected Income vs. Total Projected Expenses.
- **Progress Bar**: A visual indicator showing the percentage of the monthly budget utilized.
- **Navigation**: Ability to switch back to the main/graphic-heavy view via app settings or navigation.

### 2. Initial Monthly Setup (Modal/Overlay)
- **Trigger**: Appears automatically the first time a user accesses the app in a new calendar month.
- **Balance Entry**: Prompt the user to enter their current actual bank balance.
- **Transaction Clearing**: Present a checklist of all projected/recurring transactions for the current month. User marks which ones have already occurred.
- **Default View Preference**: A checkbox or toggle within the modal: "Set Monthly View as my default landing page."
- **Persistence**: Once completed, the setup does not reappear until the following month.

### 3. Settings Integration
- **Default View Selection**: Update user settings to store the preference for "Default View" (Main View vs. Monthly View).
- **Manual Trigger**: Allow users to re-run the "Monthly Setup" from the settings if they need to correct their starting balance or cleared transactions mid-month.

## Non-Functional Requirements
- **Consistency**: The "Remaining Spendable" calculation must stay in sync with the main projection engine.
- **Mobile Friendly**: The full-screen setup modal must be fully responsive and easy to use on mobile devices.

## Acceptance Criteria
- [ ] Users are blocked by a full-screen modal on their first login of the month.
- [ ] Entering a balance and clearing transactions correctly updates the "Remaining Spendable" value.
- [ ] Selecting the "Default View" preference correctly redirects the user on subsequent logins.
- [ ] The Monthly View displays the Hero Counter, Summary Card, and Progress Bar.

## Out of Scope
- Detailed historical transaction editing within the Monthly View (this remains in the Transaction Table).
- Multi-month setup (setup is only for the *current* month).
