---
name: build-review
description: "Standalone parallel-subagent code review of the current build. Fans out N read-only reviewers over the diff, then ranks findings. Run any time during development-flow."
---

> **You are here:** build-review — standalone, run any time. See [reference/flow.md](../../reference/flow.md).

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
