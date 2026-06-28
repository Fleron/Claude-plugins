---
name: claude-control-goals
description: Minimal /goal integration for Claude and Codex. Use when asked to pick or continue a claude-control repository goal; expects the installed ccctl CLI and relies on `ccctl goals --help` for discoverable behavior instead of direct SQLite access.
---

# Claude Control Goals

Use the installed CLI as the contract.

1. Run `ccctl goals --help`.
2. Use `ccctl goals next --json` to pick work unless the user names a goal.
3. Use `ccctl goals show <slug>` before working.
4. Use `ccctl goals start <slug>`, `ccctl goals block <slug> --reason "..."`, or `ccctl goals done <slug>` to update state.

Do not read claude-control SQLite directly unless the user explicitly asks for internal debugging.
