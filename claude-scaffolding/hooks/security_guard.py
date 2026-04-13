#!/usr/bin/env python3
import json, sys, re, os

data = json.load(sys.stdin)
tool_name = data.get("tool_name", "")
tool_input = data.get("tool_input", {})

if tool_name == "Bash":
    command = tool_input.get("command", "")
    patterns = [r'\bgit\s+add\s+\.\s*$', r'\bgit\s+add\s+-A\b', r'\bgit\s+add\s+--all\b']
    for p in patterns:
        if re.search(p, command, re.MULTILINE):
            sys.stderr.write("Security: 'git add .' is blocked. Stage files explicitly with 'git add <specific-file>'\n")
            sys.exit(2)

if tool_name in ("Read", "Write", "Edit"):
    file_path = tool_input.get("file_path", "")
    basename = os.path.basename(file_path)
    if re.match(r'^\.env(\..+)?$', basename):
        sys.stderr.write(f"Security: Access to '{file_path}' is blocked. .env files contain secrets.\n")
        sys.exit(2)

sys.exit(0)
