"""Exercise persistence and ownership through the public CLI in separate processes."""

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("history.py")
REPO = "github.com/owner/project"


class HistoryTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.env = dict(os.environ, XDG_STATE_HOME=self.directory.name)

    def event(self, kind="observed", **changes):
        value = dict(repo=REPO, pr=1, actor="author", agent="claude", run_id="first",
                     head="a" * 40, base="b" * 40, kind=kind, data={"state": "OPEN"})
        value.update(changes)
        return value

    def call(self, *args, event=None, success=True):
        result = subprocess.run([sys.executable, str(SCRIPT), *args], env=self.env,
                                input=json.dumps(event) if event is not None else None,
                                text=True, capture_output=True)
        if success:
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads(result.stdout)
        self.assertNotEqual(result.returncode, 0)
        return result.stderr

    def record(self, event, **kwargs):
        return self.call("record", "--file", "-", event=event, **kwargs)

    def summary(self, actor="author", repo=REPO):
        return self.call("summary", "--repo", repo, "--actor", actor)["prs"]

    def test_both_hosts_share_review_history_and_detect_head_or_base_changes(self):
        self.record(self.event())
        self.record(self.event("reviewed", data={"confirmed": True}))
        self.assertEqual(self.summary()[0]["personal_review"], "current_at_last_observation")
        self.record(self.event(agent="codex", run_id="second", head="c" * 40))
        current = self.summary()[0]
        self.assertEqual(current["personal_review"], "changes_since_review")
        self.assertEqual(current["reviewed"]["agent"], "claude")
        self.record(self.event(agent="codex", base="d" * 40))
        self.assertEqual(self.summary()[0]["personal_review"], "changes_since_review")
        self.assertEqual(self.summary(actor="someone-else")[0]["personal_review"], "unknown")

    def test_repository_host_and_pr_identity_are_isolated(self):
        for repo, number in ((REPO, 1), (REPO, 2), ("enterprise.example/owner/project", 1)):
            self.record(self.event(repo=repo, pr=number))
        self.record(self.event("reviewed", repo=REPO.upper(), actor="AUTHOR",
                               data={"confirmed": True}))
        own = self.summary()
        self.assertEqual(len(own), 2)
        self.assertEqual(own[0]["personal_review"], "current_at_last_observation")
        self.assertEqual(own[1]["personal_review"], "unknown")
        other = self.summary(repo="enterprise.example/owner/project")
        self.assertEqual(len(other), 1)
        self.assertEqual(other[0]["personal_review"], "unknown")

    def test_interrupted_work_survives_and_must_be_reconciled(self):
        started = self.record(self.event("action-started", data={"summary": "Approved conflict repair"}))
        self.assertEqual(self.summary()[0]["active_actions"][0]["event_id"], started["event_id"])
        error = self.record(self.event("action-started", run_id="next",
                                      data={"summary": "Retry repair"}), success=False)
        self.assertIn("unfinished action", error)
        finished = self.event("action-finished", run_id="next", agent="codex", data={
            "action_id": started["event_id"], "outcome": "completed",
            "summary": "Original session stopped; verified it already pushed commit a"})
        self.assertIn("reconciliation", self.record(finished, success=False))
        finished["data"]["reconciled"] = True
        self.record(finished)
        self.assertNotIn("active_actions", self.summary()[0])
        self.record(self.event("action-started", data={"summary": "A newly approved repair"}))

    def test_concurrent_claims_have_one_owner_without_losing_history(self):
        events = [self.event("action-started", run_id=str(i),
                             data={"summary": "Approved repair"}) for i in range(2)]
        processes = [subprocess.Popen([sys.executable, str(SCRIPT), "record", "--file", "-"],
                                      env=self.env, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE, text=True) for _ in events]
        for process, event in zip(processes, events):
            process.stdin.write(json.dumps(event))
            process.stdin.close()
        codes = [process.wait(timeout=15) for process in processes]
        for process in processes:
            process.stdout.close()
            process.stderr.close()
        self.assertEqual(sorted(codes), [0, 1])
        self.assertEqual(len(self.summary()[0]["active_actions"]), 1)

    def test_retries_are_idempotent_and_decisions_survive_new_observations(self):
        event = self.event("decision", event_id="approval-1", data={"summary": "Defer until Friday"})
        original = self.record(event)
        self.assertEqual(self.record(event), original)
        self.record(self.event())
        self.record(self.event(data={"state": "MERGED"}))
        current = self.summary()[0]
        self.assertEqual(current["decision"]["data"]["summary"], "Defer until Friday")
        self.assertEqual(current["observed"]["data"]["state"], "MERGED")
        history = self.call("show", "--repo", REPO, "--pr", "1")
        self.assertEqual(len(history), 3)
        event["data"]["summary"] = "Different decision"
        self.assertIn("different content", self.record(event, success=False))

    def test_invalid_events_do_not_erase_a_valid_review_or_claim(self):
        self.record(self.event("reviewed", data={"confirmed": True}))
        self.record(self.event("action-started", data={"summary": "Approved repair"}))
        for event in (self.event("reviewed", data={"confirmed": False}),
                      self.event(head="short"), self.event(pr=True),
                      self.event("action-finished", data={"action_id": "wrong", "outcome": "completed",
                                                          "summary": "Claim does not exist"})):
            self.record(event, success=False)
        current = self.summary()[0]
        self.assertTrue(current["reviewed"]["data"]["confirmed"])
        self.assertEqual(len(current["active_actions"]), 1)

    def test_corrupt_history_is_reported_and_preserved(self):
        directory = Path(self.directory.name) / "pr-butler"
        directory.mkdir()
        database = directory / "history.sqlite3"
        original = b"not a sqlite database"
        database.write_bytes(original)
        error = self.call("summary", "--repo", REPO, "--actor", "author", success=False)
        self.assertIn("database", error)
        self.assertEqual(database.read_bytes(), original)

    def test_failed_refresh_is_remembered_without_replacing_known_pr_facts(self):
        observation = self.record(self.event())
        run = dict(repo=REPO, actor="author", agent="codex", run_id="second",
                   kind="run-summary", data={"coverage": "partial", "summary": "Page 2 and PR #1 returned 403"})
        self.record(run)
        overview = self.call("summary", "--repo", REPO, "--actor", "author")
        self.assertEqual(overview["last_run"]["data"]["coverage"], "partial")
        self.assertEqual(overview["prs"][0]["observed"], observation)
        self.assertEqual(len(self.call("show", "--repo", REPO)), 2)
        self.assertEqual(len(self.call("show", "--repo", REPO, "--pr", "1")), 1)


if __name__ == "__main__":
    unittest.main()
