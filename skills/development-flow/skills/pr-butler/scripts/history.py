#!/usr/bin/env python3
"""Local PR observations, decisions and action ownership shared by both hosts."""

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
import uuid


KINDS = {"observed", "reviewed", "decision", "action-started", "action-finished", "run-summary"}


def repository(value):
    if not re.fullmatch(r"[A-Za-z0-9.-]+/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", value):
        raise ValueError("repo must be host/owner/name")
    return value.lower()


def validate(event):
    if not isinstance(event, dict):
        raise ValueError("event must be a JSON object")
    event = dict(event)
    for key in ("repo", "actor", "agent", "run_id", "kind"):
        if not isinstance(event.get(key), str) or not event[key].strip():
            raise ValueError(f"{key} must be a nonempty string")
    event["repo"] = repository(event["repo"])
    event["actor"] = event["actor"].lower()
    if event["agent"] not in {"claude", "codex"} or event["kind"] not in KINDS:
        raise ValueError("unknown agent or event kind")
    if event["kind"] == "run-summary":
        if any(key in event for key in ("pr", "head", "base")):
            raise ValueError("run-summary is repository-wide; omit pr, head and base")
    else:
        if type(event.get("pr")) is not int or event["pr"] <= 0:
            raise ValueError("pr must be a positive integer")
        for key in ("head", "base"):
            if not isinstance(event.get(key), str) or not re.fullmatch(r"[0-9a-f]{40}", event[key]):
                raise ValueError(f"{key} must be a full commit SHA")
    data = event.get("data")
    if not isinstance(data, dict):
        raise ValueError("data must be an object")
    kind = event["kind"]
    if kind == "observed" and data.get("state") not in {"OPEN", "CLOSED", "MERGED"}:
        raise ValueError("observed data needs state OPEN, CLOSED or MERGED")
    if kind == "reviewed" and data.get("confirmed") is not True:
        raise ValueError("reviewed requires explicit user confirmation")
    if kind in {"decision", "action-started", "action-finished", "run-summary"}:
        if not isinstance(data.get("summary"), str) or not data["summary"].strip():
            raise ValueError("decision/action data needs a summary")
    if kind == "run-summary" and data.get("coverage") not in {"complete", "partial", "unavailable"}:
        raise ValueError("run-summary coverage must be complete, partial or unavailable")
    if kind == "action-finished":
        if not isinstance(data.get("action_id"), str) or not data["action_id"]:
            raise ValueError("action-finished needs the started event's action_id")
        if data.get("outcome") not in {"completed", "blocked", "interrupted"}:
            raise ValueError("outcome must be completed, blocked or interrupted")
    event.setdefault("event_id", uuid.uuid4().hex)
    if not isinstance(event["event_id"], str) or not event["event_id"].strip():
        raise ValueError("event_id must be a nonempty string")
    event.pop("at", None)
    return event


def connect():
    root = Path(os.environ.get("XDG_STATE_HOME") or Path.home() / ".local/state")
    directory = root / "pr-butler"
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.umask(0o077)
    db = sqlite3.connect(directory / "history.sqlite3", timeout=10)
    version = db.execute("PRAGMA user_version").fetchone()[0]
    if version not in {0, 1}:
        db.close()
        raise ValueError(f"unsupported history schema {version}; preserve the database")
    db.executescript("""
        CREATE TABLE IF NOT EXISTS events (
            seq INTEGER PRIMARY KEY, event_id TEXT NOT NULL UNIQUE,
            repo TEXT NOT NULL, pr INTEGER, actor TEXT NOT NULL,
            kind TEXT NOT NULL, action_id TEXT, payload TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS by_pr ON events(repo, pr, kind, seq);
        CREATE UNIQUE INDEX IF NOT EXISTS one_finish ON events(action_id)
            WHERE kind = 'action-finished';
        PRAGMA user_version = 1;
    """)
    return db


def active(db, repo, pr=None):
    query = """SELECT s.payload FROM events s
        WHERE s.repo = ? AND s.kind = 'action-started'
        AND NOT EXISTS (SELECT 1 FROM events f
            WHERE f.kind = 'action-finished' AND f.action_id = s.event_id)"""
    params = [repo]
    if pr is not None:
        query += " AND s.pr = ?"
        params.append(pr)
    return [json.loads(row[0]) for row in db.execute(query + " ORDER BY s.seq", params)]


def record(db, event):
    event = validate(event)
    with db:
        db.execute("BEGIN IMMEDIATE")
        previous = db.execute("SELECT payload FROM events WHERE event_id = ?",
                              (event["event_id"],)).fetchone()
        if previous:
            saved = json.loads(previous[0])
            comparable = dict(saved)
            comparable.pop("at")
            if comparable != event:
                raise ValueError("event_id already exists with different content")
            return saved
        action_id = None
        if event["kind"] == "action-started":
            if active(db, event["repo"], event["pr"]):
                raise ValueError("PR already has an unfinished action; reconcile its owner first")
        elif event["kind"] == "action-finished":
            action_id = event["data"]["action_id"]
            started = next((item for item in active(db, event["repo"], event["pr"])
                            if item["event_id"] == action_id), None)
            if not started:
                raise ValueError("no matching unfinished action for this PR")
            if started["run_id"] != event["run_id"]:
                if event["data"].get("reconciled") is not True:
                    raise ValueError("another run owns this action; explicit reconciliation required")
        event["at"] = datetime.now(timezone.utc).isoformat()
        db.execute("""INSERT INTO events
            (event_id, repo, pr, actor, kind, action_id, payload)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (event["event_id"], event["repo"], event.get("pr"), event["actor"],
             event["kind"], action_id, json.dumps(event)))
    return event


def summary(db, repo, actor):
    rows = db.execute("""SELECT payload FROM events WHERE seq IN (
        SELECT MAX(seq) FROM events WHERE repo = ? AND
        (kind IN ('observed', 'action-finished') OR
         (actor = ? AND kind IN ('reviewed', 'decision')))
        GROUP BY pr, kind) ORDER BY pr, seq""", (repo, actor.lower()))
    prs = {}
    for row in rows:
        event = json.loads(row[0])
        prs.setdefault(event["pr"], {"pr": event["pr"]})[event["kind"]] = event
    for event in active(db, repo):
        prs.setdefault(event["pr"], {"pr": event["pr"]}).setdefault("active_actions", []).append(event)
    for pr in prs.values():
        observed, reviewed = pr.get("observed"), pr.get("reviewed")
        pr["personal_review"] = "unknown"
        if observed and reviewed:
            pr["personal_review"] = ("current_at_last_observation" if all(
                observed[key] == reviewed[key] for key in ("head", "base")
            ) else "changes_since_review")
    last_run = db.execute("""SELECT payload FROM events WHERE repo = ? AND actor = ?
        AND kind = 'run-summary' ORDER BY seq DESC LIMIT 1""", (repo, actor.lower())).fetchone()
    return {"repo": repo, "actor": actor.lower(),
            "last_run": json.loads(last_run[0]) if last_run else None,
            "prs": [prs[key] for key in sorted(prs)]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    append = commands.add_parser("record", help="record one JSON event; stdout is the saved event")
    append.add_argument("--file", required=True, help="JSON file, or - for stdin")
    overview = commands.add_parser("summary", help="last observations, personal decisions and active actions")
    overview.add_argument("--repo", required=True, type=repository)
    overview.add_argument("--actor", required=True)
    history = commands.add_parser("show", help="full repository or PR history in insertion order")
    history.add_argument("--repo", required=True, type=repository)
    history.add_argument("--pr", type=int)
    args = parser.parse_args()
    try:
        event = None
        if args.command == "record":
            if args.file == "-":
                event = validate(json.load(sys.stdin))
            else:
                event = validate(json.loads(Path(args.file).read_text()))
        db = connect()
        try:
            if args.command == "record":
                result = record(db, event)
            elif args.command == "summary":
                result = summary(db, args.repo, args.actor)
            else:
                query, params = "SELECT payload FROM events WHERE repo = ?", [args.repo]
                if args.pr is not None:
                    query += " AND pr = ?"
                    params.append(args.pr)
                result = [json.loads(row[0]) for row in db.execute(query + " ORDER BY seq", params)]
            print(json.dumps(result, indent=2))
        finally:
            db.close()
    except (OSError, ValueError, sqlite3.Error) as error:
        print(f"history: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
