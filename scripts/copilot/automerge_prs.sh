#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${REPO_ROOT}" ]]; then
  echo "STOP: not inside a git repository"
  exit 1
fi

cd "${REPO_ROOT}"
LOG_DIR="./docs/planning/merge"
LOG_FILE="${LOG_DIR}/PR_MERGE_AUTOPILOT_LOG.md"

need_cmd () {
  command -v "$1" >/dev/null 2>&1 || { echo "STOP: missing command '$1'"; exit 1; }
}

need_cmd git
need_cmd gh

# Verify GitHub auth
if ! gh auth status >/dev/null 2>&1; then
  echo "STOP: gh not authenticated (run: gh auth login) — no secrets requested"
  exit 1
fi

# Determine default branch from remote; fallback to strict-no-console
DEFAULT_BRANCH="$(git remote show origin 2>/dev/null | sed -n 's/.*HEAD branch: //p' | tr -d ' ')"
if [[ -z "${DEFAULT_BRANCH}" ]]; then
  DEFAULT_BRANCH="strict-no-console"
fi

echo "Using default branch: ${DEFAULT_BRANCH}"

# Ensure clean working tree
if [[ -n "$(git status --porcelain)" ]]; then
  echo "STOP: working tree not clean; commit or stash changes"
  exit 1
fi

# Fetch latest
git fetch origin --prune

# Create log directory and initialize the log AFTER ensuring the working tree is clean
mkdir -p "${LOG_DIR}"
echo "# PR Merge Autopilot Log" > "${LOG_FILE}"
echo "" >> "${LOG_FILE}"
echo "- started_at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "${LOG_FILE}"
echo "- repo: $(git remote get-url origin 2>/dev/null || echo unknown)" >> "${LOG_FILE}"
echo "" >> "${LOG_FILE}"

# Get open PRs (number, title, headRefName)
PRS_JSON="$(gh pr list --state open --json number,title,headRefName)"
if [[ -z "${PRS_JSON}" || "${PRS_JSON}" == "[]" ]]; then
  echo "DONE: no open PRs found"
  echo "" >> "${LOG_FILE}"
  echo "- completed_at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "${LOG_FILE}"
  exit 0
fi

# Use node if available for JSON parsing; else fallback to gh template
parse_with_node="false"
if command -v node >/dev/null 2>&1; then
  parse_with_node="true"
fi

PR_TMP=""
PR_LINES=()
PR_TMP="$(mktemp)"
if [[ "${parse_with_node}" == "true" ]]; then
  node -e 'const prs=JSON.parse(process.argv[1]); for (const p of prs) console.log(`${p.number}\t${p.headRefName}\t${p.title}`);' "${PRS_JSON}" > "${PR_TMP}"
else
  # Fallback: use gh formatting
  gh pr list --state open --json number,title,headRefName --template '{{range .}}{{.number}}{{"\t"}}{{.headRefName}}{{"\t"}}{{.title}}{{"\n"}}{{end}}' > "${PR_TMP}"
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  PR_LINES+=("$line")
done < "${PR_TMP}"
rm -f "${PR_TMP}"

echo "" >> "${LOG_FILE}"
echo "## PRs discovered" >> "${LOG_FILE}"
for line in "${PR_LINES[@]}"; do
  pr_number="$(echo "$line" | cut -f1)"
  pr_branch="$(echo "$line" | cut -f2)"
  pr_title="$(echo "$line" | cut -f3-)"
  echo "- #${pr_number} \`${pr_branch}\` — ${pr_title}" >> "${LOG_FILE}"
done
echo "" >> "${LOG_FILE}"

# Make sure local default branch exists and is up-to-date
git checkout "${DEFAULT_BRANCH}" >/dev/null 2>&1 || git checkout -b "${DEFAULT_BRANCH}" "origin/${DEFAULT_BRANCH}"
git pull --ff-only origin "${DEFAULT_BRANCH}"

# Process PRs in listed order
for line in "${PR_LINES[@]}"; do
  pr_number="$(echo "$line" | cut -f1)"
  pr_branch="$(echo "$line" | cut -f2)"
  pr_title="$(echo "$line" | cut -f3-)"

  echo "----"
  echo "Processing PR #${pr_number}: ${pr_branch}"

  echo "" >> "${LOG_FILE}"
  echo "## PR #${pr_number}: ${pr_title}" >> "${LOG_FILE}"
  echo "- branch: \`${pr_branch}\`" >> "${LOG_FILE}"
  echo "- started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "${LOG_FILE}"

  # Fetch branch
  git fetch origin "${pr_branch}:${pr_branch}" || git fetch origin "refs/heads/${pr_branch}:refs/heads/${pr_branch}"

  # Checkout PR branch
  git checkout "${pr_branch}"

  # Rebase onto default branch
  set +e
  git rebase "origin/${DEFAULT_BRANCH}"
  rb_status=$?
  set -e

  if [[ $rb_status -ne 0 ]]; then
    echo "STOP: rebase conflict on PR #${pr_number} (${pr_branch}). Resolve conflicts, run tests, then rerun script."
    echo "- status: STOP_REBASE_CONFLICT" >> "${LOG_FILE}"
    echo "- stopped: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "${LOG_FILE}"
    exit 1
  fi

  # Install deps + run core checks if present
  if [[ -f "pnpm-lock.yaml" ]] && command -v pnpm >/dev/null 2>&1; then
    pnpm -s install
    if pnpm -s run | grep -qE '^lint'; then pnpm -s lint; fi
    if pnpm -s run | grep -qE '^test'; then pnpm -s test; fi
    if pnpm -s run | grep -qE '^build'; then pnpm -s build; fi
  fi

  # Push rebased branch
  git push --force-with-lease origin "${pr_branch}"

  # Enable auto-merge (merge commit) if possible
  # If checks are required, --auto will merge when they pass.
  set +e
  gh pr merge "${pr_number}" --merge --auto
  merge_status=$?
  set -e

  if [[ $merge_status -ne 0 ]]; then
    echo "STOP: could not enable auto-merge for PR #${pr_number}. Investigate in PR UI, fix blockers, rerun."
    echo "- status: STOP_MERGE_BLOCKED" >> "${LOG_FILE}"
    echo "- stopped: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "${LOG_FILE}"
    exit 1
  fi

  echo "- status: AUTO_MERGE_ENABLED" >> "${LOG_FILE}"
  echo "- finished: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "${LOG_FILE}"

  # Return to default branch for next iteration
  git checkout "${DEFAULT_BRANCH}"
done

echo "" >> "${LOG_FILE}"
echo "- completed_at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "${LOG_FILE}"
echo "DONE: processed all open PRs (auto-merge enabled)."
