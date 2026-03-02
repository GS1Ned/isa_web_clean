# OpenClaw Configuration Audit

- Generated at: `2026-03-02T08:16:29Z`
- Repo root: `/Users/frisowempehomefolder/Documents/Documents - Friso’s MacBook Air/isa_web_clean`
- Audit dir: `/Users/frisowempehomefolder/Documents/Documents - Friso’s MacBook Air/isa_web_clean/.openclaw/audit/20260302T081629Z`
- Snapshot: `/Users/frisowempehomefolder/Documents/Documents - Friso’s MacBook Air/isa_web_clean/.openclaw/audit/20260302T081629Z/OPENCLAW_CONFIGURATION_SNAPSHOT.redacted.json`
- Field inventory: `/Users/frisowempehomefolder/Documents/Documents - Friso’s MacBook Air/isa_web_clean/.openclaw/audit/20260302T081629Z/OPENCLAW_CONFIGURATION_FIELD_INVENTORY.redacted.json`

## FACT

- Active runtime target is the VM-backed OpenClaw gateway.
- Runtime default model: `moonshotai/kimi-k2.5`
- Gateway listen address: `127.0.0.1:18789`
- Skills ready: `10` / `51`
- Plugins loaded: `4` / `37`
- Hooks ready: `4` / `4`
- Security audit summary: `0 critical · 1 warn · 1 info`

## INTERPRETATION

- The effective runtime config is anchored in `/root/.openclaw/openclaw.json` on the VM.
- The repository-level `.openclaw/control-plane.json` and `config/openclaw/*.json` files add governance and routing policy, but they do not replace the VM runtime file.
- Host-local config is minimal; the host currently contributes an OpenRouter environment export and desktop/launcher behavior rather than the primary runtime state.

## RECOMMENDATION

- Use the redacted snapshot JSON when you want the full nested configuration view.
- Use the field inventory JSON when you want every field path independently searchable.
- Review the CLI appendices when you need actual activation state beyond static files.

## Source Inventory

- `host:~/.openclaw/env.sh`: `1` fields
- `repo:.openclaw/control-plane.json`: `141` fields
- `repo:.openclaw/launcher/last_model_route.json`: `15` fields
- `repo:config/governance/openclaw_policy_envelope.json`: `22` fields
- `repo:config/openclaw/browser.policy.json`: `8` fields
- `repo:config/openclaw/exec-lane.policy.json`: `25` fields
- `repo:config/openclaw/model-routing.policy.json`: `188` fields
- `repo:config/openclaw/skills-allowlist.json`: `275` fields
- `vm:/root/.openclaw/.env`: `2` fields
- `vm:/root/.openclaw/agents/main/agent/auth-profiles.json`: `1` fields
- `vm:/root/.openclaw/cron/jobs.json`: `2` fields
- `vm:/root/.openclaw/devices/paired.json`: `116` fields
- `vm:/root/.openclaw/devices/pending.json`: `0` fields
- `vm:/root/.openclaw/exec-approvals.json`: `3` fields
- `vm:/root/.openclaw/identity/device.json`: `5` fields
- `vm:/root/.openclaw/openclaw.json`: `35` fields

## CLI Appendices

### `bash scripts/openclaw-status.sh --deep --target vm`

```text
PREFLIGHT=openclaw_status
READY=openclaw_status_delegate_vm host=isa-openclaw-vm
PREFLIGHT=vm_run
READY=vm_run host=isa-openclaw-vm script=openclaw-status.sh
READY=vm_run_stream_local_script script=openclaw-status.sh
READY=isa_vm_ssh_exec host=isa-openclaw-vm
DONE=isa_vm_ssh_exec_complete
READY=isa_vm_ssh_exec host=isa-openclaw-vm
PREFLIGHT=openclaw_status
Service: systemd (enabled)
File logs: /tmp/openclaw/openclaw-2026-03-02.log
Command: /usr/bin/node /usr/lib/node_modules/openclaw/dist/index.js gateway --port 18789
Service file: ~/.config/systemd/user/openclaw-gateway.service
Service env: OPENCLAW_STATE_DIR=/root/.openclaw OPENCLAW_CONFIG_PATH=/root/.openclaw/openclaw.json OPENCLAW_GATEWAY_PORT=18789

Config (cli): ~/.openclaw/openclaw.json
Config (service): ~/.openclaw/openclaw.json

Gateway: bind=loopback (127.0.0.1), port=18789 (service args)
Probe target: ws://127.0.0.1:18789
Dashboard: http://127.0.0.1:18789/
Probe note: Loopback-only gateway; only local clients can connect.

Runtime: running (pid 307971, state active, sub running, last exit 0, reason 0)
RPC probe: ok

Listening: 127.0.0.1:18789
Troubles: run openclaw status
Troubleshooting: https://docs.openclaw.ai/troubleshooting
OpenClaw status

Overview
┌─────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Item            │ Value                                                                                             │
├─────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Dashboard       │ http://127.0.0.1:18789/                                                                           │
│ OS              │ linux 6.8.0-90-generic (x64) · node 22.22.0                                                       │
│ Tailscale       │ off                                                                                               │
│ Channel         │ stable (default)                                                                                  │
│ Update          │ available · pnpm · npm update 2026.3.1                                                            │
│ Gateway         │ local · ws://127.0.0.1:18789 (local loopback) · reachable 17ms · auth token · isa-openclaw-vm     │
│                 │ (89.167.104.170) app 2026.2.25 linux 6.8.0-90-generic                                             │
│ Gateway service │ systemd installed · enabled · running (pid 307971, state active)                                  │
│ Node service    │ systemd not installed                                                                             │
│ Agents          │ 1 · 1 bootstrap file present · sessions 1 · default main active 5m ago                            │
│ Memory          │ 0 files · 0 chunks · sources memory · plugin memory-core · vector unknown · fts ready · cache on  │
│                 │ (0)                                                                                               │
│ Probes          │ enabled                                                                                           │
│ Events          │ none                                                                                              │
│ Heartbeat       │ 30m (main)                                                                                        │
│ Last heartbeat  │ none                                                                                              │
│ Sessions        │ 1 active · default moonshotai/kimi-k2.5 (200k ctx) · ~/.openclaw/agents/main/sessions/sessions.   │
│                 │ json                                                                                              │
└─────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────┘

Security audit
Summary: 0 critical · 1 warn · 1 info
  WARN Reverse proxy headers are not trusted
    gateway.bind is loopback and gateway.trustedProxies is empty. If you expose the Control UI through a reverse proxy, configure trusted proxies so local-client c…
    Fix: Set gateway.trustedProxies to your proxy IPs or keep the Control UI local-only.
Full report: openclaw security audit
Deep probe: openclaw security audit --deep

Channels
┌──────────┬─────────┬────────┬───────────────────────────────────────────────────────────────────────────────────────┐
│ Channel  │ Enabled │ State  │ Detail                                                                                │
├──────────┼─────────┼────────┼───────────────────────────────────────────────────────────────────────────────────────┤
└──────────┴─────────┴────────┴───────────────────────────────────────────────────────────────────────────────────────┘

Sessions
┌───────────────────────────────────────────┬────────┬─────────┬──────────────────────┬───────────────────────────────┐
│ Key                                       │ Kind   │ Age     │ Model                │ Tokens                        │
├───────────────────────────────────────────┼────────┼─────────┼──────────────────────┼───────────────────────────────┤
│ agent:main:main                           │ direct │ 5m ago  │ moonshotai/kimi-k2.5 │ 9.8k/262k (4%) · 🗄️ 9% cached │
└───────────────────────────────────────────┴────────┴─────────┴──────────────────────┴───────────────────────────────┘

Health
┌──────────┬───────────┬──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Item     │ Status    │ Detail                                                                                       │
├──────────┼───────────┼──────────────────────────────────────────────────────────────────────────────────────────────┤
│ Gateway  │ reachable │ 0ms                                                                                          │
└──────────┴───────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘

FAQ: https://docs.openclaw.ai/faq
Troubleshooting: https://docs.openclaw.ai/troubleshooting

Update available (npm 2026.3.1). Run: openclaw update

Next steps:
  Need to share?      openclaw status --all
  Need to debug live? openclaw logs --follow
  Need to test channels? openclaw status --deep
DONE=openclaw_status_complete
DONE=isa_vm_ssh_exec_complete
DONE=vm_run_complete
DONE=openclaw_status_complete
```

### `openclaw models status`

```text
Config        : ~/.openclaw/openclaw.json
Agent dir     : ~/.openclaw/agents/main/agent
Default       : openrouter/moonshotai/kimi-k2.5
Fallbacks (0) : -
Image model   : -
Image fallbacks (0): -
Aliases (7)   : ISA Premium Coding (Claude Sonnet 4) -> openrouter/anthropic/claude-sonnet-4, ISA Dev Balanced (DeepSeek V3.2) -> openrouter/deepseek/deepseek-v3.2, ISA Long Context Quality (Gemini 2.5 Flash) -> openrouter/google/gemini-2.5-flash, ISA Fast 1M (Gemini 2.5 Flash Lite) -> openrouter/google/gemini-2.5-flash-lite, ISA Controlled Tool Budget (MiniMax M2.5) -> openrouter/minimax/minimax-m2.5, ISA Fixed Default (Kimi K2.5) -> openrouter/moonshotai/kimi-k2.5, ISA Tool Fast 2M (Grok 4.1 Fast) -> openrouter/x-ai/grok-4.1-fast
Configured models (7): openrouter/anthropic/claude-sonnet-4, openrouter/deepseek/deepseek-v3.2, openrouter/google/gemini-2.5-flash, openrouter/google/gemini-2.5-flash-lite, openrouter/minimax/minimax-m2.5, openrouter/moonshotai/kimi-k2.5, openrouter/x-ai/grok-4.1-fast

Auth overview
Auth store    : ~/.openclaw/agents/main/agent/auth-profiles.json
Shell env     : on
Providers w/ OAuth/tokens (0): -
- github-copilot effective=env:***REDACTED*** | env=***REDACTED*** | source=env: GITHUB_TOKEN
- openrouter effective=env:***REDACTED*** | env=***REDACTED*** | source=env: OPENROUTER_API_KEY

OAuth/token status
- none
```

### `openclaw skills list`

```text
Skills (10/51 ready)
┌───────────┬──────────────────┬───────────────────────────────────────────────────────────────────┬──────────────────┐
│ Status    │ Skill            │ Description                                                       │ Source           │
├───────────┼──────────────────┼───────────────────────────────────────────────────────────────────┼──────────────────┤
│ ✗ missing │ 🔐 1password      │ Set up and use 1Password CLI (op). Use when installing the CLI,   │ openclaw-bundled │
│           │                  │ enabling desktop app integration, signing in (single or multi-    │                  │
│           │                  │ account), or reading/injecting/running secrets via op.            │                  │
│ ✗ missing │ 📝 apple-notes    │ Manage Apple Notes via the `memo` CLI on macOS (create, view,     │ openclaw-bundled │
│           │                  │ edit, delete, search, move, and export notes). Use when a user    │                  │
│           │                  │ asks OpenClaw to add a note, list notes, search notes, or manage  │                  │
│           │                  │ note folders.                                                     │                  │
│ ✗ missing │ ⏰ apple-         │ Manage Apple Reminders via remindctl CLI (list, add, edit,        │ openclaw-bundled │
│           │ reminders        │ complete, delete). Supports lists, date filters, and JSON/plain   │                  │
│           │                  │ output.                                                           │                  │
│ ✗ missing │ 🐻 bear-notes     │ Create, search, and manage Bear notes via grizzly CLI.            │ openclaw-bundled │
│ ✗ missing │ 📰 blogwatcher    │ Monitor blogs and RSS/Atom feeds for updates using the            │ openclaw-bundled │
│           │                  │ blogwatcher CLI.                                                  │                  │
│ ✗ missing │ 🫐 blucli         │ BluOS CLI (blu) for discovery, playback, grouping, and volume.    │ openclaw-bundled │
│ ✗ missing │ 🫧 bluebubbles    │ Use when you need to send or manage iMessages via BlueBubbles     │ openclaw-bundled │
│           │                  │ (recommended iMessage integration). Calls go through the generic  │                  │
│           │                  │ message tool with channel="bluebubbles".                          │                  │
│ ✗ missing │ 📸 camsnap        │ Capture frames or clips from RTSP/ONVIF cameras.                  │ openclaw-bundled │
│ ✓ ready   │ 📦 clawhub        │ Use the ClawHub CLI to search, install, update, and publish       │ openclaw-bundled │
│           │                  │ agent skills from clawhub.com. Use when you need to fetch new     │                  │
│           │                  │ skills on the fly, sync installed skills to latest or a specific  │                  │
│           │                  │ version, or publish new/updated skill folders with the npm-       │                  │
│           │                  │ installed clawhub CLI.                                            │                  │
│ ✗ missing │ 🧩 coding-agent   │ Delegate coding tasks to Codex, Claude Code, or Pi agents via     │ openclaw-bundled │
│           │                  │ background process. Use when: (1) building/creating new features  │                  │
│           │                  │ or apps, (2) reviewing PRs (spawn in temp dir), (3) refactoring   │                  │
│           │                  │ large codebases, (4) iterative coding that needs file             │                  │
│           │                  │ exploration. NOT for: simple one-liner fixes (just edit),         │                  │
│           │                  │ reading code (use read tool), thread-bound ACP harness requests   │                  │
│           │                  │ in chat (for example spawn/run Codex or Claude Code in a Discord  │                  │
│           │                  │ thread; use sessions_spawn with runtime:"acp"), or any work in ~/ │                  │
│           │                  │ clawd workspace (never spawn agents here). Requires a bash tool   │                  │
│           │                  │ that supports pty:true.                                           │                  │
│ ✗ missing │ 🎮 discord        │ Discord ops via the message tool (channel=discord).               │ openclaw-bundled │
│ ✗ missing │ 🎛️ eightctl      │ Control Eight Sleep pods (status, temperature, alarms,            │ openclaw-bundled │
│           │                  │ schedules).                                                       │                  │
│ ✓ ready   │ ♊️ gemini        │ Gemini CLI for one-shot Q&A, summaries, and generation.           │ openclaw-bundled │
│ ✓ ready   │ 📦 gh-issues      │ Fetch GitHub issues, spawn sub-agents to implement fixes and      │ openclaw-bundled │
│           │                  │ open PRs, then monitor and address PR review comments. Usage: /   │                  │
│           │                  │ gh-issues [owner/repo] [--label bug] [--limit 5] [--milestone v1. │                  │
│           │                  │ 0] [--assignee @me] [--fork user/repo] [--watch] [--interval 5]   │                  │
│           │                  │ [--reviews-only] [--cron] [--dry-run] [--model glm-5] [--notify-  │                  │
│           │                  │ channel -1002381931352]                                           │                  │
│ ✗ missing │ 🧲 gifgrep        │ Search GIF providers with CLI/TUI, download results, and extract  │ openclaw-bundled │
│           │                  │ stills/sheets.                                                    │                  │
│ ✓ ready   │ 🐙 github         │ GitHub operations via `gh` CLI: issues, PRs, CI runs, code        │ openclaw-bundled │
│           │                  │ review, API queries. Use when: (1) checking PR status or CI, (2)  │                  │
│           │                  │ creating/commenting on issues, (3) listing/filtering PRs or       │                  │
│           │                  │ issues, (4) viewing run logs. NOT for: complex web UI             │                  │
│           │                  │ interactions requiring manual browser flows (use browser tooling  │                  │
│           │                  │ when available), bulk operations across many repos (script with   │                  │
│           │                  │ gh api), or when gh auth is not configured.                       │                  │
│ ✗ missing │ 🎮 gog            │ Google Workspace CLI for Gmail, Calendar, Drive, Contacts,        │ openclaw-bundled │
│           │                  │ Sheets, and Docs.                                                 │                  │
│ ✗ missing │ 📍 goplaces       │ Query Google Places API (New) via the goplaces CLI for text       │ openclaw-bundled │
│           │                  │ search, place details, resolve, and reviews. Use for human-       │                  │
│           │                  │ friendly place lookup or JSON output for scripts.                 │                  │
│ ✓ ready   │ 📦 healthcheck    │ Host security hardening and risk-tolerance configuration for      │ openclaw-bundled │
│           │                  │ OpenClaw deployments. Use when a user asks for security audits,   │                  │
│           │                  │ firewall/SSH/update hardening, risk posture, exposure review,     │                  │
│           │                  │ OpenClaw cron scheduling for periodic checks, or version status   │                  │
│           │                  │ checks on a machine running OpenClaw (laptop, workstation, Pi,    │                  │
│           │                  │ VPS).                                                             │                  │
│ ✗ missing │ 📧 himalaya       │ CLI to manage emails via IMAP/SMTP. Use `himalaya` to list,       │ openclaw-bundled │
│           │                  │ read, write, reply, forward, search, and organize emails from     │                  │
│           │                  │ the terminal. Supports multiple accounts and message composition  │                  │
│           │                  │ with MML (MIME Meta Language).                                    │                  │
│ ✗ missing │ 📨 imsg           │ iMessage/SMS CLI for listing chats, history, and sending          │ openclaw-bundled │
│           │                  │ messages via Messages.app.                                        │                  │
│ ✓ ready   │ 📦 mcporter       │ Use the mcporter CLI to list, configure, auth, and call MCP       │ openclaw-bundled │
│           │                  │ servers/tools directly (HTTP or stdio), including ad-hoc          │                  │
│           │                  │ servers, config edits, and CLI/type generation.                   │                  │
│ ✗ missing │ 📊 model-usage    │ Use CodexBar CLI local cost usage to summarize per-model usage    │ openclaw-bundled │
│           │                  │ for Codex or Claude, including the current (most recent) model    │                  │
│           │                  │ or a full model breakdown. Trigger when asked for model-level     │                  │
│           │                  │ usage/cost data from codexbar, or when you need a scriptable per- │                  │
│           │                  │ model summary from codexbar cost JSON.                            │                  │
│ ✗ missing │ 🍌 nano-banana-   │ Generate or edit images via Gemini 3 Pro Image (Nano Banana Pro). │ openclaw-bundled │
│           │ pro              │                                                                   │                  │
│ ✗ missing │ 📄 nano-pdf       │ Edit PDFs with natural-language instructions using the nano-pdf   │ openclaw-bundled │
│           │                  │ CLI.                                                              │                  │
│ ✗ missing │ 📝 notion         │ Notion API for creating and managing pages, databases, and        │ openclaw-bundled │
│           │                  │ blocks.                                                           │                  │
│ ✗ missing │ 💎 obsidian       │ Work with Obsidian vaults (plain Markdown notes) and automate     │ openclaw-bundled │
│           │                  │ via obsidian-cli.                                                 │                  │
│ ✗ missing │ 🖼️ openai-image- │ Batch-generate images via OpenAI Images API. Random prompt        │ openclaw-bundled │
│           │ gen              │ sampler + `index.html` gallery.                                   │                  │
│ ✗ missing │ 🎙️ openai-       │ Local speech-to-text with the Whisper CLI (no API key).           │ openclaw-bundled │
│           │ whisper          │                                                                   │                  │
│ ✗ missing │ ☁️ openai-       │ Transcribe audio via OpenAI Audio Transcriptions API (Whisper).   │ openclaw-bundled │
│           │ whisper-api      │                                                                   │                  │
│ ✗ missing │ 💡 openhue        │ Control Philips Hue lights and scenes via the OpenHue CLI.        │ openclaw-bundled │
│ ✗ missing │ 🧿 oracle         │ Best practices for using the oracle CLI (prompt + file bundling,  │ openclaw-bundled │
│           │                  │ engines, sessions, and file attachment patterns).                 │                  │
│ ✗ missing │ 🛵 ordercli       │ Foodora-only CLI for checking past orders and active order        │ openclaw-bundled │
│           │                  │ status (Deliveroo WIP).                                           │                  │
│ ✗ missing │ 👀 peekaboo       │ Capture and automate macOS UI with the Peekaboo CLI.              │ openclaw-bundled │
│ ✗ missing │ 🗣️ sag           │ ElevenLabs text-to-speech with mac-style say UX.                  │ openclaw-bundled │
│ ✓ ready   │ 📜 session-logs   │ Search and analyze your own session logs (older/parent            │ openclaw-bundled │
│           │                  │ conversations) using jq.                                          │                  │
│ ✗ missing │ 🗣️ sherpa-onnx-  │ Local text-to-speech via sherpa-onnx (offline, no cloud)          │ openclaw-bundled │
│           │ tts              │                                                                   │                  │
│ ✓ ready   │ 📦 skill-creator  │ Create or update AgentSkills. Use when designing, structuring,    │ openclaw-bundled │
│           │                  │ or packaging skills with scripts, references, and assets.         │                  │
│ ✗ missing │ 💬 slack          │ Use when you need to control Slack from OpenClaw via the slack    │ openclaw-bundled │
│           │                  │ tool, including reacting to messages or pinning/unpinning items   │                  │
│           │                  │ in Slack channels or DMs.                                         │                  │
│ ✗ missing │ 🌊 songsee        │ Generate spectrograms and feature-panel visualizations from       │ openclaw-bundled │
│           │                  │ audio with the songsee CLI.                                       │                  │
│ ✗ missing │ 🔊 sonoscli       │ Control Sonos speakers (discover/status/play/volume/group).       │ openclaw-bundled │
│ ✗ missing │ 🎵 spotify-player │ Terminal Spotify playback/search via spogo (preferred) or         │ openclaw-bundled │
│           │                  │ spotify_player.                                                   │                  │
│ ✗ missing │ 🧾 summarize      │ Summarize or extract text/transcripts from URLs, podcasts, and    │ openclaw-bundled │
│           │                  │ local files (great fallback for “transcribe this YouTube/video”). │                  │
│ ✗ missing │ ✅ things-mac     │ Manage Things 3 via the `things` CLI on macOS (add/update         │ openclaw-bundled │
│           │                  │ projects+todos via URL scheme; read/search/list from the local    │                  │
│           │                  │ Things database). Use when a user asks OpenClaw to add a task to  │                  │
│           │                  │ Things, list inbox/today/upcoming, search tasks, or inspect       │                  │
│           │                  │ projects/areas/tags.                                              │                  │
│ ✓ ready   │ 🧵 tmux           │ Remote-control tmux sessions for interactive CLIs by sending      │ openclaw-bundled │
│           │                  │ keystrokes and scraping pane output.                              │                  │
│ ✗ missing │ 📋 trello         │ Manage Trello boards, lists, and cards via the Trello REST API.   │ openclaw-bundled │
│ ✗ missing │ 🎞️ video-frames  │ Extract frames or short clips from videos using ffmpeg.           │ openclaw-bundled │
│ ✗ missing │ 📞 voice-call     │ Start voice calls via the OpenClaw voice-call plugin.             │ openclaw-bundled │
│ ✗ missing │ 📱 wacli          │ Send WhatsApp messages to other people or search/sync WhatsApp    │ openclaw-bundled │
│           │                  │ history via the wacli CLI (not for normal user chats).            │                  │
│ ✓ ready   │ 🌤️ weather       │ Get current weather and forecasts via wttr.in or Open-Meteo. Use  │ openclaw-bundled │
│           │                  │ when: user asks about weather, temperature, or forecasts for any  │                  │
│           │                  │ location. NOT for: historical weather data, severe weather        │                  │
│           │                  │ alerts, or detailed meteorological analysis. No API key needed.   │                  │
│ ✗ missing │ 𝕏 xurl           │ A CLI tool for making authenticated requests to the X (Twitter)   │ openclaw-bundled │
│           │                  │ API. Use this skill when you need to post tweets, reply, quote,   │                  │
│           │                  │ search, read posts, manage followers, send DMs, upload media, or  │                  │
│           │                  │ interact with any X API v2 endpoint.                              │                  │
└───────────┴──────────────────┴───────────────────────────────────────────────────────────────────┴──────────────────┘

Tip: use `npx clawhub` to search, install, and sync skills.
```

### `openclaw plugins list`

```text
Plugins (4/37 loaded)
Source roots:
  stock: /usr/lib/node_modules/openclaw/extensions

┌──────────────┬──────────┬──────────┬────────────────────────────────────────────────────────────────────┬───────────┐
│ Name         │ ID       │ Status   │ Source                                                             │ Version   │
├──────────────┼──────────┼──────────┼────────────────────────────────────────────────────────────────────┼───────────┤
│ ACPX Runtime │ acpx     │ disabled │ stock:acpx/index.ts                                                │ 2026.2.26 │
│              │          │          │ ACP runtime backend powered by a pinned plugin-local acpx CLI.     │           │
│ @openclaw/   │ bluebubb │ disabled │ stock:bluebubbles/index.ts                                         │ 2026.2.26 │
│ bluebubbles  │ les      │          │ OpenClaw BlueBubbles channel plugin                                │           │
│ @openclaw/   │ copilot- │ disabled │ stock:copilot-proxy/index.ts                                       │ 2026.2.26 │
│ copilot-     │ proxy    │          │ OpenClaw Copilot Proxy provider plugin                             │           │
│ proxy        │          │          │                                                                    │           │
│ Device       │ device-  │ loaded   │ stock:device-pair/index.ts                                         │           │
│ Pairing      │ pair     │          │ Generate setup codes and approve device pairing requests.          │           │
│ @openclaw/   │ diagnost │ disabled │ stock:diagnostics-otel/index.ts                                    │ 2026.2.26 │
│ diagnostics- │ ics-otel │          │ OpenClaw diagnostics OpenTelemetry exporter                        │           │
│ otel         │          │          │                                                                    │           │
│ @openclaw/   │ discord  │ disabled │ stock:discord/index.ts                                             │ 2026.2.26 │
│ discord      │          │          │ OpenClaw Discord channel plugin                                    │           │
│ @openclaw/   │ feishu   │ disabled │ stock:feishu/index.ts                                              │ 2026.2.26 │
│ feishu       │          │          │ OpenClaw Feishu/Lark channel plugin (community maintained by       │           │
│              │          │          │ @m1heng)                                                           │           │
│ @openclaw/   │ google-  │ disabled │ stock:google-gemini-cli-auth/index.ts                              │ 2026.2.26 │
│ google-      │ gemini-  │          │ OpenClaw Gemini CLI OAuth provider plugin                          │           │
│ gemini-cli-  │ cli-auth │          │                                                                    │           │
│ auth         │          │          │                                                                    │           │
│ @openclaw/   │ googlech │ disabled │ stock:googlechat/index.ts                                          │ 2026.2.26 │
│ googlechat   │ at       │          │ OpenClaw Google Chat channel plugin                                │           │
│ @openclaw/   │ imessage │ disabled │ stock:imessage/index.ts                                            │ 2026.2.26 │
│ imessage     │          │          │ OpenClaw iMessage channel plugin                                   │           │
│ @openclaw/   │ irc      │ disabled │ stock:irc/index.ts                                                 │ 2026.2.26 │
│ irc          │          │          │ OpenClaw IRC channel plugin                                        │           │
│ @openclaw/   │ line     │ disabled │ stock:line/index.ts                                                │ 2026.2.26 │
│ line         │          │          │ OpenClaw LINE channel plugin                                       │           │
│ LLM Task     │ llm-task │ disabled │ stock:llm-task/index.ts                                            │ 2026.2.26 │
│              │          │          │ Generic JSON-only LLM tool for structured tasks callable from      │           │
│              │          │          │ workflows.                                                         │           │
│ Lobster      │ lobster  │ disabled │ stock:lobster/index.ts                                             │ 2026.2.26 │
│              │          │          │ Typed workflow tool with resumable approvals.                      │           │
│ @openclaw/   │ matrix   │ disabled │ stock:matrix/index.ts                                              │ 2026.2.26 │
│ matrix       │          │          │ OpenClaw Matrix channel plugin                                     │           │
│ @openclaw/   │ mattermo │ disabled │ stock:mattermost/index.ts                                          │ 2026.2.26 │
│ mattermost   │ st       │          │ OpenClaw Mattermost channel plugin                                 │           │
│ Memory       │ memory-  │ loaded   │ stock:memory-core/index.ts                                         │ 2026.2.26 │
│ (Core)       │ core     │          │ File-backed memory search tools and CLI                            │           │
│ @openclaw/   │ memory-  │ disabled │ stock:memory-lancedb/index.ts                                      │ 2026.2.26 │
│ memory-      │ lancedb  │          │ OpenClaw LanceDB-backed long-term memory plugin with auto-recall/  │           │
│ lancedb      │          │          │ capture                                                            │           │
│ @openclaw/   │ minimax- │ disabled │ stock:minimax-portal-auth/index.ts                                 │ 2026.2.26 │
│ minimax-     │ portal-  │          │ OpenClaw MiniMax Portal OAuth provider plugin                      │           │
│ portal-auth  │ auth     │          │                                                                    │           │
│ @openclaw/   │ msteams  │ disabled │ stock:msteams/index.ts                                             │ 2026.2.26 │
│ msteams      │          │          │ OpenClaw Microsoft Teams channel plugin                            │           │
│ @openclaw/   │ nextclou │ disabled │ stock:nextcloud-talk/index.ts                                      │ 2026.2.26 │
│ nextcloud-   │ d-talk   │          │ OpenClaw Nextcloud Talk channel plugin                             │           │
│ talk         │          │          │                                                                    │           │
│ @openclaw/   │ nostr    │ disabled │ stock:nostr/index.ts                                               │ 2026.2.26 │
│ nostr        │          │          │ OpenClaw Nostr channel plugin for NIP-04 encrypted DMs             │           │
│ OpenProse    │ open-    │ disabled │ stock:open-prose/index.ts                                          │ 2026.2.26 │
│              │ prose    │          │ OpenProse VM skill pack with a /prose slash command.               │           │
│ Phone        │ phone-   │ loaded   │ stock:phone-control/index.ts                                       │           │
│ Control      │ control  │          │ Arm/disarm high-risk phone node commands (camera/screen/writes)    │           │
│              │          │          │ with an optional auto-expiry.                                      │           │
│ qwen-portal- │          │ disabled │ stock:qwen-portal-auth/index.ts                                    │           │
│ auth         │          │          │                                                                    │           │
│ @openclaw/   │ signal   │ disabled │ stock:signal/index.ts                                              │ 2026.2.26 │
│ signal       │          │          │ OpenClaw Signal channel plugin                                     │           │
│ @openclaw/   │ slack    │ disabled │ stock:slack/index.ts                                               │ 2026.2.26 │
│ slack        │          │          │ OpenClaw Slack channel plugin                                      │           │
│ @openclaw/   │ synology │ disabled │ stock:synology-chat/index.ts                                       │ 2026.2.26 │
│ synology-    │ -chat    │          │ Synology Chat channel plugin for OpenClaw                          │           │
│ chat         │          │          │                                                                    │           │
│ Talk Voice   │ talk-    │ loaded   │ stock:talk-voice/index.ts                                          │           │
│              │ voice    │          │ Manage Talk voice selection (list/set).                            │           │
│ @openclaw/   │ telegram │ disabled │ stock:telegram/index.ts                                            │ 2026.2.26 │
│ telegram     │          │          │ OpenClaw Telegram channel plugin                                   │           │
│ Thread       │ thread-  │ disabled │ stock:thread-ownership/index.ts                                    │           │
│ Ownership    │ ownershi │          │ Prevents multiple agents from responding in the same Slack thread. │           │
│              │ p        │          │  Uses HTTP calls to the slack-forwarder ownership API.             │           │
│ @openclaw/   │ tlon     │ disabled │ stock:tlon/index.ts                                                │ 2026.2.26 │
│ tlon         │          │          │ OpenClaw Tlon/Urbit channel plugin                                 │           │
│ @openclaw/   │ twitch   │ disabled │ stock:twitch/index.ts                                              │ 2026.2.26 │
│ twitch       │          │          │ OpenClaw Twitch channel plugin                                     │           │
│ @openclaw/   │ voice-   │ disabled │ stock:voice-call/index.ts                                          │ 2026.2.26 │
│ voice-call   │ call     │          │ OpenClaw voice-call plugin                                         │           │
│ @openclaw/   │ whatsapp │ disabled │ stock:whatsapp/index.ts                                            │ 2026.2.26 │
│ whatsapp     │          │          │ OpenClaw WhatsApp channel plugin                                   │           │
│ @openclaw/   │ zalo     │ disabled │ stock:zalo/index.ts                                                │ 2026.2.26 │
│ zalo         │          │          │ OpenClaw Zalo channel plugin                                       │           │
│ @openclaw/   │ zalouser │ disabled │ stock:zalouser/index.ts                                            │ 2026.2.26 │
│ zalouser     │          │          │ OpenClaw Zalo Personal Account plugin via zca-cli                  │           │
└──────────────┴──────────┴──────────┴────────────────────────────────────────────────────────────────────┴───────────┘
```

### `openclaw hooks list`

```text
Hooks (4/4 ready)
┌──────────┬──────────────────────┬───────────────────────────────────────────────────────────────────┬───────────────┐
│ Status   │ Hook                 │ Description                                                       │ Source        │
├──────────┼──────────────────────┼───────────────────────────────────────────────────────────────────┼───────────────┤
│ ✓ ready  │ 🚀 boot-md            │ Run BOOT.md on gateway startup                                    │ openclaw-     │
│          │                      │                                                                   │ bundled       │
│ ✓ ready  │ 📎 bootstrap-extra-   │ Inject additional workspace bootstrap files via glob/path         │ openclaw-     │
│          │ files                │ patterns                                                          │ bundled       │
│ ✓ ready  │ 📝 command-logger     │ Log all command events to a centralized audit file                │ openclaw-     │
│          │                      │                                                                   │ bundled       │
│ ✓ ready  │ 💾 session-memory     │ Save session context to memory when /new or /reset command is     │ openclaw-     │
│          │                      │ issued                                                            │ bundled       │
└──────────┴──────────────────────┴───────────────────────────────────────────────────────────────────┴───────────────┘
```
