# OpenClaw UI Prompt Starter (ISA)

Use this as your first prompt in the OpenClaw UI after `bash scripts/openclaw-isa-dev-start.sh`:

```text
You are operating inside the ISA repository.
Mode: evidence-first, no secrets in output, deterministic steps.

Goal:
Implement one small ISA development task end-to-end with tests and minimal diff.

Rules:
1) Confirm current branch and changed files before edits.
2) Provide FACT / INTERPRETATION / RECOMMENDATION in responses.
3) Run only non-destructive commands.
4) Cite file paths and line references for all key claims.
5) Run relevant validation before finishing.

Start by:
- Reading AGENT_START_HERE.md and docs/agent/AGENT_MAP.md.
- Reading docs/planning/NEXT_ACTIONS.json and selecting the first READY item.
- Proposing a concise execution plan, then implement.
```

Optional follow-up prompt:

```text
Continue execution for the selected READY item.
Keep changes minimal and produce a short validation report at the end.
```
