#!/usr/bin/env bash
# Secrets gate: blocks git commits that would introduce secret-looking content.
# Runs as a PreToolUse hook on every Bash call. Exit code 2 blocks the tool
# call and feeds the reason back to Claude.
#
# The tool call is inspected BEFORE it runs, so we cannot trust the staging
# area alone: a `git add X && git commit` one-liner leaves staging empty at
# check time, and `git commit -a` / `git commit <path>` stage content only at
# commit time. Instead we scan everything that could land in the commit:
#   1. added lines across all tracked changes vs HEAD (staged, unstaged, -a)
#   2. full contents of untracked, non-ignored files (add-and-commit of a new file)
# .env and friends are gitignored, so --exclude-standard skips them.

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

# Trigger on any git command that can produce a commit, regardless of phrasing:
# "git commit", "git -C dir commit", "git add x && git commit", etc.
case "$COMMAND" in
  *git*commit*) ;;
  *) exit 0 ;;
esac

CANDIDATE="$(git diff HEAD --unified=0 2>/dev/null | grep '^+' | grep -v '^+++' || true)"
while IFS= read -r f; do
  [ -n "$f" ] && [ -f "$f" ] && CANDIDATE="$CANDIDATE
$(cat "$f" 2>/dev/null || true)"
done < <(git ls-files --others --exclude-standard 2>/dev/null)

PATTERNS=(
  'AKIA[0-9A-Z]{16}'
  '-----BEGIN[ A-Z]*PRIVATE KEY-----'
  '(api[_-]?key|secret|token|password)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9_/+=-]{12,}'
)

for pattern in "${PATTERNS[@]}"; do
  MATCH="$(printf '%s' "$CANDIDATE" | grep -E -o -- "$pattern" | head -1 || true)"
  if [ -n "$MATCH" ]; then
    echo "secrets gate: blocked commit, a file about to be committed contains a secret-looking value (pattern: $pattern, match starts with: ${MATCH:0:12}...). Move it to .env (gitignored) and read it from the environment instead." >&2
    exit 2
  fi
done

exit 0
