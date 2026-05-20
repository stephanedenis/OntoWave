#!/usr/bin/env bash
set -euo pipefail
printf "\n== Copilotage quick-check ==\n"
if git diff --name-only HEAD~1..HEAD | grep -qE '\.(ts|tsx|js|md)$'; then
  echo "- Files updated: OK"
fi
if git log -1 --pretty=%s | grep -qiE '^(feat|fix|docs|chore|refactor|test|perf|build|ci)(\(.+\))?:'; then
  echo "- Conventional commit: OK"
else
  echo "- Conventional commit: MISSING (use feat|fix|docs|…)" >&2
  exit 1
fi
exit 0
