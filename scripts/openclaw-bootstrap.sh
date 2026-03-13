#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_bootstrap"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

ACTION=""
on_err() {
  local exit_code="$?"
  if [ -n "$ACTION" ]; then
    echo "STOP=failed action=${ACTION} exit=${exit_code}"
  else
    echo "STOP=failed exit=${exit_code}"
  fi
  exit "$exit_code"
}
trap on_err ERR

if ! command -v openclaw >/dev/null 2>&1; then
  echo "STOP=openclaw_cli_missing"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "STOP=missing_command name=python3"
  exit 1
fi

CHECK_ONLY=0
if [ "${1:-}" = "--check-only" ]; then
  CHECK_ONLY=1
  shift
fi
if [ "$#" -gt 0 ]; then
  echo "STOP=usage openclaw-bootstrap.sh [--check-only]"
  exit 1
fi

is_gateway_healthy() {
  local status_output="$1"
  if printf '%s' "$status_output" | grep -Eiq 'not loaded|not installed|not running|inactive|start with:\s*openclaw gateway install'; then
    return 1
  fi
  return 0
}

sanitize_status() {
  sed -E 's@([?#&](token|auth|key|session)=)[^&# ]+@\1***REDACTED***@Ig; s@(/token/)[^/?# ]+@\1***REDACTED***@Ig'
}

ensure_control_ui_allowed_origins() {
  local config_path="${OPENCLAW_CONFIG_PATH:-${HOME}/.openclaw/openclaw.json}"
  local template_path="config/openclaw/openclaw.isa-lab.template.json"
  local gateway_port="${OPENCLAW_GATEWAY_PORT:-18789}"
  local tunnel_port="${OPENCLAW_TUNNEL_LOCAL_PORT:-18789}"
  python3 - "$config_path" "$template_path" "$gateway_port" "$tunnel_port" <<'PY'
import json
import sys
from pathlib import Path

config_path = Path(sys.argv[1]).expanduser()
template_path = Path(sys.argv[2])
ports = []
for raw in sys.argv[3:]:
    value = raw.strip()
    if not value:
        continue
    try:
        port = int(value)
    except ValueError:
        continue
    if 1 <= port <= 65535 and port not in ports:
        ports.append(port)

desired_origins = []
if template_path.exists():
    with template_path.open("r", encoding="utf-8") as handle:
        template = json.load(handle)
    configured_origins = (
        ((template.get("gateway") or {}).get("controlUi") or {}).get("allowedOrigins") or []
    )
    if isinstance(configured_origins, list):
        for value in configured_origins:
            if isinstance(value, str) and value.strip():
                desired_origins.append(value.strip())

if not desired_origins:
    desired_origins = [
        f"http://{host}:{port}"
        for host in ("127.0.0.1", "localhost")
        for port in ports
    ]

config = {}
if config_path.exists():
    with config_path.open("r", encoding="utf-8") as handle:
        config = json.load(handle)

gateway = config.setdefault("gateway", {})
control_ui = gateway.setdefault("controlUi", {})
allowed = control_ui.get("allowedOrigins")
if not isinstance(allowed, list):
    allowed = []

merged = []
seen = set()
for value in allowed:
    if not isinstance(value, str):
        continue
    trimmed = value.strip()
    if not trimmed:
        continue
    lowered = trimmed.lower()
    if lowered in seen:
        continue
    merged.append(trimmed)
    seen.add(lowered)

changed = False
for origin in desired_origins:
    lowered = origin.lower()
    if lowered in seen:
        continue
    merged.append(origin)
    seen.add(lowered)
    changed = True

control_ui["allowedOrigins"] = merged
config_path.parent.mkdir(parents=True, exist_ok=True)
with config_path.open("w", encoding="utf-8") as handle:
    json.dump(config, handle, indent=2)
    handle.write("\n")

status = "updated" if changed else "unchanged"
source = f"template:{template_path}" if template_path.exists() else "fallback:loopback_ports"
print(
    f"READY=control_ui_allowed_origins_{status} path={config_path} count={len(merged)} source={source}"
)
PY
}

if [ -f "scripts/openclaw-config-apply.sh" ]; then
  ACTION="apply_repo_tracked_config"
  bash scripts/openclaw-config-apply.sh --local
else
  ACTION="ensure_control_ui_allowed_origins"
  ensure_control_ui_allowed_origins
fi

ACTION="gateway_status_initial"
INITIAL_STATUS="$(openclaw gateway status 2>&1 || true)"
printf '%s\n' "$INITIAL_STATUS" | sanitize_status

if ! is_gateway_healthy "$INITIAL_STATUS"; then
  if [ "$CHECK_ONLY" -eq 1 ]; then
    echo "STOP=gateway_not_healthy"
    exit 1
  fi

  ACTION="gateway_install"
  openclaw gateway install >/dev/null 2>&1 || true

  ACTION="gateway_start"
  openclaw gateway >/dev/null 2>&1 || true
fi

if [ "${OPENCLAW_REPAIR_ORPHAN_TRANSCRIPTS:-1}" = "1" ] && [ "$CHECK_ONLY" -eq 0 ]; then
  ACTION="orphan_transcript_cleanup"
  if openclaw sessions cleanup --help >/dev/null 2>&1; then
    openclaw sessions cleanup --enforce >/dev/null 2>&1 || true
    echo "READY=orphan_transcript_cleanup_attempted method=sessions_cleanup"
  elif openclaw doctor --help >/dev/null 2>&1; then
    openclaw doctor --non-interactive --repair --yes >/dev/null 2>&1 || true
    echo "READY=orphan_transcript_cleanup_attempted method=doctor_repair"
  else
    echo "READY=orphan_transcript_cleanup_unavailable"
  fi
fi

ACTION="gateway_status_final"
FINAL_STATUS="$(openclaw gateway status 2>&1 || true)"
printf '%s\n' "$FINAL_STATUS" | sanitize_status

if ! is_gateway_healthy "$FINAL_STATUS"; then
  echo "STOP=gateway_not_healthy"
  exit 1
fi

if [ -x "scripts/openclaw-dashboard-url.sh" ]; then
  ACTION="dashboard_url_probe"
  bash scripts/openclaw-dashboard-url.sh >/dev/null 2>&1 || true
fi

echo "READY=openclaw_gateway_healthy"
echo "DONE=openclaw_bootstrap_complete"
