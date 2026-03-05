#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT}" ]]; then
  echo "STOP=not_git_repo"
  exit 1
fi
cd "${ROOT}"

if [[ "${ALLOW_DIRTY:-0}" != "1" ]] && [[ -n "$(git status --porcelain)" ]]; then
  echo "STOP=working_tree_dirty"
  echo "hint=rerun_with_ALLOW_DIRTY_1_for_readonly_probe"
  exit 1
fi

if ! git fetch --all --prune >/dev/null 2>&1; then
  echo "STOP=git_fetch_failed"
  exit 1
fi

if [[ "$#" -gt 0 ]]; then
  TARGET_BRANCHES=()
  for arg in "$@"; do
    TARGET_BRANCHES+=("${arg}")
  done
else
  TARGET_BRANCHES=(
    "origin/feat/openclaw-wave1-runtime-hardening"
    "origin/claude/document-news-hub-architecture-3XI12"
  )
fi

TMP_WT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/isa_merge_probe.XXXXXX")"
cleanup() {
  git worktree remove --force "${TMP_WT_DIR}" >/dev/null 2>&1 || true
  rmdir "${TMP_WT_DIR}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

if ! git worktree add --detach "${TMP_WT_DIR}" origin/main >/dev/null 2>&1; then
  echo "STOP=worktree_add_failed"
  exit 1
fi

echo "READY=merge_probe_started"
echo "repo_root=${ROOT}"
echo "probe_worktree=${TMP_WT_DIR}"

for branch in "${TARGET_BRANCHES[@]}"; do
  if ! git rev-parse --verify "${branch}" >/dev/null 2>&1; then
    echo "BRANCH=${branch}"
    echo "RESULT=missing"
    continue
  fi

  git -C "${TMP_WT_DIR}" reset --hard origin/main >/dev/null 2>&1
  git -C "${TMP_WT_DIR}" clean -fd >/dev/null 2>&1

  set +e
  git -C "${TMP_WT_DIR}" merge --no-commit --no-ff "${branch}" >/dev/null 2>&1
  merge_exit=$?
  set -e

  status="$(git -C "${TMP_WT_DIR}" status --porcelain)"
  conflict_count="$(printf "%s\n" "${status}" | awk '/^(UU|AA|DD|AU|UA|DU|UD) /{c++} END{print c+0}')"
  staged_count="$(
    printf "%s\n" "${status}" \
      | awk '{
          x=substr($0,1,1);
          if (x != " " && x != "?" && x != "") c++
        } END{print c+0}'
  )"
  unstaged_count="$(
    printf "%s\n" "${status}" \
      | awk '{
          y=substr($0,2,1);
          if (y != " " && y != "") c++
        } END{print c+0}'
  )"

  result="clean_no_delta"
  if [[ "${conflict_count}" -gt 0 ]]; then
    result="conflicts"
  elif [[ -n "${status}" ]]; then
    result="clean_with_delta"
  fi

  echo "BRANCH=${branch}"
  echo "RESULT=${result}"
  echo "MERGE_EXIT=${merge_exit}"
  echo "CONFLICT_COUNT=${conflict_count}"
  echo "STAGED_COUNT=${staged_count}"
  echo "UNSTAGED_COUNT=${unstaged_count}"

  if [[ "${result}" == "conflicts" ]]; then
    echo "CONFLICT_SAMPLE_START"
    printf "%s\n" "${status}" | awk '/^(UU|AA|DD|AU|UA|DU|UD) /{print $2}' | head -n 12
    echo "CONFLICT_SAMPLE_END"
  fi

  git -C "${TMP_WT_DIR}" merge --abort >/dev/null 2>&1 || true
done

echo "DONE=merge_probe_complete"
