#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT}" ]]; then
  echo "STOP=not_git_repo"
  exit 1
fi
cd "${ROOT}"

if ! command -v jq >/dev/null 2>&1; then
  echo "STOP=jq_missing"
  exit 1
fi

if [[ "${ALLOW_DIRTY:-0}" != "1" ]] && [[ -n "$(git status --porcelain)" ]]; then
  echo "STOP=working_tree_dirty"
  echo "hint=rerun_with_ALLOW_DIRTY_1_for_readonly_snapshot"
  exit 1
fi

if ! git fetch --all --prune >/dev/null 2>&1; then
  echo "STOP=git_fetch_failed"
  exit 1
fi

echo "READY=branch_scan_started"
echo "repo_root=${ROOT}"

echo
echo "local_working_tree_delta:"
status_lines="$(git status --porcelain)"
if [[ -z "${status_lines}" ]]; then
  echo " - clean_working_tree"
else
  tracked_changed="$(
    printf "%s\n" "${status_lines}" \
      | awk 'substr($0,1,2)!="??" && $0!="" {c++} END{print c+0}'
  )"
  untracked_changed="$(
    printf "%s\n" "${status_lines}" \
      | awk 'substr($0,1,2)=="??" {c++} END{print c+0}'
  )"
  echo " - tracked_changed=${tracked_changed}"
  echo " - untracked=${untracked_changed}"
  echo " - sample_paths:"
  git status --short | head -n 30 | sed 's/^/   /'
fi

head_ahead="$(git rev-list --count origin/main..HEAD)"
head_behind="$(git rev-list --count HEAD..origin/main)"
echo
echo "current_branch_vs_origin_main:"
echo " - branch=$(git rev-parse --abbrev-ref HEAD)"
echo " - ahead=${head_ahead}"
echo " - behind=${head_behind}"
if [[ "${head_ahead}" -gt 0 ]]; then
  echo " - local_commits_not_on_main:"
  git log --oneline origin/main..HEAD | head -n 20 | sed 's/^/   /'
fi

echo
echo "local_branches_ahead_of_origin_main:"
local_tmp="$(mktemp)"
local_count=0
while IFS= read -r branch; do
  ahead="$(git rev-list --count "origin/main..${branch}")"
  behind="$(git rev-list --count "${branch}..origin/main")"
  if [[ "${ahead}" -gt 0 ]]; then
    local_count=$((local_count + 1))
    upstream="$(git rev-parse --abbrev-ref --symbolic-full-name "${branch}@{upstream}" 2>/dev/null || true)"
    if [[ -z "${upstream}" ]]; then
      upstream="none"
    fi
    if git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
      origin_exists="yes"
    else
      origin_exists="no"
    fi
    printf "%08d\t%s | ahead=%s behind=%s upstream=%s origin_exists=%s\n" \
      "${ahead}" "${branch}" "${ahead}" "${behind}" "${upstream}" "${origin_exists}" >> "${local_tmp}"
  fi
done < <(git for-each-ref refs/heads --format='%(refname:short)')

if [[ "${local_count}" -eq 0 ]]; then
  echo " - none"
else
  sort -r "${local_tmp}" | cut -f2- | head -n 40 | sed 's/^/ - /'
  if [[ "${local_count}" -gt 40 ]]; then
    echo " - ... truncated (total=${local_count})"
  fi
fi
rm -f "${local_tmp}"

REMOTE_BRANCHES=()
while IFS= read -r branch; do
  REMOTE_BRANCHES+=("${branch}")
done < <(
  git for-each-ref refs/remotes/origin --format='%(refname:short)' \
    | sed 's#^origin/##' \
    | rg -v '^HEAD$|^main$'
)

ahead_count=0
echo
echo "open_remote_branches_ahead_of_origin_main:"
open_remote_tmp="$(mktemp)"
for branch in "${REMOTE_BRANCHES[@]}"; do
  if [[ "${branch}" == "origin" ]]; then
    continue
  fi

  if ! git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
    continue
  fi

  ahead="$(git rev-list --count "origin/main..origin/${branch}")"
  behind="$(git rev-list --count "origin/${branch}..origin/main")"

  if [[ "${ahead}" -gt 0 ]]; then
    cherry_output="$(git cherry origin/main "origin/${branch}" || true)"
    unique_plus="$(printf "%s\n" "${cherry_output}" | awk '/^\+/{c++} END{print c+0}')"
    patch_equiv_minus="$(printf "%s\n" "${cherry_output}" | awk '/^-/{c++} END{print c+0}')"

    ahead_count=$((ahead_count + 1))
    printf "%08d\t%s | ahead=%s behind=%s unique_plus=%s patch_equiv_minus=%s\n" \
      "${unique_plus}" "${branch}" "${ahead}" "${behind}" "${unique_plus}" "${patch_equiv_minus}" >> "${open_remote_tmp}"
  fi
done

if [[ "${ahead_count}" -eq 0 ]]; then
  echo " - none"
else
  sort -r "${open_remote_tmp}" | cut -f2- | sed 's/^/ - /'
fi
rm -f "${open_remote_tmp}"

echo
echo "open_remote_unique_plus_preview:"
preview_count=0
for branch in "${REMOTE_BRANCHES[@]}"; do
  if [[ "${branch}" == "origin" ]]; then
    continue
  fi
  if ! git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
    continue
  fi
  ahead="$(git rev-list --count "origin/main..origin/${branch}")"
  if [[ "${ahead}" -eq 0 ]]; then
    continue
  fi
  cherry_preview="$(git cherry -v origin/main "origin/${branch}" | awk '/^\+/{print $0}' | head -n 3)"
  unique_plus="$(printf "%s\n" "${cherry_preview}" | awk 'NF{c++} END{print c+0}')"
  if [[ "${unique_plus}" -eq 0 ]]; then
    continue
  fi
  preview_count=$((preview_count + 1))
  echo " - ${branch}:"
  printf "%s\n" "${cherry_preview}" | sed 's/^/   /'
done
if [[ "${preview_count}" -eq 0 ]]; then
  echo " - none"
fi

echo
echo "recommended_reconcile_order:"
order_index=1
for branch in \
  "feat/isa2-0001-advisory-backend-final" \
  "feat/openclaw-wave1-runtime-hardening" \
  "claude/document-news-hub-architecture-3XI12"
do
  if git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
    ahead="$(git rev-list --count "origin/main..origin/${branch}")"
    behind="$(git rev-list --count "origin/${branch}..origin/main")"
    if [[ "${ahead}" -gt 0 ]]; then
      printf " %d) %s | ahead=%s behind=%s\n" "${order_index}" "${branch}" "${ahead}" "${behind}"
      order_index=$((order_index + 1))
    fi
  fi
done
if [[ "${order_index}" -eq 1 ]]; then
  echo " - no_known_reconcile_branches_found"
fi

echo
echo "worktree_health:"
worktree_prunable_count="$(git worktree list --porcelain | rg -c '^prunable ' || true)"
echo " - prunable_worktrees=${worktree_prunable_count}"
if [[ "${worktree_prunable_count}" -gt 0 ]]; then
  git worktree list --porcelain | rg '^worktree |^prunable ' | sed 's/^/   /' | head -n 20
fi

echo
echo "stash_state:"
stash_count="$(git stash list | wc -l | tr -d ' ')"
echo " - stash_entries=${stash_count}"
if [[ "${stash_count}" -gt 0 ]]; then
  git stash list | head -n 10 | sed 's/^/   /'
fi

echo
echo "canonical_next_actions_summary:"
jq -r '
  [ .items[]
    | select(.id | test("^(ISA2|PR2)-"))
    | { id, status, priority, capability }
  ] as $x
  | "total=\($x | length)"
  , "ready=\($x | map(select(.status == "READY")) | length)"
  , "in_progress=\($x | map(select(.status == "IN_PROGRESS")) | length)"
  , "done=\($x | map(select(.status == "DONE")) | length)"
  , "parked=\($x | map(select(.status == "PARKED")) | length)"
' docs/planning/NEXT_ACTIONS.json

echo
echo "top_unresolved_isa2_items:"
jq -r '
  .items[]
  | select(.id | test("^ISA2-"))
  | select(.status != "DONE")
  | "\(.id)\t\(.priority)\t\(.status)\t\(.capability)\t\(.title)"
' docs/planning/NEXT_ACTIONS.json | head -n 12

if [[ "${ahead_count}" -gt 0 ]]; then
  echo
  echo "DONE=reconcile_snapshot_open_branches"
else
  echo
  echo "DONE=reconcile_snapshot_clean"
fi
