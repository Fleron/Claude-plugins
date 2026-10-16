---
name: goal-control
description: Pause native Claude goal continuation when the user explicitly asks to stop or pause, or when work cannot continue without an external decision or unavailable prerequisite. Claude only.
---

# Pause goal continuation

Use this for an explicit stop or a real blocker, not to bypass unfinished checks or declare work complete. Finish only the wrap-up the user requested; do not start another review or implementation step.

Only the coordinating Claude session requests a pause. Delegated agents report blockers to their coordinator; they must not pause an inherited parent session.

In Claude, run:

```sh
node "${CLAUDE_PLUGIN_ROOT}/scripts/goal-control.mjs" request paused "User requested a pause"
```

For a blocker, use `request blocked "<specific missing decision or prerequisite>"`. Explain what remains and what would allow work to resume, then end the turn. `blocked` records the reason; the supported native transition is **paused**, not completed, cleared, or a native blocked status. The next user message can resume the goal.

SessionStart exports the session ID, runtime root and a native context key as `DEVELOPMENT_FLOW_CLAUDE_SESSION_ID`, `DEVELOPMENT_FLOW_CLAUDE_GOAL_CONTROL_ROOT` and `DEVELOPMENT_FLOW_CLAUDE_GOAL_CONTROL_CONTEXT`. The private marker directory lives under `<CLAUDE_CONFIG_DIR or ~/.claude>/runtime`, outside the protected plugin hierarchy. A sandboxed Bash command uses that exported location even when its `TMPDIR` differs from the hooks. The context key binds the native session and plugin identity; it does not change permissions.

The Stop hook consumes the request once and emits `continue: false`. Requests survive compaction, but startup, resume, and clear discard stale requests. Do not supply or guess context values, edit private goal state, use the separate `ccctl` goal store, or bypass sandbox permissions. Missing native plugin data or session context requires a fresh session or plugin reload; report the limitation if the helper fails.

Codex uses its native goal controls under their eligibility rules instead. This helper does not control Codex goals.
