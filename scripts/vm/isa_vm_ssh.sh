#!/usr/bin/env bash
set -euo pipefail

SUBCOMMAND="${1:-}"
if [ $# -gt 0 ]; then
  shift
fi

VM_HOST="${ISA_VM_HOST:-${VM_SSH_HOST:-isa-openclaw-vm}}"
FORWARD_AGENT=0
STDIN_FILE=""
CONNECT_TIMEOUT="${ISA_VM_SSH_CONNECT_TIMEOUT:-10}"
RETRIES="${ISA_VM_SSH_RETRIES:-3}"
BACKOFF_BASE="${ISA_VM_SSH_BACKOFF_BASE:-1}"
QUIET=0
COMMAND=""
SOCKET_PATH=""
LOCAL_FORWARD=""

usage() {
  cat <<'EOF'
Usage:
  isa_vm_ssh.sh exec [--command '<cmd>'] [--stdin-file <path>] [--forward-agent] [--quiet]
  isa_vm_ssh.sh master-check --socket <path> [--quiet]
  isa_vm_ssh.sh master-exit --socket <path> [--quiet]
  isa_vm_ssh.sh tunnel-up --socket <path> --local-forward <bind:local:remote:port> [--quiet]
EOF
}

log_ready() {
  if [ "$QUIET" -ne 1 ]; then
    echo "$1"
  fi
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --host)
      VM_HOST="${2:-}"
      shift 2
      ;;
    --command)
      COMMAND="${2:-}"
      shift 2
      ;;
    --stdin-file)
      STDIN_FILE="${2:-}"
      shift 2
      ;;
    --forward-agent)
      FORWARD_AGENT=1
      shift
      ;;
    --connect-timeout)
      CONNECT_TIMEOUT="${2:-}"
      shift 2
      ;;
    --retries)
      RETRIES="${2:-}"
      shift 2
      ;;
    --backoff-base)
      BACKOFF_BASE="${2:-}"
      shift 2
      ;;
    --socket)
      SOCKET_PATH="${2:-}"
      shift 2
      ;;
    --local-forward)
      LOCAL_FORWARD="${2:-}"
      shift 2
      ;;
    --quiet)
      QUIET=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      echo "STOP=usage_unknown_arg arg=$1"
      usage >&2
      exit 1
      ;;
  esac
done

if [ -z "$SUBCOMMAND" ]; then
  echo "STOP=usage_missing_subcommand"
  usage >&2
  exit 1
fi

if [ -z "$VM_HOST" ]; then
  echo "STOP=missing_vm_host"
  exit 1
fi

SSH_BASE=(ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout="$CONNECT_TIMEOUT" -o ServerAliveInterval=15 -o ServerAliveCountMax=3)
if [ "$FORWARD_AGENT" -eq 1 ]; then
  SSH_BASE=(-A "${SSH_BASE[@]}")
fi

emit_filtered_ssh_stderr() {
  local stderr_file="$1"
  [ -s "$stderr_file" ] || return 0

  if grep -Ev '^(Connection closed by .+ port [0-9]+|Shared connection to .+ closed\.|Connection to .+ closed\.)$' "$stderr_file" >&2; then
    return 0
  fi
}

retry_exec() {
  local attempt rc
  local backoff="$BACKOFF_BASE"
  local stderr_file
  attempt=1
  stderr_file="$(mktemp /tmp/isa_vm_ssh.stderr.XXXXXX)"
  trap 'rm -f "$stderr_file"' RETURN
  while :; do
    set +e
    if [ -n "$STDIN_FILE" ]; then
      "${SSH_BASE[@]}" -T "$@" < "$STDIN_FILE" 2>"$stderr_file"
    else
      "${SSH_BASE[@]}" -T "$@" 2>"$stderr_file"
    fi
    rc=$?
    set -e
    if [ "$rc" -eq 0 ]; then
      emit_filtered_ssh_stderr "$stderr_file"
      return 0
    fi
    if [ "$attempt" -ge "$RETRIES" ]; then
      cat "$stderr_file" >&2
      return "$rc"
    fi
    : > "$stderr_file"
    sleep "$backoff"
    backoff=$((backoff * 2))
    attempt=$((attempt + 1))
  done
}

case "$SUBCOMMAND" in
  exec)
    if [ -z "$COMMAND" ]; then
      echo "STOP=usage_missing_command"
      exit 1
    fi
    if [ -n "$STDIN_FILE" ] && [ ! -f "$STDIN_FILE" ]; then
      echo "STOP=stdin_file_missing path=$STDIN_FILE"
      exit 1
    fi
    log_ready "READY=isa_vm_ssh_exec host=$VM_HOST"
    if retry_exec "$VM_HOST" "$COMMAND"; then
      log_ready "DONE=isa_vm_ssh_exec_complete"
      exit 0
    else
      rc=$?
      echo "STOP=vm_ssh_exec_failed host=$VM_HOST exit=$rc"
      exit "$rc"
    fi
    ;;
  master-check)
    if [ -z "$SOCKET_PATH" ]; then
      echo "STOP=usage_missing_socket"
      exit 1
    fi
    if ssh -S "$SOCKET_PATH" -O check "$VM_HOST" >/dev/null 2>&1; then
      log_ready "DONE=isa_vm_ssh_master_check status=up"
      exit 0
    fi
    echo "STOP=vm_ssh_master_not_running socket=$SOCKET_PATH"
    exit 1
    ;;
  master-exit)
    if [ -z "$SOCKET_PATH" ]; then
      echo "STOP=usage_missing_socket"
      exit 1
    fi
    if ssh -S "$SOCKET_PATH" -O exit "$VM_HOST" >/dev/null 2>&1; then
      log_ready "DONE=isa_vm_ssh_master_exit"
      exit 0
    fi
    echo "STOP=vm_ssh_master_exit_failed socket=$SOCKET_PATH"
    exit 1
    ;;
  tunnel-up)
    if [ -z "$SOCKET_PATH" ] || [ -z "$LOCAL_FORWARD" ]; then
      echo "STOP=usage_missing_tunnel_args"
      exit 1
    fi
    log_ready "READY=isa_vm_ssh_tunnel_up host=$VM_HOST local_forward=$LOCAL_FORWARD"
    local_stderr_file="$(mktemp /tmp/isa_vm_ssh.stderr.XXXXXX)"
    set +e
    "${SSH_BASE[@]}" -fN -M -S "$SOCKET_PATH" -o ExitOnForwardFailure=yes -L "$LOCAL_FORWARD" "$VM_HOST" 2>"$local_stderr_file"
    rc=$?
    set -e
    if [ "$rc" -eq 0 ]; then
      emit_filtered_ssh_stderr "$local_stderr_file"
      rm -f "$local_stderr_file"
      log_ready "DONE=isa_vm_ssh_tunnel_up"
      exit 0
    fi
    cat "$local_stderr_file" >&2
    rm -f "$local_stderr_file"
    echo "STOP=vm_ssh_tunnel_failed host=$VM_HOST exit=$rc"
    exit "$rc"
    ;;
  *)
    echo "STOP=usage_invalid_subcommand subcommand=$SUBCOMMAND"
    usage >&2
    exit 1
    ;;
esac
