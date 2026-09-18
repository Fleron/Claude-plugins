---
name: tailnet-share
description: "Use when the user asks to share, publish or send a link to a local HTML file, report or presentation, wants a URL for something built in the session, mentions tailnet or Tailscale Serve, or asks to set up sharing on a new machine."
---

# Tailnet share

Tailscale Serve hands out a static directory as an HTTPS URL that only devices on the user's tailnet can reach. This is machine setup, not an application dependency. Slots are machine-wide and shared by every repository, worktree and agent session, so treat everything under the share root as belonging to someone else until proven otherwise.

## Layout

```
$SHARE_ROOT/                         default ~/.local/share/tailnet-shares
  <port>/public/                     what Tailscale serves at https://<host>:<port>/
  <port>/<slug>-owner.md             ownership notes, outside the served tree
  claims/<port>/<route-slug>/        reservations for live routes
  serve-before-setup.json            Serve config backup taken before first setup
```

Convention is four HTTPS slots on ports 8443 to 8446. The real inventory is whatever `tailscale serve status --json` says, never this document. Discover the host name with:

```sh
tailscale status --json | jq -r '.Self.DNSName | rtrimstr(".")'
```

## First-time setup

Run once per machine, only when `tailscale serve status` shows no static slots.

1. Confirm the daemon is up: `tailscale status` must list this machine. On macOS the Tailscale app owns the daemon and starts at login. On Linux use `systemctl is-active tailscaled` and `systemctl is-enabled tailscaled`.
2. Back up the current Serve config before touching it:
   ```sh
   mkdir -p ~/.local/share/tailnet-shares
   tailscale serve status --json > ~/.local/share/tailnet-shares/serve-before-setup.json
   ```
3. Create a slot and map it with `--bg` so the mapping survives the shell:
   ```sh
   mkdir -p ~/.local/share/tailnet-shares/8443/public
   tailscale serve --bg --https=8443 ~/.local/share/tailnet-shares/8443/public
   ```
   Repeat for 8444 to 8446. On Linux prefix with `sudo -n` if the CLI demands it.
4. Verify: `tailscale serve status` lists every slot, and `curl --fail https://<host>:8443/` answers.

`--bg` mappings persist across daemon and host restarts. Files live outside worktrees, so shares survive agent exit and worktree deletion. No web server process is needed for static files.

## Before publishing: check occupancy

Read `tailscale serve status --json` and list the slot directory. Never infer a port is free from a failed HTTP request, an empty landing page or an old timestamp. Serve configuration is the authority for routes. Socket listeners alone are not a complete inventory.

The slot ports are meant to be occupied by Tailscale. For a static artifact, reuse a slot with a fresh directory. Do not start another listener, change a mapping or claim a whole port. Many artifacts coexist on one port at different paths.

## Publish a static artifact

Static publication needs no Serve config change and no lock.

1. Pick a slot. Create a unique subdirectory atomically with `mktemp -d`, or `mkdir` without `-p` so a name collision fails instead of merging into someone else's directory.
2. Copy only the requested file and the assets it needs to render. Not the repo, not adjacent docs, never `.env` or credentials. Copies, never symlinks into source trees.
3. In the published copy, strip links to local documents that were not included. Leave the source untouched.
4. Verify with `curl --fail` and, for HTML, look at what rendered.
5. Write an owner note outside the served tree. Return the exact URL and say it is a snapshot: later edits to the source do not update the copy.

```sh
host=$(tailscale status --json | jq -r '.Self.DNSName | rtrimstr(".")')
root=~/.local/share/tailnet-shares
share_dir=$(mktemp -d "$root/8444/public/share-XXXXXXXX")
cp /absolute/path/to/requested.html "$share_dir/index.html"
slug=$(basename "$share_dir")
url="https://$host:8444/$slug/index.html"
curl --fail --silent --show-error -o /dev/null "$url"
printf 'source: %s\nowner: %s\nurl: %s\npublished: %s\n' \
  /absolute/path/to/requested.html "$USER / <session>" "$url" "$(date -u +%FT%TZ)" \
  > "$root/8444/$slug-owner.md"
printf '%s\n' "$url"
```

Update an existing artifact only when the owner note is yours or the user asks. Do not delete shares at session end. The user may still be reading them. Remove only an artifact the user has explicitly retired, and only that directory.

## Live applications

Static files are the default. A live preview also needs a backend process that stays alive, which `tailscale serve --bg` does not provide.

1. Find the app's actual local URL. Prefer an OS-assigned port. Check listeners first with `lsof -iTCP -sTCP:LISTEN -P -n` on macOS or `ss -ltnp` on Linux. If bind fails anyway, pick another port. Never kill a process or overwrite its route to make room.
2. Reserve the route before adding it. Create `$SHARE_ROOT/claims/<port>/` with `mkdir -p`, then the `<route-slug>` directory with plain `mkdir` so an existing claim fails loudly. Inside, record owner and session, source, backend URL, public path and how the backend is kept alive. If the claim or the route already exists and is not yours, pick another path. Do not assume it is stale.
3. Add the route on an unused path of a slot. Never repoint the static root.
   ```sh
   tailscale serve --bg --https=8445 --set-path=/<route-slug> http://127.0.0.1:<port>
   ```
4. Check base path, asset URLs and WebSocket behaviour behind the prefix.
5. Keep the claim while the route exists. Remove only your own retired route and claim.

Any Serve configuration change must be serialized across agents. On Linux hold `flock "$SHARE_ROOT/serve-config.lock"` around the change. macOS ships no `flock`, so use the claim directory as the lock: the `mkdir` that creates it is atomic, and the change is not made until it succeeds. In both cases reread the config, apply the one intended change, and confirm the other mappings are still there before letting go.

## Inspect and repair

```sh
tailscale status
tailscale serve status --json
```

If one static slot mapping is missing, restore only that slot, after confirming it was not deliberately reassigned:

```sh
tailscale serve --bg --https=8444 ~/.local/share/tailnet-shares/8444/public
```

Hard rules:

- Never `tailscale serve reset`. Other services may share the machine's Serve config.
- Never enable Funnel here. These shares are tailnet-only.
- Never restart the daemon just to publish a file. It carries other traffic.

Reference: https://tailscale.com/docs/reference/tailscale-cli/serve
