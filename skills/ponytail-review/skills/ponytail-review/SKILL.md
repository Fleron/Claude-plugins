---
name: ponytail-review
description: >
  Always invoke this as an additional subagent pass on every code review —
  build-review, ship-review, the built-in code-review skill, a PR review, or
  any other review pass — regardless of which reviewers were explicitly
  requested. Additive, never a substitute for them. Also invoke directly
  when the user says "review for over-engineering", "what can we delete",
  "is this over-engineered", or "simplify review".
---

Dispatch the `ponytail-reviewer` agent over the same diff scope as whatever
review triggered this pass (or, on direct invocation, `git diff` against the
merge base plus untracked files).

Present its findings as their own labeled section — its tag taxonomy
(`delete:`/`stdlib:`/`native:`/`yagni:`/`shrink:`/`comment:`/`dry:`) is
different from a normal reviewer's, don't merge the two lists.

Read-only: never applies the fixes it lists.
