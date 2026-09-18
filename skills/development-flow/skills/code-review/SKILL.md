---
name: code-review
description: "Use when the user asks for a review of the current diff, branch or pull request, wants a final check before shipping or opening a PR, asks what is wrong with what was just built, or says code-review."
---

# Code review

Ported from the Codex `code-review` orchestrator and its `code-review-*` skills, made repo-neutral.

## Scope

Infer from the argument. No argument: `git diff` against the merge base plus untracked files. A PR number, URL or branch: that PR's diff via `gh pr diff`. Flag temp, local or untracked files as "remove or ignore?", never as defects.

## Method

Dispatch the `code-reviewer` agent once per lens, all in parallel, each given the scope and the full path of one lens file:

- [references/testing.md](references/testing.md)
- [references/context.md](references/context.md)
- [references/change-size.md](references/change-size.md)
- [references/breaking-changes.md](references/breaking-changes.md)

Run reviewers at the highest reasoning available. Codex: `xhigh`. Claude Code: the agent definition pins the model.

If the repo carries its own review guidance (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, a `docs/review/` directory), every reviewer reads it and applies it under its lens. Repo rules outrank the lens file.

## Report

Return every single finding from every reviewer. There is no cap. Use raw Markdown. Number findings for reference. Each finding names a specific file path and line number. Group by lens, keep the reviewer's own severity, and do not merge or soften findings.

## GitHub

When reviewing a PR and the authenticated user owns it, add a `code-reviewed` label. Do not leave GitHub comments unless explicitly asked.

## Read-only

Reviewers analyze, never modify. Fixing is the user's next decision.
