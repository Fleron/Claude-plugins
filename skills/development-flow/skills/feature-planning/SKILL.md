---
name: feature-planning
description: "Stage 1 of development-flow. Plan-mode interview that captures product/business requirements — never technical detail — into a feature-plan. Use before any new feature."
---

> **You are here:** stage 1 of 4 — feature-planning. See [reference/flow.md](../../reference/flow.md).

# Feature planning

**First action:** call `EnterPlanMode`.
**Skip this stage** when there is no product decision to make, only a technical one. Say so, and go to `development-flow:implementation-planning`.

## The interview

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Use `AskUserQuestion` instead for any question that reduces to discrete options — do this now or defer, in scope or out, this file or that one. Wide or open questions stay in the round format above.

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The interview is done when the frontier is empty: every branch visited, nothing left silently assumed.

## The contract

The feature-plan is the plan-mode plan. Emit exactly this:

```markdown
# <feature name>

## Problem
<who is hurt, how, and what it costs. No solution.>

## Behaviours
B1. WHEN <trigger> THE <subject> SHALL <observable result>.
B2. ...

## Not doing
- <thing a reader would otherwise assume is included>

## Decisions
D1. <decision> — <the cost we accept by taking it>.

## Done when
<how we will know, in the real world, that this worked>

Next: development-flow:implementation-planning
```

- **Behaviours are observable by a user or the business.** Same grammar as stage 2, one altitude up. Stage 2 adds the technical behaviours and invariants this level cannot see, and maps all of them onto files and tests.
- **Every tradeoff you accepted is a D-line, never prose.** If taking it costs something — a regression, a delay, a worse path for some users — that cost is written after the dash. A cost buried in a paragraph reads as settled, and the human will not challenge it.
- **`Not doing` is scope left out. `Decisions` is cost taken on.** They are different and both are required.
- **No technical detail.** No files, functions, schemas or libraries. That is stage 2's job.

## Review and approval

Dispatch the `plan-reviewer` agent. Tell it this is a feature-plan, and to also flag any technical detail that leaked in. Loop until it replies `approved, no blocking issues`, then human approval → `ExitPlanMode` (saves + clears context).

Always carry the next step in the plan so it is picked up automatically.
