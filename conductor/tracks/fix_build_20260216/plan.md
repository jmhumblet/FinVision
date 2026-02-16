# Implementation Plan: Fix CI Build Errors

This plan outlines the steps to resolve the TypeScript errors blocking the CI build.

## Phase 1: Investigation & Fix (TDD) [checkpoint: c422e58]

- [x] Task: Run `npm run type-check` to reproduce the errors locally. [checkpoint: fix complete]
- [x] Task: Fix `types.ts` or imports to resolve `UnreconciledOccurrence` error. [checkpoint: fix complete]
- [x] Task: Fix `components/test/MonthlyDashboard.test.tsx` to match the current `MonthlyDashboardProps`. [checkpoint: fix complete]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Investigation & Fix' (Protocol in workflow.md) [checkpoint: fix complete]
