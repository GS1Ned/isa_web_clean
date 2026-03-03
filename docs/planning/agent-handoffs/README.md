# Agent Handoffs

This directory stores machine-readable handoff artifacts generated from the ISA agent routing matrix.

Canonical references:
- `config/agent-platform/task-routing.matrix.json`
- `config/agent-platform/handoff.contract.json`
- `docs/governance/ISA_AGENT_HANDOFF_PROTOCOL.md`

Use:
- `bash scripts/dev/resolve-agent-task-routing.sh --task-class <task_class>`
- `bash scripts/dev/create-agent-handoff.sh --task-class <task_class> --title "<title>" --issue <n> --branch <name> --summary "<summary>"`
