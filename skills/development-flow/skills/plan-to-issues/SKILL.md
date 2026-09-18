---
name: plan-to-issues
description: "Use when the user points at a GitHub issue or milestone that holds a plan or spec and asks to break it down, split it into tasks, make it delegable, create sub-issues, or says plan-to-issues."
---

# Plan to issues

Input is a GitHub issue or milestone. Output is a set of small, isolated tasks on GitHub that a worker session can pick up without further context. Nothing is written to local files.

## Read

- Issue: `gh issue view <n> --json number,title,body,labels,milestone,url`
- Milestone: `gh issue list --milestone "<name>" --state open --json number,title,body,url` and read each issue

`Explore` the repo before splitting anything. Task boundaries follow the code, not the prose.

## Split

One task ≈ one worker session's deliverable: a change that leaves the repo better and could ship as its own PR. Rules:

- **Isolated.** A task touches one area. Two tasks never edit the same file for the same reason.
- **Self-contained.** A novice with only the task and the repo can do it. Full repository-relative paths, exact names, every non-ordinary term defined where it first appears. No "see parent issue" in place of the explanation.
- **Outcome first.** Acceptance is behaviour a human can verify, never an internal attribute.
- **Dependencies are explicit.** A task lists what blocks it and nothing else. Prefer a shape where several tasks are ready at once.
- **Small.** Under 500 changed lines of logic. Larger means split again.

Each task uses exactly these headings:

```markdown
# <task title>
Part of #<parent>

## Outcome
What works after this task, and how to see it.

## Context
Where this sits in the repo. Paths, names, the one paragraph a newcomer needs.

## Steps
1. <idempotent step> → check: <how you know it worked>

## Validation
<working directory> `<exact command>` → <expected output>

## Blocked by
- #<n> <why>   (or "nothing")
```

Present the full set in chat as `T1..Tn`, each with its blockers, plus the list of tasks ready on day one. Iterate with the user until approved. Then `AskUserQuestion`: **separate issues** or **sub-issues** of the parent.

## Create

Create every task first, then wire relationships, since blockers need issue numbers.

1. Create each task, inheriting the parent's labels and milestone:
   ```sh
   gh issue create --title "<title>" --body-file - --label "<labels>" --milestone "<milestone>"
   ```
2. Replace `T<k>` references in bodies with the real numbers and `gh issue edit <n> --body-file -`.
3. Sub-issues: attach each to the parent. The endpoint wants the issue's numeric database id, not its number.
   ```sh
   id=$(gh api repos/{owner}/{repo}/issues/<child> --jq .id)
   gh api -X POST repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id="$id"
   ```
   Separate issues: append a task list to the parent body instead, one `- [ ] #<n>` per task.
4. Blocked-by, for either mode:
   ```sh
   id=$(gh api repos/{owner}/{repo}/issues/<blocker> --jq .id)
   gh api -X POST repos/{owner}/{repo}/issues/<blocked>/dependencies/blocked_by -F issue_id="$id"
   ```
   If the endpoint is unavailable on this repo, the `Blocked by` section in the body is the record.
5. Report a table: task, issue URL, blocked by, ready now.

Do not close, relabel or edit the parent beyond the task list. Do not create issues before the user has approved the split and chosen the mode.
