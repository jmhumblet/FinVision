# Specification: E2E Testing Standardization & Reliability

## Overview
This track aims to solidify the End-to-End (E2E) testing strategy for FinVision using Playwright. The primary goal is to eliminate test flakiness, ensure regression protection for critical user flows, and establish clear guidelines for visual testing. A key technical shift will be mocking the service layer for deterministic fast testing, while retaining a separate full-integration suite for deep verification.

## Functional Requirements

### 1. Deterministic E2E Suite (Mocked)
-   **Service Layer Mocking:** Implement Playwright network intercepts or module mocks to bypass `firebaseService` for the standard test suite.
-   **Critical Flows:** Automate the following core journeys using mocked data:
    -   **Onboarding:** Guest login and initial dashboard load.
    -   **Transaction Management:** Adding, editing, and deleting transactions.
    -   **Projection Planning:** Creating base projections and verifying chart updates.
    -   **Scenario Modeling:** Creating "What-If" scenarios, adding adjustments, and verifying UI reflection (chart lines, legends).
-   **Data Isolation:** Each test must run in a pristine state (achieved via mocking) to prevent cross-test pollution.

### 2. Full Integration Suite (Separate)
-   **Dedicated Test File:** Create a separate test file (e.g., `e2e/integration.spec.ts`) that **does not** mock Firebase.
-   **Execution Control:** This suite must be excluded from standard `npm run test:e2e` and only run via a specific command (e.g., `npm run test:integration`).
-   **Scope:** Verify the actual connection to Firebase Auth and Firestore (or Emulator) works for a basic "Login -> Write -> Read" cycle.

### 3. Visual Regression Guidelines
-   **Policy:** **No snapshots for dynamic data.** Visual regression testing (snapshots) is explicitly forbidden for screens or components displaying dynamic data (dates, random IDs, live calculations) unless that data is fully masked or mocked to be static.
-   **Focus:** Rely on robust locator assertions (e.g., `toBeVisible()`, `toHaveText()`, `toHaveCount()`) rather than pixel-comparison for dynamic features.

## Technical Constraints
-   **Tooling:** Playwright for all E2E tests.
-   **Performance:** Standard mocked tests should run efficiently (aim for < 10s per spec file).
-   **Resilience:** Tests must use `data-testid` attributes or semantic locators (Role, Text) to avoid brittleness.
-   **CI/CD:** Setup GitHub Actions to run the deterministic suite on PRs.

## Out of Scope
-   Setting up the Firebase Emulator Suite (we will mock the service layer instead).
-   Backfilling tests for every minor UI edge case (focus is on critical flows).
