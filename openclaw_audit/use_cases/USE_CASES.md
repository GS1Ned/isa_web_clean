# Use Cases

Generated: 2026-02-26T11:24:04.856Z

## CLI Examples

| Command | Description | Evidence |
|---|---|---|
| openclaw models --help | Show detailed help for the models command. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:73 |
| openclaw channels login --verbose | Link personal WhatsApp Web and show QR + connection logs. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:75 |
| openclaw message send --target +15555550123 --message "Hi" --json | Send via your web session and print JSON result. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:77 |
| openclaw gateway --port 18789 | Run the WebSocket Gateway locally. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:79 |
| openclaw --dev gateway | Run a dev Gateway (isolated state/config) on ws://127.0.0.1:19001. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:81 |
| openclaw gateway --force | Kill anything bound to the default gateway port, then start it. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:83 |
| openclaw gateway ... | Gateway control via WebSocket. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:85 |
| openclaw agent --to +15555550123 --message "Run summary" --deliver | Talk directly to the agent using the Gateway; optionally send the WhatsApp reply. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:87 |
| openclaw message send --channel telegram --target @mychat --message "Hi" | Send via your Telegram bot. | openclaw_audit/exec/EXEC_LOGS/openclaw_help.log:89 |

## Docs Scenarios

| URL | Title | Evidence snippet |
|---|---|---|
| https://docs.openclaw.ai/start/getting-started | Getting Started - OpenClaw | Getting Started - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation First steps Getting Started Get started Install Channels Agents Tools Models Platforms Gatewa… |
| https://docs.openclaw.ai/cli/onboard | onboard - OpenClaw | onboard - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation CLI commands onboard Get started Install Channels Agents Tools Models Platforms Gateway & Ops Referen… |
| https://docs.openclaw.ai/gateway/remote | Remote Access - OpenClaw | Remote Access - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Remote access Remote Access Get started Install Channels Agents Tools Models Platforms Gateway … |
| https://docs.openclaw.ai/gateway/remote-gateway-readme | Remote Gateway Setup - OpenClaw | Remote Gateway Setup - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Remote access Remote Gateway Setup Get started Install Channels Agents Tools Models Plat… |
| https://docs.openclaw.ai/tools/browser-login | Browser Login - OpenClaw | Browser Login - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Browser Browser Login Get started Install Channels Agents Tools Models Platforms Gateway & Ops … |
| https://docs.openclaw.ai/tools/chrome-extension | Chrome Extension - OpenClaw | Chrome Extension - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Browser Chrome Extension Get started Install Channels Agents Tools Models Platforms Gateway … |
| https://docs.openclaw.ai/automation/webhook | Webhooks - OpenClaw | Webhooks - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Automation Webhooks Get started Install Channels Agents Tools Models Platforms Gateway & Ops Referen… |
| https://docs.openclaw.ai/automation/cron-jobs | Cron Jobs - OpenClaw | Cron Jobs - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Automation Cron Jobs Get started Install Channels Agents Tools Models Platforms Gateway & Ops Refer… |
| https://docs.openclaw.ai/plugins/voice-call | Voice Call Plugin - OpenClaw | Voice Call Plugin - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Extensions Voice Call Plugin Get started Install Channels Agents Tools Models Platforms Gat… |
| https://docs.openclaw.ai/plugins/community | Community plugins - OpenClaw | Community plugins - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Extensions Community plugins Get started Install Channels Agents Tools Models Platforms Gat… |
| https://docs.openclaw.ai/web/dashboard | Dashboard - OpenClaw | Dashboard - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Web interfaces Dashboard Get started Install Channels Agents Tools Models Platforms Gateway & Ops R… |
| https://docs.openclaw.ai/web/webchat | WebChat - OpenClaw | WebChat - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Web interfaces WebChat Get started Install Channels Agents Tools Models Platforms Gateway & Ops Refer… |
| https://docs.openclaw.ai/web/tui | TUI - OpenClaw | TUI - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Web interfaces TUI Get started Install Channels Agents Tools Models Platforms Gateway & Ops Reference Hel… |
