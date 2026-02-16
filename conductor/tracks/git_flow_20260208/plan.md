# Implementation Plan: Automated PR & Push on Archive

This plan outlines the steps to integrate Git Push and PR automation into the Conductor archive workflow.

## Phase 1: Preparation & Templates [checkpoint: fbce943]

- [x] Task: Create `conductor/pr_template.md` with the standard sections (Overview, Context, Testing). [checkpoint: templates]
- [x] Task: Update `conductor/workflow.md` to document the new Archive Protocol. [checkpoint: templates]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Preparation & Templates' (Protocol in workflow.md) [checkpoint: templates]

## Phase 2: Workflow Automation (Agent Instructions) [checkpoint: b83b5d7]

Since Conductor is agent-driven, we update the "System Directive" / "Workflow" instructions that the agent follows.

- [x] Task: Update `GEMINI.md` (or the equivalent system prompt file if accessible, otherwise `conductor/workflow.md` serves as the source of truth) to include the "Pre-Archive Actions" step. [checkpoint: workflow automation]
- [x] Task: Create a shell script or helper function `scripts/create_pr.sh` (or `ps1`) that encapsulates the `gh` logic? [checkpoint: workflow automation]
- [x] Task: Update the "TRACK CLEANUP" section in `conductor/workflow.md` to explicitly list the `git push` and `gh pr create` steps before the "Move Item" step. [checkpoint: workflow automation]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Workflow Automation' (Protocol in workflow.md) [checkpoint: workflow automation]

## Phase 3: Verification [checkpoint: 193643a]

- [x] Task: Test the new flow by "archiving" this very track (`git_flow_20260208`). [checkpoint: verification]
- [x] Task: Verify that the code is pushed. [checkpoint: verification]
- [x] Task: Verify that a PR is created for this track. [checkpoint: verification]
- [x] Task: Verify that the track is then moved to archive. [checkpoint: verification]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Verification' (Protocol in workflow.md) [checkpoint: verification]
