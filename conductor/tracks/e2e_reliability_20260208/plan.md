# Implementation Plan: E2E Testing Standardization & Reliability

## Phase 1: Infrastructure & Mocking Foundation
Establish the patterns for mocking the service layer to ensure deterministic tests and setup CI.

- [x] Task: Create Mock Data Fixtures
    - [x] Create `e2e/fixtures/mockData.ts` with standard user data, transactions, and projections.
- [x] Task: Implement Playwright Network Mocking
    - [x] Update `playwright.config.ts` or create a `e2e/global-setup.ts` to support mocking.
    - [x] Create a helper function `mockFirebase` to intercept calls to `firebaseService`.
- [x] Task: Refactor Existing `scenarios.spec.ts`
    - [x] Apply the new mocking strategy to the existing flaky tests.
    - [x] Verify they pass consistently without timeouts or retries.
- [x] Task: Setup GitHub Actions CI
    - [x] Create `.github/workflows/ci.yml`.
    - [x] Configure it to run `npm run test` (Vitest) and `npm run test:e2e` (Playwright) on PRs.

## Phase 2: Critical Flow Automation
Automate the core user journeys using the new deterministic infrastructure.

- [ ] Task: Implement Onboarding & Transaction Tests
    - [ ] Create `e2e/transactions.spec.ts`.
    - [ ] Test: Guest login -> Dashboard load.
    - [ ] Test: Add Transaction -> Verify in Table -> Verify Balance Update.
    - [ ] Test: Edit Transaction -> Verify Update.
    - [ ] Test: Delete Transaction -> Verify Removal.
- [ ] Task: Implement Projection Tests
    - [ ] Create `e2e/projections.spec.ts`.
    - [ ] Test: Add Base Projection -> Verify Chart Update.
    - [ ] Test: Edit Projection Frequency -> Verify Chart Change.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Critical Flow Automation' (Protocol in workflow.md)

## Phase 3: Integration Suite & Documentation
Create the separate integration suite and update project guidelines.

- [ ] Task: Create Full Integration Test
    - [ ] Create `e2e/integration.spec.ts`.
    - [ ] Implement a real "Login -> Create -> Read" flow against the actual Firebase project (using a test user credential from env vars).
    - [ ] Add `test:integration` script to `package.json` that runs only this file.
- [ ] Task: Update Project Documentation
    - [ ] Update `conductor/tech-stack.md` with the new E2E strategy.
    - [ ] Update `conductor/product-guidelines.md` with the "No Snapshots for Dynamic Data" policy.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration Suite & Documentation' (Protocol in workflow.md)
