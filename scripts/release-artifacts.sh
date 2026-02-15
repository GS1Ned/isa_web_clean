#!/usr/bin/env bash
set -euo pipefail

dry_run=false
release_kind=""
artifact_scope=""

usage() {
  cat <<'USAGE' >&2
Usage:
  bash scripts/release-artifacts.sh --release-kind <patch|minor|major> --artifact-scope <datasets|schemas|docs|all> [--dry-run]

Notes:
  - This script never commits. It tags the current HEAD and creates a GitHub Release.
  - For dataset releases, ensure data/metadata/dataset_registry.json.registryVersion already matches the computed next version.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=true
      ;;
    --release-kind)
      shift
      release_kind="${1:-}"
      ;;
    --artifact-scope)
      shift
      artifact_scope="${1:-}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf "Unknown argument: %s\n" "$1" >&2
      usage
      exit 2
      ;;
  esac
  shift
done

if [[ -z "$release_kind" || -z "$artifact_scope" ]]; then
  printf "STOP=missing_required_args\n" >&2
  usage
  exit 2
fi

case "$release_kind" in
  patch|minor|major) ;;
  *)
    printf "STOP=invalid_release_kind:%s\n" "$release_kind" >&2
    exit 2
    ;;
esac

case "$artifact_scope" in
  datasets|schemas|docs|all) ;;
  *)
    printf "STOP=invalid_artifact_scope:%s\n" "$artifact_scope" >&2
    exit 2
    ;;
esac

cd "$(git rev-parse --show-toplevel)"

if [[ -n "$(git status --porcelain)" ]]; then
  printf "STOP=dirty_worktree\n" >&2
  git status --porcelain >&2 || true
  exit 1
fi

printf "READY=clean_worktree\n"

last_tag="$(git tag --list 'isa-artifacts-v*' --sort=-v:refname | head -n 1 || true)"

base_version=""
if [[ -n "$last_tag" ]]; then
  base_version="${last_tag#isa-artifacts-v}"
else
  if [[ -f data/metadata/dataset_registry.json ]]; then
    base_version="$(node -e "import fs from 'node:fs'; const j = JSON.parse(fs.readFileSync('data/metadata/dataset_registry.json','utf8')); process.stdout.write(String(j.registryVersion || '0.0.0'));")"
  else
    base_version="0.0.0"
  fi
fi

if [[ ! "$base_version" =~ ^([0-9]+)\\.([0-9]+)\\.([0-9]+)$ ]]; then
  printf "STOP=invalid_base_version:%s\n" "$base_version" >&2
  exit 1
fi

major="${BASH_REMATCH[1]}"
minor="${BASH_REMATCH[2]}"
patch="${BASH_REMATCH[3]}"

case "$release_kind" in
  patch)
    patch="$((patch + 1))"
    ;;
  minor)
    minor="$((minor + 1))"
    patch="0"
    ;;
  major)
    major="$((major + 1))"
    minor="0"
    patch="0"
    ;;
esac

next_version="${major}.${minor}.${patch}"
tag="isa-artifacts-v${next_version}"

needs_datasets=false
if [[ "$artifact_scope" == "datasets" || "$artifact_scope" == "all" ]]; then
  needs_datasets=true
fi

registry_version=""
if [[ "$needs_datasets" == "true" ]]; then
  if [[ ! -f data/metadata/dataset_registry.json ]]; then
    printf "STOP=missing_dataset_registry\n" >&2
    exit 1
  fi

  registry_version="$(node -e "import fs from 'node:fs'; const j = JSON.parse(fs.readFileSync('data/metadata/dataset_registry.json','utf8')); process.stdout.write(String(j.registryVersion || ''));")"
  if [[ -z "$registry_version" ]]; then
    printf "STOP=dataset_registry_missing_registryVersion\n" >&2
    exit 1
  fi

  if [[ "$registry_version" != "$next_version" ]]; then
    printf "STOP=dataset_registry_version_mismatch expected=%s got=%s\n" "$next_version" "$registry_version" >&2
    printf "Hint: bump data/metadata/dataset_registry.json.registryVersion in a PR before releasing datasets.\n" >&2
    exit 1
  fi
fi

if git rev-parse -q --verify "refs/tags/${tag}" >/dev/null; then
  printf "STOP=tag_already_exists:%s\n" "$tag" >&2
  exit 1
fi

printf "READY=version:%s\n" "$next_version"

tmp_notes="$(mktemp -t isa-artifacts-notes.XXXXXX)"
trap 'rm -f "$tmp_notes"' EXIT

range="HEAD"
if [[ -n "$last_tag" ]]; then
  range="${last_tag}..HEAD"
fi

{
  printf "# ISA artifacts %s\n\n" "$next_version"
  printf "Scope: %s\n" "$artifact_scope"
  printf "Kind: %s\n" "$release_kind"
  printf "Base tag: %s\n\n" "${last_tag:-NONE}"

  if [[ "$needs_datasets" == "true" ]]; then
    printf "Dataset registry version: %s\n\n" "$registry_version"
  fi

  printf "## Commits\n"

  case "$artifact_scope" in
    datasets)
      git log --oneline "$range" -- data/metadata data 2>/dev/null || true
      ;;
    schemas)
      git log --oneline "$range" -- docs/quality/schemas test-results/ci docs/evidence/_generated docs/architecture/panel/_generated 2>/dev/null || true
      ;;
    docs)
      git log --oneline "$range" -- docs 2>/dev/null || true
      ;;
    all)
      git log --oneline "$range" 2>/dev/null || true
      ;;
  esac | sed 's/^/- /'
} > "$tmp_notes"

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  cat "$tmp_notes" >> "$GITHUB_STEP_SUMMARY"
fi

if [[ "$dry_run" == "true" ]]; then
  printf "DONE=dry_run:%s\n" "$tag"
  exit 0
fi

git tag -a "$tag" -m "ISA artifacts ${next_version} (${artifact_scope}, ${release_kind})"
git push origin "$tag"

if ! command -v gh >/dev/null 2>&1; then
  printf "STOP=gh_cli_missing\n" >&2
  exit 1
fi

gh release create "$tag" --title "ISA artifacts ${next_version}" --notes-file "$tmp_notes"

printf "DONE=released:%s\n" "$tag"

