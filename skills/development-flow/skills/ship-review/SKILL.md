---
name: ship-review
description: "Use when the user says they want to ship, commit or open a PR for the current work and wants a last check first, asks for a go or no-go, or says ship-review."
---

# Ship review

`AskUserQuestion`: **how many parallel reviewers** to run.

Same fan-out as build-review, using
[`reference/ship-review-prompt.md`](../../reference/ship-review-prompt.md)
**verbatim**, over the same scope (`git diff` + untracked files; flag
temp/local/untracked as "remove or ignore?").

Present ranked findings; **MUST-fixes come with proposed simple solutions** and
loop back to execution.

When clean → `AskUserQuestion`: use a generated conventional commit message, or
the user commits themselves. **Publishing stays manual.**

**Read-only:** reviewers analyze, never modify.
