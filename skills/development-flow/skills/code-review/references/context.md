# Lens: context

How the change sits in the surrounding codebase. Read the repo's own guidance first (`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`). Its conventions outrank your taste.

1. Existing mechanisms. Search the repo for helpers, utilities or patterns that already do what new code does. A second implementation beside an existing one is a finding, with the existing location named.
2. Surrounding style. File placement, naming, error handling, logging and typing should match the code around it. Name the neighbouring file that sets the pattern.
3. Surgical scope. The diff touches only what the change needs. Flag adjacent "improvements", drive-by refactors and reformatting.
4. Bounded growth. Anything the change adds to a hot path, payload, log line, prompt, cache key or persisted record must have a cap. Unbounded lists, retries or accumulation are findings.
5. Hidden coupling. New dependencies between modules, magic numbers without the external reason recorded, and behaviour that relies on ordering or global state.
6. Comments. Inline comments that restate the code are findings. A comment is warranted only for a non-obvious external constraint.
