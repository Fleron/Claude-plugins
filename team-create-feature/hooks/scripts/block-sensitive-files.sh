#!/bin/bash
# block-sensitive-files.sh
#
# PreToolUse hook for team-create-feature.
# Blocks Read, Bash, and Grep from accessing sensitive credential and secret files.
# Applies to all team sessions: lead, PM, Research Analyst, Developer, Devil's Advocate.
#
# Exit 2 = blocked (stderr fed back to Claude as a blocking message).
# Exit 0 = allowed.

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
TOOL_INPUT=$(echo "$INPUT" | jq -c '.tool_input // {}')

# ---------------------------------------------------------------------------
# PATH_PATTERN — used for Read and Grep file paths.
# Requires a path separator or start-of-string before the sensitive filename.
# Covers:
#   .env files:        .env, .env.local, .env.production, .env.<anything>
#   Private keys/certs: .pem, .key, .p12, .pfx, .cer, .crt, .jks, .keystore
#   SSH:               .ssh/ directory and id_rsa/id_ed25519/id_ecdsa/id_dsa
#   Cloud credentials: .aws/credentials, .aws/config, service-account.json
#   Shell credentials: .netrc, .npmrc, .pypirc
#   Secret files:      secrets.json/yml, credentials.json/yml, *.secret, auth.json
#   Rails secrets:     config/master.key, config/credentials.yml.enc
#   Terraform:         *.tfvars, terraform.tfstate[.backup]
#   Kubernetes:        .kube/config, kubeconfig
#   GPG / pw stores:   .gnupg/, .password-store/
# ---------------------------------------------------------------------------
PATH_PATTERN='(^|[/\\])\.env(\.[a-zA-Z0-9_-]+)?$'
PATH_PATTERN+='|\.(pem|key|p12|pfx|keystore|jks|cer|crt)$'
PATH_PATTERN+='|(^|[/\\])\.ssh[/\\]'
PATH_PATTERN+='|(^|[/\\])\.aws[/\\](credentials|config)$'
PATH_PATTERN+='|(^|[/\\])\.netrc$'
PATH_PATTERN+='|(^|[/\\])(id_rsa|id_ed25519|id_ecdsa|id_dsa)$'
PATH_PATTERN+='|(secrets?|credentials?)\.(json|ya?ml)$'
PATH_PATTERN+='|service[_-]?account\.json$'
PATH_PATTERN+='|(^|[/\\])config[/\\]master\.key$'
PATH_PATTERN+='|(^|[/\\])config[/\\]credentials\.yml\.enc$'
PATH_PATTERN+='|\.secret$'
PATH_PATTERN+='|(^|[/\\])auth\.json$'
PATH_PATTERN+='|(^|[/\\])\.npmrc$'
PATH_PATTERN+='|(^|[/\\])\.pypirc$'
PATH_PATTERN+='|\.tfvars$'
PATH_PATTERN+='|terraform\.tfstate(\.backup)?$'
PATH_PATTERN+='|(^|[/\\])\.kube[/\\]config$'
PATH_PATTERN+='|(^|[/\\])kubeconfig$'
PATH_PATTERN+='|(^|[/\\])\.gnupg[/\\]'
PATH_PATTERN+='|(^|[/\\])\.password-store[/\\]'

# ---------------------------------------------------------------------------
# CMD_PATTERN — used for Bash commands.
# Uses space/start-of-string as the word boundary since bash commands contain
# spaces between arguments. Same sensitive targets, different anchoring.
# ---------------------------------------------------------------------------
CMD_PATTERN='(^|[[:space:]])\.env(\.[a-zA-Z0-9_-]+)?([[:space:]]|$)'
CMD_PATTERN+='|\.(pem|key|p12|pfx|keystore|jks|cer|crt)([[:space:]]|$)'
CMD_PATTERN+='|\.ssh[/\\]'
CMD_PATTERN+='|\.aws[/\\](credentials|config)'
CMD_PATTERN+='|(^|[[:space:]])(id_rsa|id_ed25519|id_ecdsa|id_dsa)([[:space:]]|$)'
CMD_PATTERN+='|(^|[[:space:]])(secrets?|credentials?)\.ya?ml([[:space:]]|$)'
CMD_PATTERN+='|(^|[[:space:]])(secrets?|credentials?)\.json([[:space:]]|$)'
CMD_PATTERN+='|service[_-]?account\.json'
CMD_PATTERN+='|config[/\\]master\.key'
CMD_PATTERN+='|config[/\\]credentials\.yml\.enc'
CMD_PATTERN+='|(^|[[:space:]])[a-zA-Z0-9._-]+\.secret([[:space:]]|$)'
CMD_PATTERN+='|(^|[[:space:]])\.netrc([[:space:]]|$)'
CMD_PATTERN+='|(^|[[:space:]])\.npmrc([[:space:]]|$)'
CMD_PATTERN+='|(^|[[:space:]])[a-zA-Z0-9._-]+\.tfvars([[:space:]]|$)'
CMD_PATTERN+='|(^|[[:space:]])terraform\.tfstate'
CMD_PATTERN+='|\.kube[/\\]config'
CMD_PATTERN+='|(^|[[:space:]])kubeconfig([[:space:]]|$)'

# ---------------------------------------------------------------------------
# Glob pattern — used for the Grep tool's glob parameter.
# Blocks globs that explicitly target sensitive file extensions or names.
# ---------------------------------------------------------------------------
GLOB_PATTERN='(^|[*?])\.(env|pem|key|p12|pfx|keystore|jks|secret|tfvars)($|[*?])'
GLOB_PATTERN+='|\*\.env[.*]?'
GLOB_PATTERN+='|terraform\.tfstate'

# ---------------------------------------------------------------------------

block_path() {
  local path="$1"
  echo "BLOCKED: Access to '${path}' is not permitted. This file may contain credentials, private keys, or secrets. Do not read sensitive files directly. If specific values are needed, ask the user to provide them." >&2
  exit 2
}

block_cmd() {
  echo "BLOCKED: The command appears to reference a sensitive file. Commands that access credential or secret files are not permitted. If environment values are needed, ask the user to provide them directly." >&2
  exit 2
}

check_path() {
  local path="${1:-}"
  if [[ -z "$path" ]]; then return 0; fi
  path="${path%/}"  # strip trailing slash
  if echo "$path" | grep -qiE "$PATH_PATTERN"; then
    block_path "$path"
  fi
}

# ---------------------------------------------------------------------------

case "$TOOL_NAME" in

  Read)
    FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path // ""')
    check_path "$FILE_PATH"
    ;;

  Bash)
    COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // ""')
    if echo "$COMMAND" | grep -qiE "$CMD_PATTERN"; then
      block_cmd
    fi
    ;;

  Grep)
    GREP_PATH=$(echo "$TOOL_INPUT" | jq -r '.path // ""')
    GREP_GLOB=$(echo "$TOOL_INPUT" | jq -r '.glob // ""')
    check_path "$GREP_PATH"
    if [[ -n "$GREP_GLOB" ]] && echo "$GREP_GLOB" | grep -qiE "$GLOB_PATTERN"; then
      echo "BLOCKED: The glob pattern '${GREP_GLOB}' targets sensitive file types. Searching credential or key files is not permitted." >&2
      exit 2
    fi
    ;;

esac

exit 0
