#!/usr/bin/env python3
import json, sys, os, subprocess

data = json.load(sys.stdin)
tool_input = data.get("tool_input", {})
file_path = tool_input.get("file_path", "")

if not file_path:
    sys.exit(0)

ext = os.path.splitext(file_path)[1].lower()


def find_project_root(start_path, markers):
    directory = os.path.dirname(os.path.abspath(start_path))
    while True:
        for marker in markers:
            if os.path.exists(os.path.join(directory, marker)):
                return directory
        parent = os.path.dirname(directory)
        if parent == directory:
            return None
        directory = parent


def run(cmd, cwd=None):
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=30, cwd=cwd
        )
        output = (result.stdout + result.stderr).strip()
        if output:
            print(f"[lint] {' '.join(cmd)}:\n{output}")
    except FileNotFoundError:
        pass  # tool not installed — skip silently
    except subprocess.TimeoutExpired:
        print(f"[lint] {' '.join(cmd)}: timed out after 30s")


if ext == ".py":
    run(["ruff", "check", "--fix", file_path])
    run(["ruff", "format", file_path])
    run(["ty", "check", file_path])

elif ext in (".ts", ".tsx", ".js", ".jsx"):
    run(["oxlint", file_path])
    root = find_project_root(file_path, ["tsconfig.json", "package.json"])
    if root:
        run(["tsc", "--noEmit"], cwd=root)

elif ext == ".rs":
    run(["rustfmt", file_path])
    root = find_project_root(file_path, ["Cargo.toml"])
    if root:
        run(["cargo", "clippy", "--", "-D", "warnings"], cwd=root)

sys.exit(0)
