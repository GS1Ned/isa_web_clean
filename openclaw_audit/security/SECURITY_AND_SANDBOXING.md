# Security and Sandboxing

Generated: 2026-02-26T11:24:04.855Z

## Evidence Matrix

| Category | ZIP evidence | Docs evidence | Status |
|---|---|---|---|
| apply_patch Tool | openclaw_audit/source/openclaw-main/docs/tools/apply-patch.md:2 - summary: "Apply multi-file patches with the apply_patch tool" ; openclaw_audit/source/openclaw-main/ui/src/ui/views/agents-utils.ts:371 - if (normalized === "apply_patch" && matchesAny("exec", allow)) { | https://docs.openclaw.ai/tools/apply-patch - apply_patch Tool - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Built-in | CONFIRMED |
| Elevated Mode | openclaw_audit/source/openclaw-main/docs/tools/elevated.md:2 - summary: "Elevated exec mode and /elevated directives" ; openclaw_audit/source/openclaw-main/src/acp/commands.ts:34 - { name: "elevated", description: "Toggle elevated mode (on\|off)." }, | https://docs.openclaw.ai/tools/elevated - Elevated Mode - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Built-in | CONFIRMED |
| Trusted proxy auth | openclaw_audit/source/openclaw-main/docs/gateway/trusted-proxy-auth.md:2 - summary: "Delegate gateway authentication to a trusted reverse proxy (Pomerium, Caddy, nginx + OAuth)" ; openclaw_audit/source/openclaw-main/src/security/audit.ts:494 - "See /gateway/trusted-proxy-auth for setup guidance.", | https://docs.openclaw.ai/gateway/trusted-proxy-auth - Trusted proxy auth - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Get start | CONFIRMED |
| Gateway Lock | openclaw_audit/source/openclaw-main/docs/gateway/gateway-lock.md:2 - summary: "Gateway singleton guard using the WebSocket listener bind" ; openclaw_audit/source/openclaw-main/src/cli/gateway-cli/run-loop.ts:54 - gatewayLog.error(`failed to reacquire gateway lock for in-process restart: ${String(err)}`); | https://docs.openclaw.ai/gateway/gateway-lock - Gateway Lock - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Configura | CONFIRMED |
| Background Exec and Process Tool | openclaw_audit/source/openclaw-main/docs/gateway/background-process.md:2 - summary: "Background exec execution and process management" ; openclaw_audit/source/openclaw-main/src/agents/bash-tools.exec.ts:236 - warnings.push("Warning: background execution is disabled; running synchronously."); | https://docs.openclaw.ai/gateway/background-process - Background Exec and Process Tool - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Configura | CONFIRMED |
| Security and sandboxing | openclaw_audit/source/openclaw-main/docs/gateway/security/index.md:2 - summary: "Security considerations and threat model for running an AI gateway with shell access" ; openclaw_audit/source/openclaw-main/src/wizard/onboarding.ts:56 - "Must read: https://docs.openclaw.ai/gateway/security", | https://docs.openclaw.ai/gateway/security - t OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Security and sandboxing Security Get started Install Channels Agents Tools Models Platforms Gateway… | CONFIRMED |
| Security | openclaw_audit/source/openclaw-main/docs/gateway/security/index.md:2 - summary: "Security considerations and threat model for running an AI gateway with shell access" ; openclaw_audit/source/openclaw-main/src/wizard/onboarding.ts:56 - "Must read: https://docs.openclaw.ai/gateway/security", | https://docs.openclaw.ai/gateway/security - Security - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Security | CONFIRMED |
| Formal Verification (Security Models) | openclaw_audit/source/openclaw-main/docs/security/formal-verification.md:2 - title: Formal Verification (Security Models) ; openclaw_audit/source/openclaw-main/docs/docs.json:1190 - "pages": ["security/formal-verification"] | https://docs.openclaw.ai/security/formal-verification - Formal Verification (Security Models) - OpenClaw Skip to main content OpenClaw home page English Search... ⌘ K GitHub Releases Search... Navigation Security | CONFIRMED |

## Key Source Anchors

- openclaw_audit/source/openclaw-main/src/security/audit.ts
- openclaw_audit/source/openclaw-main/src/security/audit-extra.sync.ts
- openclaw_audit/source/openclaw-main/src/agents/sandbox
- openclaw_audit/source/openclaw-main/src/agents/apply-patch.ts
