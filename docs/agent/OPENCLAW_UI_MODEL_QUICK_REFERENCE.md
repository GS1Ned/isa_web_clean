# OpenClaw UI Model Quick Reference
Status: CANONICAL

## Operational Default
- Use `ISA Dev Balanced (DeepSeek V3.2)` as the normal launcher and runtime-aligned default.
- Model id: `openrouter/deepseek/deepseek-v3.2`
- Fallback model: `openrouter/minimax/minimax-m2.5`
- Reason: best balance for routine ISA text-plus-tool work without paying the latency cost of Kimi by default.

## Fast Launcher
- `OpenClaw ISA Dev (Fast).app` should prefer `ISA Fast 1M (Gemini 2.5 Flash Lite)` when you start without a task summary.
- Model id: `openrouter/google/gemini-2.5-flash-lite`
- Use it for rapid iteration, triage, and chat-first sessions.
- Switch away when the session becomes tool-heavy or quality-sensitive.

## Route Before You Start
- Run `bash scripts/openclaw-model-route.sh --task "your task summary" --clipboard` and use the returned alias in the OpenClaw UI model picker.
- If you already know the task class, run `bash scripts/openclaw-model-route.sh --profile <route_id>`.
- To reuse the previous launcher choice without a new prompt:
  - CLI launcher: `~/.local/bin/openclaw-ui-dev-launcher-fast.sh --use-last-route`
  - Env toggle for app/automation: `OPENCLAW_LAUNCHER_USE_LAST_ROUTE=1`

## Route Map
- `ISA Dev Balanced (DeepSeek V3.2)`
  - Best for: normal coding, implementation, extraction, governed tool use.
  - Better option exists when: you need huge context, premium multimodal reasoning, or stronger agentic coding behavior.
- `ISA Fast 1M (Gemini 2.5 Flash Lite)`
  - Best for: short chat turns, fast iteration, quick triage, lightweight sessions.
  - Better option exists when: the task becomes tool-heavy, quality-sensitive, or highly autonomous.
- `ISA Fixed Default (Kimi K2.5)`
  - Best for: agentic coding, multimodal coding, autonomous multi-step tool workflows.
  - Better option exists when: you want a cheaper or faster default and the task is not strongly agentic.
- `ISA Premium Coding (Claude Sonnet 4)`
  - Best for: careful code review, hard debugging, difficult refactors, final quality passes.
  - Better option exists when: latency matters more than careful final quality.
- `ISA Long Context Quality (Gemini 2.5 Flash)`
  - Best for: PDFs, multimodal inputs, larger document reasoning, quality-focused context work.
  - Better option exists when: the task is routine, text-only, or strongly speed-sensitive.
- `ISA Tool Fast 2M (Grok 4.1 Fast)`
  - Best for: very large repo or multi-document context, research, broad comparisons.
  - Better option exists when: DeepSeek already fits and cost matters more.
- `ISA Controlled Tool Budget (MiniMax M2.5)`
  - Best for: office-style workflows, constrained automation, spreadsheet/document tool paths.
  - Better option exists when: the task is mostly repository coding or needs stronger autonomy.

## Runtime Note
- The route helper is only useful if it emits aliases that really exist in the current VM model picker.
- Runtime default and launcher default should stay aligned unless you deliberately want the launcher to bias toward a different model family.

## Canonical Policy
- Routing policy: `config/openclaw/model-routing.policy.json`
- Governance runbook: `docs/governance/OPENCLAW_MODEL_ROUTING_POLICY.md`
- Route helper: `scripts/openclaw-model-route.sh`
