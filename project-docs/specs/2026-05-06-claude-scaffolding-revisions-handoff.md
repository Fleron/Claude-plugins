---
status: ready-for-plan-writing
spec_path: /Users/emil.fleron/Private/Claude-plugins/.claude/worktrees/evaluate-claude-scaffolding/project-docs/specs/2026-05-06-claude-scaffolding-revisions-design.md
created: 2026-05-06
---

# Handoff: claude-scaffolding workflow revisions

## Spec
- **Path:** /Users/emil.fleron/Private/Claude-plugins/.claude/worktrees/evaluate-claude-scaffolding/project-docs/specs/2026-05-06-claude-scaffolding-revisions-design.md

## Next step
Run `/claude-scaffolding:plan-writing` in a fresh session.

## Skills to invoke during implementation (in order)
1. `claude-scaffolding:plan-writing`
2. `claude-scaffolding:subagent-driven-development`
3. `claude-scaffolding:finishing-branch`

## Decisions locked during brainstorm
- Approach: surgical edits + new `plan-reviewer` agent (Approach B)
- Two distinct reviewer agents: `spec-compliance-reviewer` (extended to cover both spec-quality at brainstorm gate AND code-vs-spec at execution gate) and new `plan-reviewer` (plan-writing gate only)
- Plan persistence: plan-mode file only — no writes to `project-docs/plans/`
- Handoff location: `project-docs/specs/YYYY-MM-DD-<topic>-handoff.md` (sibling of spec)
- Mermaid chart location: `claude-scaffolding/reference/pipeline-flow.md`
- Skill-to-skill reference style: `claude-scaffolding:<skill-name>`
- New per-skill resources live inside the owning skill folder (`skills/brainstorm/*` and `skills/plan-writing/*`)

## Open questions for the implementer
- none

## Done when
All 14 files (5 new + 9 modified) match the spec; the brainstorm/plan-writing/SDD pipeline runs end-to-end with the new gates (subagent spec-quality review → handoff → stop, then plan-reviewer-before-human at plan-writing gate, then in-session plan consumption at SDD); the shared mermaid chart at `claude-scaffolding/reference/pipeline-flow.md` renders and every skill banner links to it.
