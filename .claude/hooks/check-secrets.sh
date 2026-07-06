#!/usr/bin/env bash
# Secrets gate: blocks git commits that stage secret-looking content.
# Runs as a PreToolUse hook on every Bash call; exits fast unless the
# command is a git commit. Exit code 2 blocks the tool call and feeds
# the reason back to Claude.

set -u

INPUT="$(cat)"

COMMAND="$(printf '%s' "$INPUT" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("tool_input", {}).get("command", ""))
except Exception:
    print("")
')"

case "$COMMAND" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

STAGED="$(git diff --cached --unified=0 2>/dev/null | grep '^+' | grep -v '^+++' || true)"

PATTERNS=(
  'AKIA[0-9A-Z]{16}'
  '-----BEGIN[ A-Z]*PRIVATE KEY-----'
  '(api[_-]?key|secret|token|password)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9_/+=-]{12,}'
)

for pattern in "${PATTERNS[@]}"; do
  MATCH="$(printf '%s' "$STAGED" | grep -E -o -- "$pattern" | head -1 || true)"
  if [ -n "$MATCH" ]; then
    echo "secrets gate: blocked commit, staged changes contain a secret-looking value (pattern: $pattern, match starts with: ${MATCH:0:12}...). Move it to .env (gitignored) and read it from the environment instead." >&2
    exit 2
  fi
done

exit 0
