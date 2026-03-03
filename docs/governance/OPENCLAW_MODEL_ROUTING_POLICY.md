# OpenClaw Model Routing Policy

Status: CANONICAL

## Purpose
This policy defines the ISA-recommended model selection map for OpenClaw UI sessions that run through OpenRouter.

## Scope
- Applies to ISA development sessions launched through the OpenClaw UI.
- Applies to manual model choice and future router automation.
- Does not override OpenClaw runtime safety controls, sandbox policy, or exec/browser policy.

## Canonical Artifact
- Policy file: `config/openclaw/model-routing.policy.json`

## Current Operating Mode
- Current status: operational assisted routing.
- OpenClaw itself still does not inspect prompt semantics and auto-switch models.
- ISA makes routing operational through a deterministic helper:
  - `scripts/openclaw-model-route.sh`
- The helper reads the canonical policy, classifies the task, and returns the exact alias to select in the UI.

## Current Defaults
- Operational default route: `ISA Dev Balanced (DeepSeek V3.2)`
- Runtime pinned compatibility model: `openrouter/deepseek/deepseek-v3.2`
- Runtime fallback model: `openrouter/minimax/minimax-m2.5`
- Fast launcher default route: `ISA Fast 1M (Gemini 2.5 Flash Lite)`
- UI quick reference: `docs/agent/OPENCLAW_UI_MODEL_QUICK_REFERENCE.md`

## Route Summary

| Route ID | Alias | Use When | Avoid When |
|---|---|---|---|
| `general_governed_tooling` | `ISA Dev Balanced (DeepSeek V3.2)` | Routine ISA engineering, governed tool use, balanced coding work | Very long-context, strongly agentic, or premium-quality tasks |
| `fast_interactive_turns` | `ISA Fast 1M (Gemini 2.5 Flash Lite)` | Rapid chat, triage, lightweight fast sessions | Final-pass quality work or tool-heavy long tasks |
| `agentic_coding_multimodal` | `ISA Fixed Default (Kimi K2.5)` | Agentic coding, multimodal coding, autonomous multi-step workflows | Routine cost-sensitive work or short turns |
| `premium_coding_quality` | `ISA Premium Coding (Claude Sonnet 4)` | Careful code review, hard refactors, final quality passes | Speed-first chat or repetitive low-cost work |
| `premium_multimodal_documents` | `ISA Long Context Quality (Gemini 2.5 Flash)` | PDF/document-heavy or multimodal reasoning with better quality than the fast lane | Routine text-only work |
| `long_context_research` | `ISA Tool Fast 2M (Grok 4.1 Fast)` | Very large repo/document comparisons and long-context research | Short routine tasks |
| `controlled_productivity_automation` | `ISA Controlled Tool Budget (MiniMax M2.5)` | Spreadsheet/document-heavy constrained automation | Strongly autonomous or deep repo coding tasks |

## Operational Guidance
- Default to `general_governed_tooling` for the normal ISA dev launcher and new routine sessions.
- Use the fast launcher when you want the fastest conversational feel and do not need the strongest coding model by default.
- Keep `agentic_coding_multimodal` available for sessions where autonomous tool choice is the point.
- Run the helper before a new UI session:
  - `bash scripts/openclaw-model-route.sh --task "your task summary"`
- For deterministic scripted flows, use explicit profiles:
  - `bash scripts/openclaw-model-route.sh --profile general_governed_tooling`
  - `bash scripts/openclaw-model-route.sh --profile fast_interactive_turns`
- Prefer the cheapest route that still matches the task’s risk, context, and modality needs.
- Keep launcher aliases aligned with the actual configured VM aliases. Do not emit theoretical aliases that the UI picker cannot select.

## Practical Selection Rules
1. If this is normal ISA repo work, start with DeepSeek.
2. If the session should feel fast and iterative, start with Flash Lite.
3. If the task is truly agentic or multimodal coding, switch to Kimi.
4. If you need higher-confidence code judgment, switch to Claude Sonnet 4.
5. If the task is long-context research, use Grok 4.1 Fast.
6. If the task is multimodal or document-heavy, use Gemini 2.5 Flash.
7. If the task is constrained productivity automation, use MiniMax M2.5.
