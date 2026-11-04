---
name: pr-butler
description: "Use when the user wants to catch up on their authored PRs in a repository, see what needs attention and what changed since last time, or prepare several PRs through an approved batch of repairs. Keeps shared local history for Claude and Codex. A one-shot session, not continuous PR monitoring."
---

# PR Butler

Help the author finish work they have already started. List their open PRs,
explain what needs attention, agree a batch, carry it through the repository's
approved workflows, save the results and stop. Merging remains the user's action.

## Scope and repository rules

Default to the current repository and the authenticated GitHub user, including
draft PRs. Accept an explicit repository or author. Resolve the GitHub host and
canonical owner/name from the remote and `gh`; use that identity in every call.
If remotes are ambiguous, ask which repository. Never assume the checked-out
branch is the branch of a PR. An author's identity is not proof they control
the target repository or permission to modify somebody else's branch.

Read the repository's applicable AGENTS.md/CLAUDE.md and discover its skills for
repairs, merge conflicts, checks, architecture and review. Follow those workflows
and product working directories. Reuse installed skills through the host catalog;
do not embed a username, plugin-cache version or Leap-specific command.
If a required workflow is unavailable, report the limit for that action.

Use native subagents in either host when independent PR work benefits from them.
Give each its exact PR, pinned base/head, isolated checkout, approved action,
repository instructions, checks and return path. Never emulate unavailable
delegation with nested CLI agents. Work sequentially when delegation is absent.

## 1. Refresh the complete inventory

Resolve the authenticated login on the selected host with `gh api --hostname
<host> user --jq .login`. Read all pages of repository pull requests, then retain
the selected author's entries. For example, `gh api --hostname <host> --paginate
'repos/<owner>/<repo>/pulls?state=open&per_page=100' --jq '.[]'` emits one JSON
object per PR. Filter each object by `user.login`; do not treat that stream as
one JSON array. Page size is not a total-result limit. Do not use a default
`gh pr list` limit or a capped search as a complete inventory.

Use the journal below to read the previous observations and decisions. For
previously tracked PRs absent from a successful complete inventory, fetch each
PR directly to determine whether it closed, merged or changed author. A failed
page, inaccessible repository or missing PR is unknown, not proof of closure.
Record only successfully observed PR facts; disclose partial coverage and save
refresh failures in a `run-summary`, preserving earlier observations as last-known.

For each open PR, inspect the description and sufficient changed-file context
to write a one-line purpose. Fetch its current head and base, draft status,
mergeability, required checks and published reviews/threads. Use the repo's
approved state reader where available; otherwise use `gh pr view` and paginated
API calls for checks and threads. Embedded GraphQL collections may be partial:
follow their pageInfo rather than calling the first page review-clean.

Distinguish pending, failed, absent, skipped, cancelled and unknown checks. Check
the repository's actual requirements; all visible checks passing alone is not
proof that required checks ran. Keep unknown mergeability and unreadable review
state visible. Ignore unpublished pending reviews. Inspect current source before
calling feedback fixed; a resolved thread alone is not proof.

Do not run full reviews or test suites on every PR just to build the inventory.
Deep diagnosis, repairs and guided reviews can be proposed in the batch.

## 2. Present the chat inbox

Show the repository, author, observation time and coverage limit, if any. Lead
with changes since the last session, including tracked PRs now merged or closed.
Then give every open PR a short section, ordered by decisions/blockers first,
review needed next, ready next and waiting/deferred last. Keep deferred PRs visible;
show new failures or feedback even if a prior decision deferred the work.

Use a linked PR number/title, one sentence of purpose, a status line and the next
useful action. Status markers supply colour where chat cannot style text: red
for a blocker, amber for attention, green for ready, neutral for waiting/draft.
Always include the word; never rely on colour alone. Avoid a wide table or a
second repeated list of the same PRs. For example (illustrative, not live data):

> **[#123 · Improve invoice matching](https://github.com/example/project/pull/123)**
> Matches invoice lines against the correct purchase-order lines.
> 🟠 **Your review needed** · Checks passed · No conflicts · New commits since your review
> Next: walk through the changes since the commit you reviewed.

Keep checks, conflicts, published feedback and the user's own review distinct.
Only say **Ready for you to merge** when current repository gates, relevant
feedback and the user's review are satisfied for the current comparison. A
draft, missing evidence or unknown gate cannot receive that status. GitHub
approval and a user's private reading are separate evidence.

Record personal review only when that person explicitly confirms it. Save their
login and the head/base commit IDs they reviewed. If either changes, retain the
old record but show **Changes since your review**; offer a delta walkthrough.
Never infer personal review from a green check, an agent review or a GitHub view.

## 3. Agree a concrete batch

Propose a numbered batch naming PRs, observed heads, actions, checks and intended
external effects. Example: resolve #123's conflict, run its required checks,
commit and push; diagnose #124's failing test; guide the user through #125.
Allow a subset, edits or deferral. Record the user's actual approval and reasons
for deferral. Approval remains valid within that scope; do not re-ask at each
routine step. Past-session approval is history, not permission for a new batch.

Fix-and-push approval includes the necessary local fixes, validation, commits
and ordinary pushes for those PRs. Comments/replies (with exact proposed text),
thread resolution, labels, CI reruns, draft/ready transitions and attachment to a
persistent watcher must be named actions if wanted. They are not implied by a
repair. Never merge, approve, close PRs or enable auto-merge through Butler.

Include unfinished drafts in triage, but agree a separate implementation plan
before substantial feature work. Ask about product or architecture decisions;
do not silently expand a repair into a redesign. Keep working on independent
approved actions while one PR needs a decision.

## 4. Execute the batch once

Before each repair, refresh the PR state and check local worktrees and any active
Butler, Otto or other agent ownership. If another run owns the PR, report it and
skip competing work. Claim it with an `action-started` journal record before
editing. The helper refuses a second active action on the same repository/PR.
Its claim coordinates Butler sessions only; inspect other workflows separately.

Use an isolated worktree when the current checkout does not belong to this work
or contains unrelated changes. Preserve those changes and existing worktrees.
Verify the head repository, branch and base/head revisions before mutation. If
the PR changed materially since approval, re-evaluate and ask only for the new
scope. Handle dependent PRs in dependency order; avoid racing shared branches.
Do not force-push or discard work under ordinary fix-and-push approval.

Diagnose CI from logs before changing code. Repair branch-caused defects; do
not weaken tests or change unrelated infrastructure to make a failure green.
For an approved transient-failure rerun, retry once in this batch and inspect
the result; an unresolved failure remains a blocker, not an endless retry loop.
Validate review feedback against actual callers and constraints before fixing
it. Follow the repository's required checks and architecture/review process.
Reuse valid evidence for the same revision and rerun affected checks after edits.

Use `lgtm-review` for a requested personal walkthrough when available, preserving
its independent lenses and one-finding-at-a-time conversation. Otherwise use the
repository's guided review. A completed agent review does not mark the user read.

Commit and push only the approved changes after required local validation.
Refresh affected PRs after mutations. If CI remains pending, report **Waiting
for CI** and finish the batch; do not start a continuous babysitter or Otto loop
without a separate, explicit handoff. Do not leave unowned background workers.
Wait for delegated bounded work to return, or record an interruption honestly.

Record outcomes with resulting commits, checks and links. When an action-started
record lacks an outcome, inspect the live PR, checkout and original session
before doing anything: it may have pushed successfully before interruption.
Do not replay an action merely because its completion was not recorded. Reconcile
the claim only after confirming its owner stopped and its actual effects. If
ownership or effects remain uncertain, leave the claim and report the blocker.

## 5. Save and hand back

Refresh the affected observations, save the completed/blocked action evidence
and a `run-summary` with coverage, results and remaining blockers,
and give a compact result: what changed, what now needs the user, what is waiting
and what was left untouched. Stop after this approved batch. Do not invent an
automatic follow-up batch or schedule future work.

## Shared local history

Use `scripts/history.py` beside this skill. It uses Python's standard library
and stores a journal at `${XDG_STATE_HOME:-~/.local/state}/pr-butler/history.sqlite3`.
Claude and Codex use the same location; do not redirect it to plugin caches,
worktrees, the repository or the agent's general memory folder. For schema and
commands read [the history contract](references/history.md) before first use.

Save compact facts and evidence links, not full diffs, credentials, environment
dumps or raw CI logs. Observations, user decisions, personal review and action
outcomes are different event types. History is not a task backlog; use the
repository's task system for actual tasks, and never mark them done on the user's
behalf. A missing journal is a first run. A corrupt/unreadable journal is a
reported limit, not permission to replace it or forget active work.
