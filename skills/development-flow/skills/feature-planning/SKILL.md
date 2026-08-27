---
name: feature-planning
description: "Stage 1 of development-flow. Plan-mode interview that captures product/business requirements — never technical detail — into a feature-plan. Use before any new feature."
---

> **You are here:** stage 1 of 4 — feature-planning. See [reference/flow.md](../../reference/flow.md).

# Feature planning

**First action:** call `EnterPlanMode`.

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

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.

for simpler questions use the AskUserQuestion tool.

**Output** = the feature-plan = the plan-mode plan. Before presenting to the
human, dispatch **one** subagent (short inline prompt) to review for completeness

- leaked technical detail. Fix, then human approval → `ExitPlanMode` (saves +
clears context).

Next: `development-flow:implementation-planning`. Make sure to always include in the plan
this next step so it is automatically picked up.
