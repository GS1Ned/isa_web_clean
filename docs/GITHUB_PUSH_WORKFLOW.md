# GitHub Push Workflow

This document describes how the ISA project manages GitHub repository synchronization.

## Repository Configuration

**Primary Repository:** https://github.com/GS1-ISA/isa_web.git

The repository is configured with a Personal Access Token (PAT) for automated pushes. The PAT is stored securely in the deployment environment and is never committed to the repository.

## Push Strategy

### Regular Pushes
- Pushed at appropriate milestones: feature completion, bug fixes, documentation updates
- Non-destructive pushes (no force flag) when history is clean
- Automatic push on checkpoint creation

### Force Pushes
- Used when necessary to resolve conflicts or rebase history
- **Requires explicit confirmation before execution**
- Used as last resort when normal push fails
- Never used to discard important commits

## Push Workflow

```
1. Feature development → Commit locally
2. Tests pass → Create checkpoint (via webdev_save_checkpoint)
3. Checkpoint created → Push to GitHub (user_github remote)
4. If conflict detected → Ask user for confirmation before force push
5. Force push executes → GitHub updated with latest code
```

## Security

- **PAT Token:** Stored in environment variables, never in repository
- **Token Scope:** `repo` (full control of private repositories)
- **Token Rotation:** Recommended every 90 days
- **Token Revocation:** Available at https://github.com/settings/tokens

## Remote Configuration

The project uses the `user_github` remote for authenticated pushes:

```bash
user_github = https://x-access-token:[PAT_TOKEN]@github.com/GS1-ISA/isa_web.git
```

This remote is configured during project initialization and persists across sessions.

## Troubleshooting

### Push Fails with "invalid credentials"
- Verify PAT token is set in environment
- Check token has `repo` scope
- Verify token has not expired

### Push Fails with "Everything up-to-date"
- Local and remote are synchronized
- No new commits to push
- This is normal and not an error

### Push Fails with Merge Conflict
- Automatic force push will be attempted
- User confirmation required before force push
- If force push fails, manual intervention needed

## Manual Push

To manually push to GitHub:

```bash
cd /home/ubuntu/isa_web

# Push without force
git push user_github main

# Force push (use with caution)
git push -f user_github main
```

## Verification

After each push, verify the repository is updated:

```bash
# Check GitHub repository
git ls-remote user_github main

# Compare local vs remote
git log --oneline -5 user_github/main
```
