---
name: understand
description: Use when the user types /understand, or asks to understand, explain or get a visual briefing of a pull request, branch, plan, issue or the work in progress, for themselves or a technical colleague. Produces a four-section page from the system picture down to the code. Not for finding bugs or judging a change, which is code review.
---

# Understand

Make one visual briefing that helps a technical colleague, such as an architect or a technical
PM, understand a change. The page has four sections, each deeper than the one before:

1. **The picture.** The title, one sentence on what changes, before and after diagrams, and
   one card per shift in the model.
2. **Each concept and its code.** One card per concept from the picture, with its files.
3. **Flows step by step.** Sequence diagrams, each step linked to its code.
4. **Left out and still to do.** Only items someone wrote down.

Add a fifth section only when the change has two unrelated halves; it repeats section 1 for the
second half.

The briefing explains the change and never judges it. It has no findings, risks, verdicts or
review comments. It is read-only toward the repository: do not edit, commit or post anything.

## 1. Choose the target

Take the first rule that applies:

1. **An argument.** A PR number or URL, `#<n>` for an issue (read it as a plan), a file path
   (read it as a plan), or a branch name.
2. **A PR named by the host.** For example, lgtm's header. This counts as an argument and wins
   over local changes. Pass its explicit `owner/repo#n` or URL to every `gh` call. Never infer
   the PR from HEAD, because review worktrees often have a detached HEAD.
3. **The current branch has an open PR and no local changes beyond the PR head.** Use that PR.
4. **The current branch has commits or local changes against its base.** Use that diff,
   including staged, unstaged and untracked files. If the branch has an open PR, name it in the
   header.
5. **The conversation holds a plan or work in progress.** Use that.
6. **Nothing applies.** Ask the user what to explain.

Record two commits:

- **Head.** For a PR, GitHub's current head (`gh pr view <n> --json headRefOid`), fetched with
  `git fetch origin pull/<n>/head`; never an older local ref. For a branch, its tip, or `HEAD`
  for the current checkout.
- **Base.** For a PR, the merge base of its base branch and head. For a branch, the merge base
  of that branch's tip and the remote's default branch (`git symbolic-ref
  refs/remotes/origin/HEAD`). Fetch first if either is missing locally.

Working-tree content applies only under rules 3 and 4 with no argument. A branch named as an
argument is read only at its tip.

## 2. Evidence rules

Every claim on the page points at a source. Pick the link and the count by where the file lives:

| Source | Link | Count |
| --- | --- | --- |
| Committed and on GitHub | `https://github.com/<owner>/<repo>/blob/<head sha>/<path>#L<a>-L<b>` | `git diff --numstat <base> <head>` |
| Only local: unpushed commits, staged, unstaged, untracked | no link; show `path:line` as text and use the `local` chip | `git diff --numstat <base>`; an untracked file counts all lines as added |
| Deleted | link to the file at the base SHA, struck chip | removed lines from the same numstat |
| Plan, existing file | link at the base SHA | none |
| Plan, proposed new file | no link, `proposed` chip | none |

A commit is on GitHub when `git branch -r --contains <sha>` lists a remote branch, or when it
is a PR head.

## 3. Map the change (subagent)

Start a read-only mapper subagent with the host's native subagent tool. If there is none, do
the mapping yourself and say so in the reply. Give it this brief, filled in:

> Read-only. Target: <target>. Base <sha>, head <sha> (or "working tree"). Repository: <path>.
> Read the full diff, the PR description or plan, and enough connected code to explain how the
> change works. Return structured facts, not prose, in about 1,500 words. Every claim cites a
> source under these rules: <paste section 2>. Write "unclear" rather than guess.
>
> Return:
> 1. Before: the components involved and the main flow, step by step.
> 2. After: the same, with what changed. Make each flow precise enough to draw as a sequence
>    diagram, naming the actors, the calls and the data written.
> 3. Shifts in the model: each rule that changed, as "question: old → new" (for example, "when
>    is the email sent: inside the order request → by a worker after commit").
> 4. Concepts: group every changed file under the concept it serves, in flow order. Give each
>    file its counts and the key line range. Lockfiles, generated files and docs go under
>    "other". Tests sit with their concept.
> 5. Left out: only items with a written source. These come from the PR description or plan
>    ("not doing", "before ready", "limits"), constraint sections in docs the diff touches,
>    go-live, TODO or "testing aid" markers in the diff, and checks the description says were
>    not run. Quote or cite each item. Note an outage or ordering window when the description
>    describes one.

## 4. Fill the page

Copy `references/template.html` and replace its example content block by block. Keep its
`<style>` block unchanged. The comment at the top of the template holds the diagram geometry
rules; follow them exactly. Draw every diagram as inline SVG. Never use Mermaid.

What each section holds depends on the target:

| Section | PR or branch | Plan | Work in progress |
| --- | --- | --- | --- |
| 1 Picture | before = base, after = head | before = today, after = proposed | before = base, after = working tree |
| 2 Concepts | changed files with counts | files the plan touches, no counts | changed files, local ones marked |
| 3 Flows | flows as built | flows as proposed | flows as built so far |
| 4 Left out | PR description, doc constraints, markers in the diff, checks not run | the plan's "not doing" and open steps | unfinished steps the session names |

- Section 1 has one diagram pair. Number the after diagram's edges in flow order, and letter a
  second flow (A, B). Each section 2 card's badge repeats those numbers.
- Section 2 counts added plus removed lines. Its bar shows code lines per concept, and its lede
  gives the lines left out of the bar for tests, lockfiles and docs.
- Section 3 has one diagram and one step list per main flow, at most three flows. With no
  runtime flow, write "No runtime flow changes." and nothing else.
- Section 4 sorts items into its groups: steps someone must still take (including "before
  ready" checklists) go under "Not done yet, outside the code"; testing aids; documented limits
  under "Known limits"; checks under "Not run". Drop empty groups. When the description and the
  code disagree, the code wins: cite the code and mention the conflict in the reply.
- The `<title>` is a short name such as "PR 42 order email briefing". The header eyebrow names the
  target and the head SHA.

Writing rules for every word on the page:

- Use sentence case and no em dashes.
- Use plain verbs and active voice.
- Name the mechanism, not a feeling: "the API checks iss, aud and exp", not "tokens are
  handled securely".
- Each card's description is at most three sentences.
- Spec or rule numbers such as A14 only appear inside file chips, never in prose.

## 5. Verify (subagent)

Start a read-only verifier subagent on the filled page with this brief:

> Read-only. Check this briefing at <path> against <repository> at base <sha> and head <sha>,
> under these evidence rules: <paste section 2>. Check every diagram node and edge, every file
> chip, link, line range and count, every step in section 3, and every item in section 4.
> Report each claim that the source does not support, with the fix. Check SVG geometry too:
> every label inside its viewBox, no label overlapping a node or another label (estimate 6.5px
> per character for sans labels and 7.2px for monospace sublines, which must fit inside their
> node). Reply with a list of corrections, or "no corrections".

Apply the corrections. If it reported more than three wrong facts, run it once more on the
fixed page. Stop after two rounds. List anything still unresolved in the reply.

## 6. Publish

Keep an index at `~/.local/share/understand/index.json`. It maps a target key to one entry per
destination type:

```json
{
  "acme-example/shop#pr-42": {
    "claude-artifact": { "url": "https://claude.ai/artifact/…", "sha": "9b07d3e", "at": "2026-10-16T12:00:00Z" }
  }
}
```

Keys are `<owner>/<repo>#pr-<n>`, `#issue-<n>`, `#branch-<name>` or `#plan-<path>`. Destination
types are `claude-artifact`, `codex-preview`, `codex-tailnet` and `file`. Read the index before
publishing and write it after. Treat a missing or unreadable index as empty.

Choose by host:

- **Claude, with the Artifact tool.** Publish the filled page. If the index has a
  `claude-artifact` URL for the key, publish to that `url`. If that publish is refused because
  the artifact is gone or not editable, publish a new one and say so. Use the icon `diagram`
  on a new artifact.
- **Codex.** Ask one question: "Show it in the Codex design preview, or publish an HTML page
  over tailnet?"
  - **Preview.** Load the `visualize` skill and read `references/codex-preview.md`. Build the
    fragment from the same mapper facts, verified the same way. Write it where `visualize`
    says, named `<target-slug>.html`, and show it the way that skill describes. Record
    `codex-preview` with the file path.
  - **Tailnet.** Wrap the filled page as a standalone file:
    ```
    <!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>
    …page…
    </body></html>
    ```
    Write it to `~/.local/share/understand/<owner>-<repo>/<target-slug>.html`. Then follow the
    `tailnet-share` skill from development-flow, "Publish a static artifact", with the slug
    `understand-<target-slug>`. Record `codex-tailnet` with the URL it returns. If tailnet
    sharing fails, give the file path and the error.
- **Neither.** Write the standalone file as for tailnet, give its path and `open <path>`, and
  record `file`.

The target slug is the key in lowercase with every run of other characters turned into `-`,
for example `acme-example-shop-pr-42`.

## 7. Reply

Lead with the link or path. Then give one line per section saying what it shows. Then list
anything the verifier could not resolve, and any part of the evidence you could not reach, such
as a PR description with no rollout notes or checks that were not run. Keep it short; the page
is the answer.
