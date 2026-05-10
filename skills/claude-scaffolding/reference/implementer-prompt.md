# Implementer — Dispatch Instructions

Use the `implementer` agent for task implementation. Do not inline the prompt — dispatch the agent directly.

## How to Dispatch

```
Agent tool:
  subagent_type: implementer
  description: "Implement Task N: [task name]"
  prompt: |
    ## Task Description

    [Paste the FULL TEXT of the task from the plan — don't make the agent read the file]

    ## Context

    [Scene-setting: where this fits in the project, dependencies, architectural context]

    Work from: [directory]
```

The agent already knows how to implement, test, commit, and self-review. You only need to provide the task spec and context. It will report back with a status (DONE, DONE_WITH_CONCERNS, BLOCKED, or NEEDS_CONTEXT).

**While running:** If the agent asks questions, answer clearly and completely before letting it proceed. Don't rush it into implementation.
