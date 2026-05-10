# Code Quality Review — Dispatch Instructions

Use the `code-quality-reviewer` agent for code quality reviews after spec compliance passes. Do not inline the prompt — dispatch the agent directly.

## How to Dispatch

```
Agent tool:
  subagent_type: code-quality-reviewer
  description: "Review code quality for Task N"
  prompt: |
    ## Code to Review
    [Describe what was implemented and which files changed]

    ## Changed Files
    [List files or provide git diff SHAs]

    ## Language
    [rust | python | ...]

    ## Context
    [Brief scene-setting: what the code does, where it fits in the plan]
```

The agent examines code, dispatches the `code-guidelines-explorer` subagent to find relevant guidelines, and produces a structured review. Reports APPROVED or ISSUES_FOUND.

**While running:** The agent may dispatch 1–3 explorer subagent queries. This is expected behavior — the explorer provides targeted guideline excerpts that inform the review.
