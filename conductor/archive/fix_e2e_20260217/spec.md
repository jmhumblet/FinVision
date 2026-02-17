# Specification: Fix CI E2E Failures

**Overview:**
The master build is currently failing due to multiple E2E test failures in the Playwright suite. The logs indicate that many tests are timing out while trying to interact with elements that are intercepted by a modal overlay (e.g., `ReconciliationModal` or `MonthlySetupModal`). This track aims to resolve these failures by making the E2E tests more robust, handling modal states correctly, and ensuring the CI environment is stable.

**Functional Requirements:**
- **Robust Modal Handling:** Ensure tests explicitly wait for modals to appear and, more importantly, disappear before proceeding with background interactions.
- **Enhanced Wait/Retry Logic:** Implement `waitForSelector({ state: 'hidden' })` or similar patterns for overlays.
- **Deterministic Mocking:** Verify that `mockFirebaseService` and other mocked services are returning consistent data to prevent flaky test results.
- **Improved E2E Coverage:** Fix the failing tests in:
    - `e2e/monthlyView.spec.ts`
    - `e2e/projections.spec.ts`
    - `e2e/reconciliation.spec.ts`
    - `e2e/scenarios.spec.ts`
    - `e2e/transactions.spec.ts`

**Non-Functional Requirements:**
- **Performance:** Ensure tests run efficiently without unnecessary long timeouts.
- **Reliability:** Eliminate "flakiness" by addressing intercepting elements and race conditions.
- **Maintainability:** Use clean, descriptive locator patterns.

**Acceptance Criteria:**
- All 16 E2E tests in the `e2e/` directory pass consistently in the local environment and in the GitHub Actions CI pipeline.
- No tests fail due to "element intercepts pointer events" errors.
- CI build on the `fix/e2e-build-failure` branch completes successfully.

**Out of Scope:**
- Adding new features or refactoring unrelated components.
- Modifying unit tests unless they are directly related to the E2E failures.
