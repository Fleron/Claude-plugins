---
name: ship-review
description: "Standalone final parallel-subagent review before shipping. Fans out N read-only reviewers, ranks findings with simple fixes for must-fixes, then offers a commit message. Publishing stays manual."
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
