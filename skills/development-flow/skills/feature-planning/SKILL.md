---
name: feature-planning
description: "Stage 1 of development-flow. Plan-mode interview that captures product/business requirements — never technical detail — into a feature-plan. Use before any new feature."
---

> **You are here:** stage 1 of 4 — feature-planning. See [reference/flow.md](../../reference/flow.md).

# Feature planning

**First action:** call `EnterPlanMode`.

Interview the user **one question at a time** with `AskUserQuestion` — never
inline prose.

Capture **only what lives outside the repo:**

- business rules
- users & key flows
- measurable success
- load / scale
- edge cases
- UX / language
- external integrations (is the other side built? contract shape?)

**Forbidden:** architecture, tools, files, data models, code. Park any technical
question that surfaces under an **"open for implementation-planning"** list — do
not answer it here.

**Output** = the feature-plan = the plan-mode plan. Before presenting to the
human, dispatch **one** subagent (short inline prompt) to review for completeness
- leaked technical detail. Fix, then human approval → `ExitPlanMode` (saves +
clears context).

Next: `development-flow:implementation-planning`. Make sure to always include in the plan
this next step so it is automatically picked up.
