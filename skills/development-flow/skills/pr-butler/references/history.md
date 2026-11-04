# History contract

`HISTORY` denotes `scripts/history.py` relative to this skill. Both hosts use
Python 3 and the same XDG state directory. The helper performs no GitHub calls.

At invocation, generate a unique `run_id`, resolve the authenticated login and
canonical host/owner/repository, and read:

```sh
python3 "$HISTORY" summary --repo github.com/owner/repo --actor login
python3 "$HISTORY" show --repo github.com/owner/repo --pr 123
```

Summary returns the latest observation, that actor's latest personal review and
decision, latest finished action, and every unfinished action per PR, plus the
actor's latest `run-summary`. These are
last-known facts, not a live readiness verdict. `show` returns the complete PR
history; omit `--pr` for the full repository journal, including run summaries.
Read it when the summary leaves an earlier decision or attempt unclear.
Do not infer closure from the summary; reconcile with the live inventory.

Write one event as a JSON file and call `record --file <file>`, or use stdin:

```sh
python3 "$HISTORY" record --file - <<'JSON'
{
  "event_id": "unique-event-id",
  "repo": "github.com/owner/repo",
  "pr": 123,
  "actor": "login",
  "agent": "codex",
  "run_id": "unique-session-id",
  "kind": "observed",
  "head": "1111111111111111111111111111111111111111",
  "base": "2222222222222222222222222222222222222222",
  "data": {"state": "OPEN", "checks": "pending", "mergeability": "unknown"}
}
JSON
```

The example IDs and hashes are placeholders. Use actual full head/base commit
IDs. `actor` is the human whose decision or review is recorded, not an agent
display name; another author's PR does not change the authenticated user's
identity. Set `agent` to `claude` or `codex`. The helper normalizes repository
and login casing and supplies a UTC timestamp. Use unique event IDs per event;
retrying an identical ID/content is idempotent. An ID with changed content fails.
If event_id is omitted, the helper creates one; preserve the returned ID.

| Kind | Required data | Other useful evidence |
| --- | --- | --- |
| `observed` | `state`: OPEN, CLOSED or MERGED | title, URL, draft, checks and their revision/run, mergeability, feedback, coverage gaps |
| `reviewed` | `confirmed`: true | user's actual confirmation, scope of completed walkthrough |
| `decision` | `summary` | approved batch/actions or deferral and reason; relevant evidence IDs |
| `action-started` | `summary` | approved decision ID, branch/worktree, session location, intended checks and external effects |
| `action-finished` | `action_id`, `outcome`, `summary` | commits, check results/URLs, unresolved blockers |
| `run-summary` | `summary`, `coverage`: complete, partial or unavailable | refresh failures, batch results, remaining blockers |

`run-summary` is repository-wide: omit `pr`, `head` and `base`. Record it at
handoff, or when a refresh fails, even if no current PR facts are available.
Describe inaccessible PRs/pages and what remains unknown. This records what
happened in the run without replacing earlier PR observations with invented
state or fresh timestamps. Coverage refers to the full inventory and required
status reads, not merely the pages that happened to succeed.

Use `reviewed` only after explicit confirmation of the complete comparison.
For a confirmed delta review, verify that the previous record covers the
unchanged part before recording the combined comparison. A partial reading
belongs in a decision record, not a complete review. A changed head OR base
makes the previous review stale; records for another human never satisfy it.

`action-started` atomically claims the PR across Butler runs. Its event_id is
the action ID. Record `action-finished` with that `action_id` and an outcome of
`completed`, `blocked` or `interrupted` only when the worker is no longer acting.
The head/base on the finish event describe the resulting observed comparison.
A second active action for the same PR is refused, even for the same run.
Serialize multiple repairs to one PR inside one action or finish each first.

An unfinished action has unknown effects. On restart, inspect the original
session, live PR and checkout. Never automatically replay or expire it. A
different run may finish its record only with `data.reconciled: true`, after
confirming the previous owner stopped and describing the observed effects in
`summary`. This is a factual reconciliation, not authorization for another
repair. Ask the user if ownership cannot be established. Claims do not detect
Otto, external agents or shared-branch activity; check those separately.

SQLite transactions protect claims and history from concurrent writes. A
failed write is a blocker for new repairs: inspect the journal before retrying.
Never delete/recreate a corrupt database or mark an uncertain operation complete.
Keep the journal local and private. Retain history until the user requests
cleanup; do not turn old records into standing action authorization.
