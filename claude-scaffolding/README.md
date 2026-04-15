# Skills & Development Workflow

## The Pipeline: Idea to Working Code

```
brainstorm → plan-writing → subagent-driven-development
   (what)       (how)        (execute)
```

### 1. Brainstorm (`skills/brainstorm/`)

**When:** Starting any new feature, component, or behavior change.

Collaborative dialogue that turns a vague idea into a concrete design spec. Asks clarifying questions one at a time, proposes 2-3 approaches with trade-offs, then writes a spec document to project claude root `project-docs/specs/`.

**Output:** Approved design spec (markdown). Automatically invokes plan-writing next.

### 2. Plan Writing (`skills/plan-writing/`)

**When:** You have an approved spec and need to break it into implementable tasks.

Takes the design spec and produces a step-by-step implementation plan with YAML frontmatter, exact file paths, complete code blocks, and TDD steps. No placeholders allowed — every step contains the actual code an engineer needs.

**Output:** Plan document in project root .claude folder under `project-docs/plans/` with checkbox tasks. Offers subagent-driven or inline execution.

### 3. Subagent-Driven Development (`skills/subagent-driven-development/`)

**When:** Executing an implementation plan in the current session.

Dispatches one fresh subagent per task from the plan. Each task goes through three stages:

1. **Implement** — `implementer` agent builds, tests, and commits
2. **Spec review** — `spec-compliance-reviewer` agent verifies the code matches the spec
3. **Code quality review** — code reviewer checks for quality issues

Review loops repeat until both reviewers approve before moving to the next task.

**Agents used:**

- `agents/implementer.md` — implements, tests, commits, self-reviews (Sonnet)
- `agents/spec-compliance-reviewer.md` — verifies code matches spec exactly (Sonnet)
- `agents/code-quality-reviewer.md` — reviews code quality against project coding guidelines (caller decides model)

**Dispatch templates:**

- `reference/implementer-prompt.md` — how to brief the implementer
- `reference/spec-reviewer-prompt.md` — how to brief the spec reviewer

## Supporting Skills

| Skill | Role in the pipeline |
|-------|---------------------|
| `tdd/` | Enforces test-first discipline — used by implementer agents during execution |

## Flow Diagram

```
User has an idea
        │
        ▼
   ┌──-───────┐
   │brainstorm│  explore → questions → approaches → design → spec
   └────┬─────┘
        │ approved spec
        ▼
  ┌──────────-─┐
  │plan-writing│  spec → file structure → TDD tasks → self-review
  └─────┬──────┘
        │ plan with tasks
        ▼
 ┌─────────-───┐
 │subagent-driven-development│  per task: implement → spec review → quality review
 └─────┬───────┘
       │
       ▼  (all tasks done)
  final review → finish branch
```
