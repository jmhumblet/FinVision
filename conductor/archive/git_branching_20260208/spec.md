# Specification: Enforced Branching & Git Flow

## Overview
This track updates the Conductor workflow to enforce a strict branching strategy. For every new track, Conductor must ensure the repository is clean and up-to-date on `master` before creating a dedicated feature branch. All work for the track happens on this branch. Finally, the archiving process is updated to switch back to `master` and clean up the local branch after the Pull Request is opened.

## Functional Requirements

### 1. New Track Initialization (Pre-Implementation)
- **Check Workspace**: Verify that the current branch is `master` (or `main`) and that the working directory is clean.
    - If dirty: Abort and instruct user to stash/commit.
    - If not on master: Checkout master.
- **Pull Latest**: Execute `git pull origin master` (or `main`) to ensure the base is up-to-date.
- **Create Branch**: Create and checkout a new branch named based on the track type and description:
    - Format: `<type>/<short-slug>`
    - Example: `feat/add-login-screen` or `fix/nav-bar-crash`.
    - The slug should be derived from the user's track description.

### 2. Archive Workflow (Post-PR)
- **Context**: This runs *after* the `git push` and `gh pr create` steps defined in the previous track (`git_flow_20260208`).
- **Switch Branch**: Checkout `master` (or `main`).
- **Cleanup**: Delete the local feature branch (`git branch -D <branch-name>`) since it has been pushed and PR'd.
- **Pull Latest (Again)**: Optional but recommended to keep master fresh.

### 3. Agent Instructions
- Update `conductor/workflow.md` (or the system prompt file) to explicitly list these git commands as mandatory steps in the `TRACK IMPLEMENTATION` and `TRACK CLEANUP` protocols.

## Non-Functional Requirements
- **Safety**: Do not delete the branch if the push or PR creation failed.
- **Naming**: Ensure branch slugs are URL-safe (lowercase, hyphens only).

## Acceptance Criteria
- [ ] Starting a new track fails if the workspace is dirty.
- [ ] Starting a new track automatically pulls master and creates a correctly named branch.
- [ ] Archiving a track switches back to master and deletes the local feature branch.
- [ ] The workflow documentation reflects these new mandatory steps.
