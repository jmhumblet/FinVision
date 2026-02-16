# Specification: Automated PR & Push on Archive

## Overview
This feature enhances the Conductor `archive` workflow. Currently, archiving a track simply moves files and updates the registry. This feature ensures that before a track is archived, its code is pushed to the remote repository and a Pull Request (PR) is automatically created or updated. This enforces a "Code Review Ready" state before a track is considered "Done" and filed away.

## Functional Requirements

### 1. Enhanced Archive Protocol
- **Trigger**: The existing `conductor:archive` command or workflow step.
- **Pre-Archive Actions**:
    1.  **Git Push**: Automatically push the current local branch to the remote `origin`.
    2.  **PR Creation/Update**:
        - Check if a PR already exists for the current branch.
        - **If No PR**: Create a new PR using the GitHub CLI (`gh`).
        - **If Existing PR**: Update the title and body of the existing PR.
- **Post-Archive Actions**:
    - Once the PR step is successful, proceed with the standard archive operations (move folder, update `tracks.md`, commit).

### 2. PR Content Standard
- **Title**: Format as `feat: <Track Description>` or `fix: <Track Description>` based on track type.
- **Body Template**: Use a standard markdown template with sections:
    - **Overview**: What does this PR do?
    - **Context**: Link to the `spec.md` and `plan.md` (which are about to be archived, so maybe link to the commit or just summarize). *Refinement: Since files are moving, links might break. We will embed the summary.*
    - **Testing**: How was this verified?

### 3. Error Handling
- If `git push` fails, abort the archive process and report the error.
- If `gh pr create` fails, abort the archive process and report the error.

## Non-Functional Requirements
- **Tooling**: Use `gh` (GitHub CLI) for PR operations.
- **Idempotency**: Running the command multiple times should be safe (updates existing PR instead of creating duplicates).

## Acceptance Criteria
- [ ] Running the archive command pushes the current branch.
- [ ] A PR is created if none exists.
- [ ] An existing PR is updated if it exists.
- [ ] The PR body follows the defined template.
- [ ] The track is only moved to `conductor/archive/` IF the Push and PR steps succeed.
