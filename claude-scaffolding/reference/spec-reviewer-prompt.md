# Spec Compliance Review — Dispatch Instructions

Use the `spec-compliance-reviewer` agent for spec compliance reviews. Do not inline the prompt — dispatch the agent directly.

## How to Dispatch

```
Agent tool:
  subagent_type: spec-compliance-reviewer
  description: "Review spec compliance for Task N"
  prompt: |
    ## What Was Requested

    [Paste the FULL TEXT of the task spec here]

    ## What Implementer Claims They Built

    [Paste the implementer's report here]
```

The agent already knows how to review — it will read the code, compare against the spec, and report compliance or issues with `file:line` references. You only need to provide the spec and the implementer's report.
