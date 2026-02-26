#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_tunnel"

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

if ! command -v ssh >/dev/null 2>&1; then
  echo "STOP=missing_command name=ssh"
  exit 1
fi

if [ -f ".env" ]; then
  ACTION="load_env"
  set -a
  source .env >/dev/null 2>&1 || { echo "STOP=.env_not_sourceable"; exit 1; }
  set +a
fi

VM_HOST="${VM_SSH_HOST:-${ISA_VM_HOST:-}}"
if [ -z "$VM_HOST" ]; then
  echo "STOP=missing_vm_host"
  exit 1
fi

MODE="${1:-up}"
LOCAL_BIND_HOST="${OPENCLAW_TUNNEL_BIND_HOST:-127.0.0.1}"
LOCAL_PORT="${OPENCLAW_TUNNEL_LOCAL_PORT:-18789}"
REMOTE_BIND_HOST="${OPENCLAW_TUNNEL_REMOTE_HOST:-127.0.0.1}"
REMOTE_PORT="${OPENCLAW_GATEWAY_PORT:-18789}"
SOCKET_PATH="${OPENCLAW_TUNNEL_SOCKET:-/tmp/isa_openclaw_tunnel.sock}"

ssh_check() {
  ssh -S "$SOCKET_PATH" -O check "$VM_HOST" >/dev/null 2>&1
}

port_listening() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -n -iTCP@"${LOCAL_BIND_HOST}:${LOCAL_PORT}" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 1
  fi
}

case "$MODE" in
  up)
    ACTION="tunnel_up"
    if ssh_check; then
      echo "READY=tunnel_already_up host=${VM_HOST} local=${LOCAL_BIND_HOST}:${LOCAL_PORT} remote=${REMOTE_BIND_HOST}:${REMOTE_PORT}"
      echo "DONE=openclaw_tunnel_up"
      exit 0
    fi

    trap - ERR
    set +e
    ssh -fN -M -S "$SOCKET_PATH" \
      -o BatchMode=yes \
      -o ExitOnForwardFailure=yes \
      -o StrictHostKeyChecking=accept-new \
      -L "${LOCAL_BIND_HOST}:${LOCAL_PORT}:${REMOTE_BIND_HOST}:${REMOTE_PORT}" \
      "$VM_HOST"
    SSH_EXIT="$?"
    set -e
    trap on_err ERR

    if ssh_check; then
      echo "READY=tunnel_up host=${VM_HOST} local=${LOCAL_BIND_HOST}:${LOCAL_PORT} remote=${REMOTE_BIND_HOST}:${REMOTE_PORT}"
      echo "DONE=openclaw_tunnel_up"
    elif [ "$SSH_EXIT" -ne 0 ] && port_listening; then
      echo "READY=tunnel_port_already_in_use local=${LOCAL_BIND_HOST}:${LOCAL_PORT}"
      echo "DONE=openclaw_tunnel_up"
    else
      echo "STOP=tunnel_failed_to_start"
      exit 1
    fi
    ;;
  status)
    ACTION="tunnel_status"
    if ssh_check || port_listening; then
      echo "READY=tunnel_up host=${VM_HOST} local=${LOCAL_BIND_HOST}:${LOCAL_PORT} remote=${REMOTE_BIND_HOST}:${REMOTE_PORT}"
      echo "DONE=openclaw_tunnel_status"
    else
      echo "STOP=tunnel_not_running"
      exit 1
    fi
    ;;
  down)
    ACTION="tunnel_down"
    if ssh_check; then
      ssh -S "$SOCKET_PATH" -O exit "$VM_HOST" >/dev/null 2>&1 || true
      rm -f "$SOCKET_PATH" || true
      echo "DONE=openclaw_tunnel_down"
    else
      echo "READY=tunnel_already_down"
      echo "DONE=openclaw_tunnel_down"
    fi
    ;;
  *)
    echo "STOP=usage openclaw-tunnel.sh [up|status|down]"
    exit 1
    ;;
esac
