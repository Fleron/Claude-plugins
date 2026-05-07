---
name: plan-writing
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

> **Pipeline position:** stage 2 of 3 — see [`reference/pipeline-flow.md`](../../reference/pipeline-flow.md).

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well. Assume they have no outside references or knowledge beyond the plan so any references for domain understanding are good to include.

**Announce at start:** "I'm using the plan-writing skill to create the implementation plan."

**Context:** This should be run in a dedicated worktree (created by brainstorming skill).

## Inputs

This skill expects a spec and a handoff. Read both before drafting the plan:
- **Spec path** — read it from the handoff's frontmatter (`spec_path`).
- **Handoff path** — provided by the user when they invoke the skill, or located in `project-docs/specs/`.

If either is missing, stop and ask the user for the path. Do not draft a plan without both inputs.

## Plan home

The plan lives in the **plan-mode plan file** for the current session. Do not write a separate file under `project-docs/plans/`. After the human approves and the user runs `ExitPlanMode`, the plan-mode file is the single source of truth that `subagent-driven-development` consumes.

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for. Thisq is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan is reasonable.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**

- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

Always ensure the plan is written in proper markdown using frontmatter.

**Every plan MUST start with this frontmatter header:**

```yaml
---
title: "[Feature Name] Implementation Plan"
goal: "One sentence describing what this builds"
architecture: "2-3 sentences about approach"
tech_stack:
  - Technology1
spec_path: <ABSOLUTE PATH TO SPEC>
handoff_path: <ABSOLUTE PATH TO HANDOFF>
implementation_method: "<one-line summary of the chosen method>"
skills_to_use:
  - claude-scaffolding:subagent-driven-development
  - claude-scaffolding:tdd
  - claude-scaffolding:finishing-branch
date: YYYY-MM-DD
---
```

## Plan body MUST contain

Near the top of the plan body (under the frontmatter), include these sections — every plan, no exceptions:

1. **Implementation method** — restate the chosen approach in 2-3 sentences and the rationale (why this method over alternatives). Without this, the plan is invalid and must be rewritten.
2. **Files referenced** — the spec, the handoff, and any coding-guidelines files relevant to this work. Use absolute paths.
3. **Skills used during execution** — copy from frontmatter, with a one-line note for each on when it is invoked.
4. **Definition of done** — overall completion criteria. Each task additionally has its own "done when" criterion in its step list.

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## No Placeholders

Every step must contain the actual content an engineer needs. These are **plan failures** — never write them:

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — the engineer may be reading tasks out of order)
- Steps that describe what to do without showing how (code blocks required for code steps)
- References to types, functions, or methods not defined in any task

## Remember

- Exact file paths always
- Complete code in every step — if a step changes code, show the code
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

## Subagent Plan Review (always FIRST, before human review)

Before showing the plan to the human, dispatch the plan-reviewer subagent with `skills/plan-writing/plan-reviewer-prompt.md`. The agent reads the plan, the spec, and the handoff, and reports either `APPROVED` or a list of issues.

Apply all `BLOCKING` issues inline. For `OBSERVATION` issues, decide case-by-case whether to address. Re-dispatch the reviewer until it returns `APPROVED`.

## Human Approval

Only after the plan-reviewer returns `APPROVED`, present the plan to the human. Iterate on their feedback. The skill is complete when the human explicitly approves and runs `ExitPlanMode`.

## After approval

When the human approves and runs `ExitPlanMode`, print:

> Plan approved. Next: run `/claude-scaffolding:subagent-driven-development` to execute. The plan-mode plan is the source of truth — do not re-draft.

Do not auto-invoke the next skill.
