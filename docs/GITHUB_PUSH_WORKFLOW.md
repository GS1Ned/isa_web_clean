# GitHub Push Workflow

This document describes how the ISA project manages GitHub repository synchronization.

## Repository Configuration

**Primary Repository:** https://github.com/GS1Ned/isa_web_clean

Use the default `origin` remote for pushes. Avoid embedding tokens in git remotes; prefer SSH or GitHub CLI auth (`gh auth login`).

## Push Strategy

### Regular Pushes
- Push feature branches (not `main`) at reviewable milestones: feature completion, bug fixes, documentation updates
- Open PRs targeting `main`
- Prefer fast, incremental commits over large history rewrites

### Force Pushes
- Avoid force pushes by default
- If history rewrite is required, force push only to your own feature branch (never to `main`)

## Push Workflow

```
1. Create branch from `origin/main`
2. Implement change → commit locally
3. Run local validation (see docs/governance/MANUAL_PREFLIGHT.md)
4. Push branch to `origin`
5. Open PR → merge to `main`
```

## Security

- Do not commit secrets to the repository.
- Prefer short-lived auth via SSH or GitHub CLI.

## Remote Configuration

Expected remote for pushes is `origin`:

```bash
origin = https://github.com/GS1Ned/isa_web_clean.git
```

Verify with `git remote -v`.

## Troubleshooting

### Push Fails with "invalid credentials"
- Re-authenticate with `gh auth login` or ensure your SSH key is loaded
- Verify you have push permission to the repository

### Push Fails with "Everything up-to-date"
- Local and remote are synchronized
- No new commits to push
- This is normal and not an error

### Push Fails with Merge Conflict
- Resolve conflicts locally and push updated commits to your feature branch
- Avoid force pushing unless you are intentionally rewriting your own branch history

## Manual Push

To manually push to GitHub:

```bash
git fetch origin --prune

# Create a feature branch from current main
git checkout -b feature/my-change origin/main

# Push branch
git push -u origin feature/my-change

# Open PR (optional)
gh pr create
```

## Verification

After each push, verify the repository is updated:

```bash
# Check remote main tip
git ls-remote origin main

# Compare local vs origin/main
git log --oneline -5 origin/main
```
