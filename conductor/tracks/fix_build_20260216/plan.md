# Implementation Plan: Fix CI Build Errors

This plan outlines the steps to resolve the TypeScript errors blocking the CI build.

## Phase 1: Investigation & Fix (TDD)

- [ ] Task: Run `npm run type-check` to reproduce the errors locally.
- [ ] Task: Fix `types.ts` or imports to resolve `UnreconciledOccurrence` error.
- [ ] Task: Fix `components/test/MonthlyDashboard.test.tsx` to match the current `MonthlyDashboardProps`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Investigation & Fix' (Protocol in workflow.md)
