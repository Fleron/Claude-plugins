---
name: implementation-planning
description: "Stage 2 of development-flow. Plan-mode skill that turns the feature-plan into a behaviour contract the human reviews and the build follows. Use after feature-planning."
---

> **You are here:** stage 2 of 4 — implementation-planning. See [reference/flow.md](../../reference/flow.md).

# Implementation planning

**First action:** call `EnterPlanMode`. Consumes the feature-plan.
**Skip this stage** when you could describe the diff in one sentence. Say so, and implement.

`Explore` the current state of the repo before proposing anything.

## The contract

The plan is a behaviour contract, not a description of a solution. Emit exactly this:

```markdown
# <change name>
Feature-plan: <ref>

## Behaviours
B1. WHEN <trigger> THE <subject> SHALL <observable result>.
B2. ...

## Not doing
- <thing a reader would otherwise assume is included>

## Files
- path/to/x.py     — B1, B3
- tests/test_x.py  — pins B1-B3

## Verification
<exact commands> → <what "done" looks like>
```

- **One observable behaviour per line.** Not testable as written? Cut it or split it.
- **No implementation nouns** (constants, class names, structures) *unless the constant is
  the behaviour* — then it MUST get its own line. This is what puts a new threshold, rule or
  second code path in front of the reviewer instead of inside a paragraph reading as settled.
- **More than ~8 behaviours means the change is too big.** Split it and say so.
- **Those four headings and nothing else.** No architecture prose, rationale essays, measured
  tables, line anchors or naming. That is the executor's freedom, and it is what keeps the
  contract readable in one pass.

Prefer extending an existing mechanism with new inputs over adding one beside it. Where you
cannot, that is its own behaviour line and the human decides.

## Review, execution, handoff

Dispatch the `plan-reviewer` agent. Tell it this is an implementation plan. Loop until it
replies `approved, no blocking issues`, then human approval → `ExitPlanMode` (saves +
clears context).

Execution is ordinary post-plan-mode work, no dedicated skill. Per behaviour, in order:
write the failing test, confirm it fails, implement until green. Never edit a test to pass.

**Fixed final step:** run `development-flow:build-review` once → output an exact human
testing plan (incl. edge cases) → wait for the human.

## While planning

- Be a devil's advocate: push back on scope, offer 2-3 approaches with trade-offs, lead with
  your recommendation. Ask only what changes a behaviour line, one question per message.
- Follow existing patterns and touch as little as possible. Where existing code genuinely
  blocks the work, the fix is its own behaviour line.
- Never edit generated files (uv.lock, migrations, builds). Ask the user to run the generator.
