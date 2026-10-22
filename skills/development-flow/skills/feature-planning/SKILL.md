---
name: feature-planning
description: "Use when the user wants to be interviewed about an idea, asks to grill them, wants a detailed spec, plan or issue written before any code, or says feature-planning. Also use before starting any feature or non-trivial change that has no plan yet."
---

# Feature planning

Write no code and change no files until the plan is recorded. `Explore` the repo before asking anything the code can answer.

## Method

Interview until shared understanding. Each round: about five questions aimed at the biggest unknowns right now, numbered, each with your recommended answer. Wait for the answers, then recompute what is still unknown and ask the next round. A question that depends on an answer still open belongs to a later round.

```
❓ **Q1** - **<title>**: <question, with options where they exist>

➡️ <recommended answer>
```

Use `AskUserQuestion` for anything that reduces to discrete options. Facts come from the repo or a sub-agent, never from the user. Decisions are the user's. Push back on scope, offer two or three approaches with trade-offs, lead with your recommendation. Done when nothing is left silently assumed.

Keep the feature outcomes in mind while establishing the implementation approach, including the data model, data flow, and major architectural patterns. Resolve the decisions that shape the implementation without prescribing low-level details.

Ground that approach in the current flow: who owns the data and state, where it enters and changes, and which existing mechanisms can carry the new behaviour. Agree on the smallest coherent change and its verification before implementation. If discovery changes a major architectural boundary or the agreed scope, revisit that direction before expanding the work. Verify the intended repository and branch immediately before the first implementation mutation.

For changed collection reads, settle the semantics in the Approach: who owns the fields used
for filtering and ordering, where filtering, ordering and cursor selection happen, and what
bounds the work per request. Distinguish a page or batch size from a total-data limit and state
where any total-data limit is enforced and why it is a product requirement. Do not introduce
an unagreed customer-data cap to avoid paging. If the current boundary forces a workaround, compare
repairing the owner or contract before choosing it.

Then dispatch the `plan-reviewer` agent. Loop until it replies `approved, no blocking issues`. Then human approval.

## Output

Present the plan in chat. Emit exactly these headings:

```markdown
# <feature name>

## Outcome
What a user can do after this ships, in plain language. The commands to run and what they see.

## Context
How the relevant parts of the repo fit together today. Full repository-relative paths, exact
function and module names, where new files go. Define every term that is not ordinary English
the first time, and say where it shows up in this repo. Trace the relevant current data flow
and identify who owns its data and state.

## Approach
The technical design and how it slots into the existing structure. Which existing mechanisms
extend, what is new and where it lives. Explain proposed changes to data ownership, state and
architectural boundaries, and why this is the smallest coherent change. Every ambiguity
resolved here, with why; leave incidental low-level details to implementation.

## Not doing
- <thing a reader would otherwise assume is included>

## Decisions
D1. <decision> — <the cost we accept by taking it>

## Steps
1. <idempotent step, safe to rerun> → check: <how you know it worked>

## Validation
<working directory> `<exact command>` → <expected output>. Behaviour a human can verify, plus
a scenario that proves the change does something beyond compiling.
Choose functional cases that would reject the weaker solution. For changed collections, include
the relevant cases: matches beyond a prior scan window, global ordering across pages, or related
names outside the loaded page. Use the cases the behavior requires, rather than checking only
page traversal or an implementation's chosen limit.
```

Writing rules:

- **Self-contained.** A novice with only this document and the repo can do the work. No "as discussed", no pointers to other docs in place of the explanation.
- **Outcome first.** Acceptance is behaviour ("GET /health returns 200 with body OK"), never an internal attribute ("added a HealthCheck struct"). For internal changes, show how the effect is still demonstrable.
- **Resolve, don't delegate.** Ambiguity gets settled in the plan with a reason. Over-explain user-visible effects, under-specify incidental implementation detail.
- **Safe to rerun.** Steps are idempotent. Anything destructive spells out backup or fallback.
- **Every tradeoff is a D-line.** A cost buried in prose reads as settled.
- **Evidence.** Where a step produces output that proves success, include a short indented example.

## Record

After approval, `AskUserQuestion`: record the plan locally in `docs/tasks/<yyyy-mm-dd>-<slug>.md`, on a GitHub issue or milestone with `gh`, or not at all. Do that, then stop. Implementation is a separate decision.
