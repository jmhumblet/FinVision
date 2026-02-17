# Specification: Fix CI Build Errors

## Overview
The build on master is failing due to TypeScript compilation errors. Specifically, there are missing exports in `types.ts` and mismatched props in `MonthlyDashboard.test.tsx`. This track aims to resolve these type errors to restore a green build.

## Functional Requirements

### 1. Resolve Missing Export
- **Error**: `Module '"../types"' has no exported member 'UnreconciledOccurrence'.`
- **File**: `components/ReconciliationModal.tsx`
- **Action**: Ensure `UnreconciledOccurrence` is correctly defined and exported in `types.ts` or `utils/financialUtils.ts` (where it might have been moved) and import it correctly.

### 2. Fix Component Prop Mismatch
- **Error**: `Property 'monthName' does not exist on type 'IntrinsicAttributes & MonthlyDashboardProps'.`
- **File**: `components/test/MonthlyDashboard.test.tsx`
- **Action**: The `MonthlyDashboard` component's props interface likely changed (removing or renaming `monthName`), but the test was not updated. Inspect `components/MonthlyDashboard.tsx` to determine the correct props (e.g., `selectedDate` instead of `monthName`) and update the test accordingly.

## Non-Functional Requirements
- **Verification**: Run `npm run type-check` locally to confirm the fix.
- **CI**: The GitHub Actions build must pass after pushing the fixes.

## Acceptance Criteria
- [ ] `components/ReconciliationModal.tsx` imports `UnreconciledOccurrence` correctly.
- [ ] `components/test/MonthlyDashboard.test.tsx` passes type checking.
- [ ] `npm run type-check` passes locally.
