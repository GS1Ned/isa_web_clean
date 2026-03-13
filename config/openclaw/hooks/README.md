# OpenClaw Hook Wiring for ISA Autonomy

This repo exposes two intended integration surfaces for external schedulers or webhook relays:

- `POST /hooks/wake`
- `POST /hooks/agent`

These are repo-local integration contracts. They are not claimed to be native OpenClaw HTTP endpoints unless your own gateway or reverse proxy explicitly wires them.

## Purpose
- `/hooks/wake`: trigger the lightweight autonomy runner.
- `/hooks/agent`: trigger a targeted agent task with a supplied prompt or reason.

## Secret Handling
Use a separate hook secret such as `CRON_SECRET`. Do not hardcode it into repo files.

## Example: wake hook
```bash
curl -X POST "https://YOUR-HOST/hooks/wake" \
  -H "Content-Type: application/json" \
  -H "X-CRON-SECRET: ${CRON_SECRET}" \
  -d '{"reason":"hourly-reflect"}'
```

Suggested handler action:
```bash
bash scripts/openclaw-isa-autonomy.sh
```

## Example: agent hook
```bash
curl -X POST "https://YOUR-HOST/hooks/agent" \
  -H "Content-Type: application/json" \
  -H "X-CRON-SECRET: ${CRON_SECRET}" \
  -d '{"task":"Review recent WAL failures and propose the next safe automation step."}'
```

Suggested handler action:
```bash
openclaw agent --message "Review recent WAL failures and propose the next safe automation step."
```

## VM-Only OpenClaw
If `.env.example` indicates `OPENCLAW_RUNTIME_MODE=vm_only`, run the hook receiver on the host and forward runtime actions through:

```bash
bash scripts/vm/isa_vm_ssh.sh exec --command 'openclaw status --deep'
```

## Recommended Wiring
- External scheduler -> your hook receiver -> repo script
- `wake` -> `scripts/openclaw-isa-autonomy.sh`
- `agent` -> `openclaw agent ...` or a wrapper that resolves model/skill routes first
