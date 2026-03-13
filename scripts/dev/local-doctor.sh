#!/usr/bin/env bash
set -euo pipefail

# Local "doctor" for first-time setup. Prints only statuses, never secret values.

echo "PREFLIGHT=isa_local_doctor"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

ACTION=""
LAST_LOG=""

on_err() {
  local exit_code="$?"
  # Emit a deterministic STOP marker for blind-paste workflows.
  if [ -n "${ACTION}" ]; then
    echo "STOP=failed action=${ACTION} exit=${exit_code} log=${LAST_LOG:-none}"
  else
    echo "STOP=failed exit=${exit_code}"
  fi
  exit "$exit_code"
}
trap on_err ERR

if ! command -v node >/dev/null 2>&1; then
  echo "STOP=node_missing"
  exit 1
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo "STOP=pnpm_missing"
  exit 1
fi

if [ ! -f ".env" ]; then
  echo "STOP=.env_missing (copy .env.example -> .env)"
  exit 1
fi

# Ensure bash can source .env (quoted multi-line secrets etc.)
set -a
source .env >/dev/null 2>&1 || { echo "STOP=.env_not_sourceable"; exit 1; }
set +a

ACTION="deps"
echo "ACTION=${ACTION}"
LAST_LOG="/tmp/isa_doctor_deps.log"
pnpm install --frozen-lockfile >"$LAST_LOG" 2>&1

ACTION="env_checks"
echo "ACTION=${ACTION}"
LAST_LOG="/tmp/isa_doctor_envcheck.log"
pnpm run env:check >"$LAST_LOG" 2>&1
LAST_LOG="/tmp/isa_doctor_checkenvjs.log"
node scripts/check-env.js >"$LAST_LOG" 2>&1

ACTION="typecheck"
echo "ACTION=${ACTION}"
LAST_LOG="/tmp/isa_doctor_check.log"
pnpm check >"$LAST_LOG" 2>&1

ACTION="unit_tests"
echo "ACTION=${ACTION}"
LAST_LOG="/tmp/isa_doctor_testunit.log"
pnpm test-unit >"$LAST_LOG" 2>&1

ACTION="build"
echo "ACTION=${ACTION}"
LAST_LOG="/tmp/isa_doctor_build.log"
pnpm build >"$LAST_LOG" 2>&1

ACTION="dev_health"
echo "ACTION=${ACTION}"
LOG="/tmp/isa_doctor_dev.log"
PIDFILE="/tmp/isa_doctor_dev.pid"
LAST_LOG="$LOG"
rm -f "$PIDFILE"
( pnpm dev >"$LOG" 2>&1 & echo $! >"$PIDFILE" ) >/dev/null 2>&1
PID="$(cat "$PIDFILE" 2>/dev/null || true)"
if [ -z "$PID" ]; then
  echo "STOP=pnpm_dev_failed_to_start"
  exit 1
fi

PORT_ACTUAL=""
for _ in $(seq 1 90); do
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "STOP=pnpm_dev_exited_early log=$LOG"
    exit 1
  fi
  PORT_ACTUAL="$(rg -o "Server running on http://localhost:[0-9]+/" "$LOG" 2>/dev/null | tail -n 1 | rg -o "[0-9]+" || true)"
  if [ -n "$PORT_ACTUAL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$PORT_ACTUAL" ]; then
  kill "$PID" 2>/dev/null || true
  echo "STOP=could_not_detect_dev_port log=$LOG"
  exit 1
fi

HEALTH_URL="http://localhost:${PORT_ACTUAL}/health"
READY_URL="http://localhost:${PORT_ACTUAL}/ready"

HEALTH_CODE="$(curl -sS -o /tmp/isa_doctor_health.json -w "%{http_code}" "$HEALTH_URL" || true)"
READY_CODE="$(curl -sS -o /tmp/isa_doctor_ready.json -w "%{http_code}" "$READY_URL" || true)"

kill "$PID" 2>/dev/null || true
rm -f "$PIDFILE"

echo "CHECK=health_http STATUS=$HEALTH_CODE url=$HEALTH_URL"
echo "CHECK=ready_http STATUS=$READY_CODE url=$READY_URL"

echo "DONE=isa_local_doctor_complete"
