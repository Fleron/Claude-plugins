# Spec Quality Review Prompt (brainstorm gate)

You are reviewing a design spec for quality before it is handed off for plan-writing. You are NOT comparing code against the spec — you are reviewing the spec itself.

Spec path: <ABSOLUTE PATH>

Run all of these checks:
1. **Placeholder scan:** any TBD, TODO, "implement later", "fill in details", "add appropriate ..."? List file:line for each.
2. **Internal consistency:** do any sections contradict each other? Does the architecture match the feature descriptions?
3. **Scope check:** is this focused enough for a single implementation plan, or does it need decomposition?
4. **Ambiguity check:** could any requirement be interpreted two ways? Pick examples and flag them.

Report format. Either:
- `APPROVED` (no issues), or
- A bullet list of issues, each: `[BLOCKING|OBSERVATION] <file:line if applicable> — <issue>`

Be precise and brief. No prose paragraphs.
