# Implementation Plan: Automated PR & Push on Archive

This plan outlines the steps to integrate Git Push and PR automation into the Conductor archive workflow.

## Phase 1: Preparation & Templates [checkpoint: fbce943]

- [x] Task: Create `conductor/pr_template.md` with the standard sections (Overview, Context, Testing). [checkpoint: templates]
- [x] Task: Update `conductor/workflow.md` to document the new Archive Protocol. [checkpoint: templates]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Preparation & Templates' (Protocol in workflow.md) [checkpoint: templates]

## Phase 2: Workflow Automation (Agent Instructions)

Since Conductor is agent-driven, we update the "System Directive" / "Workflow" instructions that the agent follows.

- [ ] Task: Update `GEMINI.md` (or the equivalent system prompt file if accessible, otherwise `conductor/workflow.md` serves as the source of truth) to include the "Pre-Archive Actions" step.
    - *Note: Since I am the agent, I will update the `conductor/workflow.md` which I read to guide my actions.*
- [ ] Task: Create a shell script or helper function `scripts/create_pr.sh` (or `ps1`) that encapsulates the `gh` logic?
    - *Decision: Better to keep it as raw `run_shell_command` instructions in the workflow doc for the agent to execute.*
- [ ] Task: Update the "TRACK CLEANUP" section in `conductor/workflow.md` to explicitly list the `git push` and `gh pr create` steps before the "Move Item" step.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Workflow Automation' (Protocol in workflow.md)

## Phase 3: Verification

- [ ] Task: Test the new flow by "archiving" this very track (`git_flow_20260208`).
- [ ] Task: Verify that the code is pushed.
- [ ] Task: Verify that a PR is created for this track.
- [ ] Task: Verify that the track is then moved to archive.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Verification' (Protocol in workflow.md)
