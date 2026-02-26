# CLI Commands

Generated: 2026-02-26T11:24:03.779Z
Command count (from openclaw --help): 44

Evidence:
- openclaw_audit/exec/EXEC_LOGS/openclaw_help.log
- openclaw_audit/source/openclaw-main/src/cli/program/command-registry.ts
- openclaw_audit/source/openclaw-main/src/cli/program/register.subclis.ts

| Command | Subcommands | Synopsis | Evidence |
|---|---|---|---|
| acp | yes | Agent Control Protocol tools | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:23; - |
| agent | no | Run one agent turn via the Gateway | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:24; - |
| agents | yes | Manage isolated agents (workspaces, auth, routing) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:25; - |
| approvals | yes | Manage exec approvals (gateway or node host) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:26; - |
| browser | yes | Manage OpenClaw's dedicated browser (Chrome/Chromium) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:27; - |
| channels | yes | Manage connected chat channels (Telegram, Discord, etc.) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:28; - |
| clawbot | yes | Legacy clawbot command aliases | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:29; - |
| completion | no | Generate shell completion script | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:30; - |
| config | yes | Non-interactive config helpers (get/set/unset). Default: | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:31; - |
| configure | no | Interactive setup wizard for credentials, channels, | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:33; - |
| cron | yes | Manage cron jobs via the Gateway scheduler | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:35; - |
| daemon | yes | Gateway service (legacy alias) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:36; - |
| dashboard | no | Open the Control UI with your current token | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:37; - |
| devices | yes | Device pairing + token management | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:38; - |
| directory | yes | Lookup contact and group IDs (self, peers, groups) for | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:39; - |
| dns | yes | DNS helpers for wide-area discovery (Tailscale + CoreDNS) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:41; - |
| docs | no | Search the live OpenClaw docs | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:42; - |
| doctor | no | Health checks + quick fixes for the gateway and channels | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:43; - |
| gateway | yes | Run, inspect, and query the WebSocket Gateway | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:44; - |
| health | no | Fetch health from the running gateway | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:45; - |
| help | no | Display help for command | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:46; - |
| hooks | yes | Manage internal agent hooks | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:47; - |
| logs | no | Tail gateway file logs via RPC | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:48; - |
| memory | yes | Search and reindex memory files | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:49; - |
| message | yes | Send, read, and manage messages | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:50; - |
| models | yes | Discover, scan, and configure models | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:51; - |
| node | yes | Run and manage the headless node host service | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:52; - |
| nodes | yes | Manage gateway-owned node pairing and node commands | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:53; - |
| onboard | no | Interactive onboarding wizard for gateway, workspace, and | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:54; - |
| pairing | yes | Secure DM pairing (approve inbound requests) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:56; - |
| plugins | yes | Manage OpenClaw plugins and extensions | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:57; - |
| qr | no | Generate iOS pairing QR/setup code | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:58; - |
| reset | no | Reset local config/state (keeps the CLI installed) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:59; - |
| sandbox | yes | Manage sandbox containers for agent isolation | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:60; - |
| security | yes | Security tools and local config audits | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:61; - |
| sessions | yes | List stored conversation sessions | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:62; - |
| setup | no | Initialize local config and agent workspace | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:63; - |
| skills | yes | List and inspect available skills | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:64; - |
| status | no | Show channel health and recent session recipients | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:65; - |
| system | yes | System events, heartbeat, and presence | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:66; - |
| tui | no | Open a terminal UI connected to the Gateway | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:67; - |
| uninstall | no | Uninstall the gateway service + local data (CLI remains) | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:68; - |
| update | yes | Update OpenClaw and inspect update channel status | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:69; - |
| webhooks | yes | Webhook helpers and integrations | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:70; - |
