#!/usr/bin/env bash
set -euo pipefail

# Cleans local OS/editor noise files that are forbidden in tracked history.
# Safe-by-default behavior:
# - Preview only unless APPLY=1 is set
# - Never touches .git, node_modules, dist, or test-results

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

CANDIDATES=()
while IFS= read -r line; do
  [[ -n "$line" ]] && CANDIDATES+=("$line")
done < <(
  find . \
    -path "./.git" -prune -o \
    -path "./node_modules" -prune -o \
    -path "./dist" -prune -o \
    -path "./test-results" -prune -o \
    \( -path "*/__MACOSX/*" -o -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.swp" -o -name "*~" \) \
    -print 2>/dev/null \
    | sed 's#^\./##' \
    | sort -u
)

COUNT="${#CANDIDATES[@]}"
echo "READY=forbidden_local_candidates count=${COUNT}"

if [[ "$COUNT" -eq 0 ]]; then
  echo "DONE=no_forbidden_local_files"
  exit 0
fi

printf '%s\n' "${CANDIDATES[@]}" | head -n 60
if [[ "$COUNT" -gt 60 ]]; then
  echo "... and $((COUNT - 60)) more"
fi

if [[ "${APPLY:-0}" != "1" ]]; then
  echo "STOP=preview_only set APPLY=1 to remove listed files"
  exit 0
fi

for path in "${CANDIDATES[@]}"; do
  rm -f -- "$path"
done

echo "DONE=forbidden_local_files_removed count=${COUNT}"
