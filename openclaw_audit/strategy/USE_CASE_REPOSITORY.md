# Use Case Repository

Generated: 2026-02-26T12:20:42.755Z

## Source Notes
- Internal: openclaw_audit/use_cases/USE_CASES.md and audited feature evidence.
- Community: [C2] [C3] [C4] [C5] with explicit security caveats [C6] [C7] [C8].

## Pattern Catalog
| Pattern | What was automated? | Tools/Skills used | Deployment environment | Safety/Permissions model | Evidence | ISA relevance tags |
|---|---|---|---|---|---|---|
| n8n webhook orchestration | Delegated external API calls and workflow chains | Webhooks, cron, skills | Self-hosted gateway + n8n | Keep creds in n8n, not agent memory | [C3] | automation-governance, integration-gateway |
| Self-healing server operations | Scheduled health checks + remediation | Exec, cron, hooks | Home server/VM | Requires strict command policy and audit logs | [C3][C6] | reliability, ops-runbook, incident-response |
| Multi-channel assistant routing | Telegram/Slack/email/calendar task routing | Channels + skills + automations | Personal cloud/local hybrid | High credential scope; enforce least privilege per connector | [C3][C5] | orchestration, human-loop, channel-policy |
| Inbox digesting and summarization | Newsletter/inbox triage and summaries | Web/search + messaging channels | Local or hosted gateway | Data retention and PII policies required | [C3][C5] | ask_isa_assist, news_hub_pattern |
| Content pipeline automation | Research -> drafting -> publishing loops | Subagents, browser, skills | Cloud or workstation | Multi-agent review gates needed to avoid hallucinated publishing | [C3][C4] | advisory-drafting, workflow-decomposition |
| Browser-assisted task completion | Form fills, scraping, web actions | Browser tool, extension relay | Desktop workstation/VM | Session isolation and explicit login boundaries | [C4][C6] | ops-fallback, evidence-capture |
| Community skill installation | Extend capability rapidly | ClawHub + skill install flows | Local, cloud, mixed | Review source and metadata before install; sandbox required | [C2][C9][C7] | extensibility, plugin-governance |
| Voice/phone automation | Call handling and assistant access by phone | Voice-call plugin + channels | Hosted gateway + telephony provider | Consent, recording policy, and PII controls required | [C3][C5] | future-channel, low-priority |
| Autonomous project management | Multi-agent planning/execution loops | Agent send, subagents, state files | Local dev + CI runners | Needs deterministic task contracts and approval checkpoints | [C3][C4] | advisory-orchestration, devops-assist |
| Personal knowledge memory | Capture/search personal artifacts | Memory + retrieval skills | Local-first | Data classification and retention policy mandatory for regulated use | [C3][C4] | knowledge-base-pattern |

## Adoption Signals
- OpenClaw main repository reports substantial public adoption (stars/forks/activity) [C1].
- Large third-party ecosystems exist for skills and examples, but with explicit warnings that curation is not equivalent to audit [C2][C3].
- Registry model (ClawHub) includes metadata and discovery workflows suitable for policy wrappers, not direct trust [C9].

## Security Caveat
Community examples are strong ideation input but not deployment-ready controls for ISA without additional governance wrappers and security gates [C6][C7][C8][C10].
