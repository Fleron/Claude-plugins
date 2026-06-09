---
name: implementation-planning
description: "Stage 2 of development-flow. Plan-mode skill that turns the feature-plan into a technical plan which is also the build harness. Use after feature-planning."
---

> **You are here:** stage 2 of 4 — implementation-planning. See [reference/flow.md](../../reference/flow.md).

# Implementation planning

**First action:** call `EnterPlanMode`. Consumes the feature-plan.

Produce the **technical plan, which is also the build harness** use a user interview approach
It MUST contain:

- use the Explore tool to analyze current state of the repo based on the feature plan
- architecture, components, data flows, interfaces, tools — follow repo conventions
- **chosen implementation method + rationale** — mandatory; plan is invalid without it
  - This needs to be a granular plan detailing all changes to be made, where and how.
  It shouldnt specify the exact code to input but a detailed flow and how things should work together
  as well as relevantly named functions, globals and so on.
- reference to the feature-plan
- **task breakdown** with independence noted (sequential default; parallel only
  when tasks touch disjoint files and Claude judges it safe)
- the **testing method** to follow during execution
- whether to self-review per task (optional — the plan decides or asks)
- tests to perform to validate acceptance critera. Both that tests exist and potentially real testing
- **fixed final step of the plan:** run `build-review` once → output an exact
  human testing plan (incl. edge cases) → wait for the human

Dispatch **one** subagent to review the plan **first** (short inline prompt); fix
blocking issues; then human approval → `ExitPlanMode` (saves + clears context).

Executing the approved plan afterward is **ordinary post-plan-mode execution — no
dedicated skill.** Its last step runs `development-flow:build-review`.

## User Interview approach

- be a devils advocate. Push back if too many things at once. Suggest alternative methods or breakdowns
- For appropriately-scoped projects, ask questions one at a time to refine the idea
- Prefer multiple choice questions when possible, but open-ended is fine too
- Only one question per message - if a topic needs more exploration, break it into multiple questions
- Focus on questions needed to produce exact technical plan

**Exploring approaches:**

- Propose 2-3 different approaches with trade-offs
- Present options conversationally with your recommendation and reasoning
- Lead with your recommended option and explain why

## Design patterns

**Design for isolation and clarity:**

- Break the system into smaller units that each have one clear purpose, communicate through well-defined interfaces, and can be understood and tested independently

**Working in existing codebases:**

- Explore the current structure before proposing changes. Follow existing patterns.
- Where existing code has problems that affect the work (e.g., a file that's grown too large, unclear boundaries, tangled responsibilities), include targeted improvements as part of the design - the way a good developer improves code they're working in.
- think surgically. Design for slide in features touching as little as possible if no refactors or code structure needs changing.
- Avoid all type of inline commenting unless explicitly approved by user.
- Never edit generated code directly. Also always ask user if they want to update themselves. uv.lock, migrations builds and so on.
