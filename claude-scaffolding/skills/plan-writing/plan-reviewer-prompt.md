# Plan Reviewer Prompt

You are reviewing an implementation plan BEFORE the human reviews it. The plan lives in the active plan-mode plan file (path provided below). It must reference a spec and a handoff doc — read both before reviewing.

Plan path: <ABSOLUTE PATH TO PLAN-MODE PLAN FILE>
Spec path: <will be in plan frontmatter as `spec_path`>
Handoff path: <will be in plan frontmatter as `handoff_path`>

Run all of these checks:
1. **Frontmatter completeness:** spec_path, handoff_path, implementation_method, skills_to_use are all present and non-empty.
2. **Spec coverage:** for each requirement in the spec, locate the task that implements it. List any uncovered requirements.
3. **Placeholder scan:** TBD/TODO/"implement later"/"add appropriate ..." in any task — list file:line.
4. **Type / method consistency:** function/method/property names used in later tasks must match those defined in earlier tasks. List inconsistencies.
5. **Definition of done:** every task must have a "done when" criterion. The plan must have an overall DoD. List missing criteria.

Report format. Either:
- `APPROVED`, or
- A bullet list: `[BLOCKING|OBSERVATION] <task#/section> — <issue>`

Be precise and brief.
