---
name: build-review
description: "Use when the user asks for a review of the current uncommitted work, wants several reviewers on the diff, asks what is wrong with what was just built, or says build-review. Mid-development, not a ship gate."
---

# Build review

`AskUserQuestion`: **how many parallel reviewers** to run.

Fan out that many subagents, each given
[`reference/base-review-prompt.md`](../../reference/base-review-prompt.md)
**verbatim**, over the same scope.

**Scope:** infer from the branch; default to `git diff` + untracked files. Flag
temp/local/untracked files as **"remove or ignore?"** — not as defects.

Aggregate findings → **dedupe** → **rank**: showstopper → bug → duplicated code →
refactor → performance → nit. Present the ranked list.

User decides: loop back and fix (re-execute) or proceed.

**Read-only:** reviewers analyze, never modify.
