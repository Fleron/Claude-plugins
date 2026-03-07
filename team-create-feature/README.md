# team-create-feature

A collaborative feature development command that uses Claude Code's native agent teams instead of subagents. Three specialists work together, debate directly, and build features with built-in product, engineering, and review perspectives.

## How it differs from `create-feature`

| | `create-feature` | `team-create-feature` |
|---|---|---|
| **Workers** | Sequential subagents (report back to main) | Persistent teammates (talk to each other) |
| **PM/UX** | `feature-description` subagent (one-shot) | PM teammate (active throughout) |
| **Dev** | `code-explorer` (Haiku) + `code-architect` (Sonnet) subagents | Research Analyst (Haiku) + Developer (Sonnet) teammates |
| **Review** | `code-reviewer` subagents (final pass) | Devil's Advocate/Opus (challenges throughout) |
| **Debate** | Not possible — agents don't talk to each other | PM, Developer, and DA can debate directly |
| **Cost** | Lower — results summarized back | Higher — 3 independent Claude instances |

Use `team-create-feature` when the feature benefits from ongoing product/engineering tension and continuous review. Use `create-feature` for faster, lower-cost feature work.

## Prerequisites

Agent teams are experimental and **disabled by default**. Before using this command, add the following to your `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Then restart Claude Code.

You can also enable it for a single session:

```bash
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude
```

## Usage

```
/team-create-feature:team-create-feature [feature description or ticket ID]
```

### Examples

```
/team-create-feature:team-create-feature Add a CSV export button to the reports page
/team-create-feature:team-create-feature LIN-423
/team-create-feature:team-create-feature Refactor the authentication flow to support SSO
```

## The Team

### UX/PM Analyst (Opus)
Interviews you to build a structured requirements summary, fetches tickets from Linear/Jira/GitHub if a ticket ID is provided, and stays engaged throughout to catch scope creep.

### Research Analyst (Haiku)
Handles all information gathering across three tracks simultaneously: codebase exploration (tracing patterns and finding relevant files), documentation search (local README/docs/wikis), and web research (library best practices, changelogs, external APIs). Produces an Initial Research Report broadcast to the full team, then stays available throughout the session for on-demand research requests from any teammate.

### Senior Developer (Sonnet)
Receives the Explorer's findings, designs a concrete implementation architecture, and builds the feature. Briefs the Devil's Advocate on completed areas for continuous review.

### Devil's Advocate (Opus)
Challenges requirements from the PM, interrogates the architecture proposal, and reviews implementation in progress. Rates concerns by severity (Critical / Important / Minor). Critical concerns block progress until addressed.

## Workflow

1. **PM Discovery** — PM interviews you (Opus), fetches tickets, broadcasts Requirements Summary
2. **Research** — Research Analyst (Haiku) runs codebase exploration, doc search, and web research in parallel; broadcasts Initial Research Report; stays on for on-demand lookups
3. **Architecture Design** — Developer (Sonnet) synthesizes both inputs and proposes an approach
4. **Architecture Debate** — Devil's Advocate (Opus) challenges the proposal; you approve before implementation
5. **Implementation + Continuous Review** — Developer builds, DA reviews in parallel
6. **Summary + Cleanup** — Final review findings surfaced to you, team cleaned up

## Security hooks

The plugin includes a `PreToolUse` hook that applies to **all team sessions** — lead, PM, Research Analyst, Developer, and Devil's Advocate. It blocks `Read`, `Bash`, and `Grep` from accessing sensitive credential and secret files.

**Blocked file categories:**

| Category | Examples |
|---|---|
| `.env` files | `.env`, `.env.local`, `.env.production`, `.env.*` |
| Private keys & certs | `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `*.cer`, `*.crt` |
| SSH keys | `~/.ssh/*`, `id_rsa`, `id_ed25519`, `id_ecdsa` |
| Cloud credentials | `~/.aws/credentials`, `~/.aws/config`, `service-account.json` |
| Shell credentials | `~/.netrc`, `~/.npmrc`, `~/.pypirc` |
| Secret files | `secrets.json/yml`, `credentials.json/yml`, `auth.json`, `*.secret` |
| Rails secrets | `config/master.key`, `config/credentials.yml.enc` |
| Terraform | `*.tfvars`, `terraform.tfstate[.backup]` |
| Kubernetes | `~/.kube/config`, `kubeconfig` |
| GPG / password stores | `~/.gnupg/`, `~/.password-store/` |

When blocked, teammates receive a clear message explaining why access was denied and are told to ask the user to provide specific values directly instead.

## Display modes

- **Default (in-process)**: Use `Shift+Down` to cycle through teammates and message them directly
- **Split panes** (requires tmux or iTerm2): Set `"teammateMode": "tmux"` in settings.json for each teammate in its own pane

## Known limitations

Agent teams are experimental. See the [official docs](https://code.claude.com/docs/en/agent-teams#limitations) for current limitations including no session resumption for in-process teammates, task status lag, and slow shutdown.
