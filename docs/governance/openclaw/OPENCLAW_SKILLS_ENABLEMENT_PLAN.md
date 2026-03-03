# OpenClaw Skills Enablement Plan

Status: CANONICAL

## Objective
Enable the highest-value OpenClaw skills that can be made operational without adding new secrets or weakening current governance controls.

## Selected core skills
- `clawhub`
- `github`
- `gh-issues`
- `mcporter`
- `session-logs`
- `skill-creator`
- `tmux`
- `weather`

## Installed dependencies on VM
- `gh` via `apt-get`
- `ripgrep` via `apt-get`
- `clawhub@0.7.0` via `npm -g`
- `mcporter@0.7.3` via `npm -g`
- `@google/gemini-cli@0.31.0` via `npm -g`

## Functional status
- Verified functional:
  - `clawhub`
  - `github`
  - `gh-issues`
  - `mcporter`
  - `session-logs`
  - `skill-creator`
  - `tmux`
  - `weather`
- Installed but not automation-verified:
  - `gemini`
    - installed successfully
    - excluded from autonomous routing because runtime auth is not configured

## Automation layer
- Canonical policy: `config/openclaw/skill-routing.policy.json`
- Canonical helper: `scripts/openclaw-skill-route.sh`
- Launcher integration writes:
  - `.openclaw/launcher/last_skill_route.json`
  - `.openclaw/launcher/last_skill_route.md`
  - `.openclaw/launcher/last_openclaw_session_brief.md`

## Constraint
This repo now supports deterministic pre-session skill routing and launcher-driven autonomous skill prompting. It does not claim native OpenClaw prompt-semantic auto-routing inside the gateway runtime unless OpenClaw itself adds that capability.
