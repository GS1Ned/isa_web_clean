# Risk & Security Heatmap

Generated: 2026-02-26T12:20:42.755Z

## Risk Matrix
| Feature family | Typical risk level | Primary risk vectors | Evidence | ISA required controls | Residual risk after controls |
|---|---|---|---|---|---|
| Exec/apply_patch/elevated | Critical | Arbitrary command execution, privilege escalation, destructive writes | openclaw_audit/security/SECURITY_AND_SANDBOXING.md, [C6], [C10] | Default-deny command policy, HITL approvals, immutable exec logs, rollback automation | Medium |
| Skills/plugins/ClawHub | Critical | Supply-chain compromise, prompt injection, unsafe dependencies | openclaw_audit/features/FEATURE_MATRIX.md (Skills/Plugins rows), [C2], [C7], [C9] | Allowlisted publishers, static scanning, provenance pinning, isolated runtime profiles | Medium-High |
| Browser automation/extension | High | Session theft, credential misuse, fragile web actions | openclaw_audit/features/FEATURE_MATRIX.md (Browser rows), [C4], [C6] | Ephemeral browser profiles, scoped credentials, operator-confirmed sensitive actions | Medium |
| Gateway remote/networking | High | Unauthorized access, misconfigured exposure, weak auth | openclaw_audit/network/NETWORK_AND_GATEWAY.md, [C8], [C10] | Trusted proxy auth, strict bind defaults, network ACLs, continuous health checks | Low-Medium |
| Automation hooks/cron/webhooks | High | Runaway jobs, webhook abuse, duplicate side effects | openclaw_audit/features/FEATURE_MATRIX.md (Automation rows), [C3], [C5] | Idempotent job design, signed webhooks, rate limits, kill switch | Medium |
| Channels/media/voice/location | High | PII leakage, consent violations, regulatory non-compliance | openclaw_audit/features/FEATURE_MATRIX.md (Media/Voice rows), [C5] | Data minimization, consent logs, retention limits, jurisdiction checks | Medium-High |
| UI/dashboard/webchat | Medium | Exposed operational metadata, weak access controls | openclaw_audit/features/FEATURE_MATRIX.md (Web/UI rows), [C10] | SSO, role-based access, audit trails for operator actions | Low-Medium |
| Multi-agent coordination | Medium-High | Unclear ownership, compounding errors across agents | openclaw_audit/features/FEATURE_MATRIX.md (Agent rows), [C3] | Contracted task schemas, bounded context windows, explicit checkpoints | Medium |

## Heatmap by ISA Priority
| ISA priority | Exposure from OpenClaw features | Net assessment |
|---|---|---|
| Secure agent workflows | High exposure to exec/skills/browser risk surfaces | Viable if ISA governance wraps all privileged surfaces by default |
| Composable knowledge pipelines | Strong fit via automation/gateway/protocols | High upside with moderate integration effort |
| Automation governance | Strong fit but high misconfiguration risk | Requires policy engine + audit-first deployment pattern |
| Human-in-the-loop policies | Native support possible via approvals/elevated controls | Must be mandatory for risky classes, not optional |
| Formal verification posture | Formal security model docs exist but not sufficient alone | Needs ISA-specific invariants and enforceable policy tests |
