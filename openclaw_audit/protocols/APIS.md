# APIs and Protocols

Generated: 2026-02-26T11:24:04.855Z

## Evidence Matrix

| Category | ZIP evidence | Docs evidence | Status |
|---|---|---|---|
| Gateway | openclaw_audit/source/openclaw-main/docs/cli/gateway.md:2 - summary: "OpenClaw Gateway CLI (`openclaw gateway`) — run, query, and discover gateways" ; openclaw_audit/source/openclaw-main/package.json:4 - "description": "Multi-channel AI gateway with extensible messaging integrations", | https://docs.openclaw.ai/cli/gateway - gateway - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation CLI comma | CONFIRMED |
| Protocols and APIs | openclaw_audit/source/openclaw-main/docs/gateway/protocol.md:1 - --- ; openclaw_audit/source/openclaw-main/scripts/protocol-gen-swift.ts:4 - import { ErrorCodes, PROTOCOL_VERSION, ProtocolSchemas } from "../src/gateway/protocol/schema.js"; | https://docs.openclaw.ai/gateway/protocol - t OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Protocols and APIs Gateway Protocol Get started Install Channels Agents Tools Models Platforms Gate… | CONFIRMED |
| Web | openclaw_audit/source/openclaw-main/docs/web/index.md:2 - summary: "Gateway web surfaces: Control UI, bind modes, and security" ; openclaw_audit/source/openclaw-main/package.json:162 - "@slack/web-api": "^7.14.1", | https://docs.openclaw.ai/web - ecurity downgrade. With Serve, Tailscale identity headers can satisfy Control UI/WebSocket auth when gateway.auth.allowTailscale is true (no token/password required). HTTP API end… | CONFIRMED |
| Control UI | openclaw_audit/source/openclaw-main/docs/web/control-ui.md:2 - summary: "Browser-based control UI for the Gateway (chat, nodes, config)" ; openclaw_audit/source/openclaw-main/ui/src/ui/views/overview.ts:62 - href="https://docs.openclaw.ai/web/control-ui#device-pairing-first-connection" | https://docs.openclaw.ai/web/control-ui - Control UI - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Web inter | CONFIRMED |
| Dashboard | openclaw_audit/source/openclaw-main/docs/web/dashboard.md:2 - summary: "Gateway dashboard (Control UI) access and auth" ; openclaw_audit/source/openclaw-main/ui/src/ui/views/overview.ts:119 - href="https://docs.openclaw.ai/web/dashboard" | https://docs.openclaw.ai/web/dashboard - Dashboard - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Web inter | CONFIRMED |
| WebChat | openclaw_audit/source/openclaw-main/docs/web/webchat.md:2 - summary: "Loopback WebChat static host and Gateway WS usage for chat UI" ; openclaw_audit/source/openclaw-main/ui/src/ui/app-gateway.ts:153 - mode: "webchat", | https://docs.openclaw.ai/web/webchat - WebChat - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Web inter | CONFIRMED |
| TUI | openclaw_audit/source/openclaw-main/docs/web/tui.md:2 - summary: "Terminal UI (TUI): connect to the Gateway from any machine" ; openclaw_audit/source/openclaw-main/docs/docs.json:692 - "destination": "/web/tui" | https://docs.openclaw.ai/web/tui - TUI - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Web inter | CONFIRMED |

## Protocol Source Anchors

- openclaw_audit/source/openclaw-main/src/gateway/protocol
- openclaw_audit/source/openclaw-main/src/gateway/tools-invoke-http.ts
- openclaw_audit/source/openclaw-main/docs/reference/rpc.md
- openclaw_audit/source/openclaw-main/docs/gateway/openai-http-api.md
