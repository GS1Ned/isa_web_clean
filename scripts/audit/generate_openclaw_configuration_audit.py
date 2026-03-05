from __future__ import annotations

import json
import os
import re
import subprocess
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SECRET_KEY_RE = re.compile(
    r"(token|secret|key|password|credential|private|publickey|apikey|oauth)",
    re.IGNORECASE,
)


REPO_CONFIG_FILES = [
    ".openclaw/control-plane.json",
    "config/governance/openclaw_policy_envelope.json",
    "config/openclaw/browser.policy.json",
    "config/openclaw/exec-lane.policy.json",
    "config/openclaw/model-routing.policy.json",
    "config/openclaw/skills-allowlist.json",
    ".openclaw/launcher/last_model_route.json",
]

VM_JSON_FILES = [
    "/root/.openclaw/openclaw.json",
    "/root/.openclaw/exec-approvals.json",
    "/root/.openclaw/agents/main/agent/auth-profiles.json",
    "/root/.openclaw/cron/jobs.json",
    "/root/.openclaw/devices/paired.json",
    "/root/.openclaw/devices/pending.json",
    "/root/.openclaw/identity/device.json",
]
VM_SSH_WRAPPER = Path.cwd() / "scripts" / "vm" / "isa_vm_ssh.sh"


@dataclass(frozen=True)
class CliCapture:
    command: str
    output: str


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def canonical_dump(value: Any) -> str:
    return json.dumps(value, ensure_ascii=True, indent=2, sort_keys=True) + "\n"


def load_dotenv(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        env[key] = value
    return env


def run(argv: list[str], cwd: Path | None = None, check: bool = True) -> str:
    completed = subprocess.run(
        argv,
        cwd=cwd,
        check=check,
        text=True,
        capture_output=True,
    )
    return completed.stdout


def ssh_run(vm_host: str, command: str, allow_failure: bool = False, retries: int = 3) -> str:
    last_error: subprocess.CalledProcessError | None = None
    for _ in range(retries):
        try:
            completed = subprocess.run(
                [
                    str(VM_SSH_WRAPPER),
                    "exec",
                    "--quiet",
                    "--host",
                    vm_host,
                    "--command",
                    command,
                ],
                cwd=Path.cwd(),
                check=not allow_failure,
                text=True,
                capture_output=True,
            )
            return completed.stdout
        except subprocess.CalledProcessError as error:
            last_error = error
    if allow_failure and last_error is not None:
        return (last_error.stdout or "") + (last_error.stderr or "")
    if last_error is not None:
        raise last_error
    raise RuntimeError("ssh_run failed without captured error")


def ssh_cat(vm_host: str, path: str) -> str:
    return ssh_run(vm_host, f"cat {json.dumps(path)}")


def sensitive_key(key: str) -> bool:
    return bool(SECRET_KEY_RE.search(key))


def redact_value(value: Any, inherited_sensitive: bool = False, key: str = "") -> Any:
    current_sensitive = inherited_sensitive or sensitive_key(key)
    if isinstance(value, dict):
        output: dict[str, Any] = {}
        for child_key, child_value in value.items():
            output[child_key] = redact_value(
                child_value,
                inherited_sensitive=current_sensitive,
                key=child_key,
            )
        return output
    if isinstance(value, list):
        return [
            redact_value(item, inherited_sensitive=current_sensitive, key=key)
            for item in value
        ]
    if current_sensitive:
        return "***REDACTED***" if value not in (None, "", False, 0) else value
    return value


def parse_env_redacted(raw_text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in raw_text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        result[key] = "***REDACTED***" if value else ""
    return result


def flatten_fields(source_name: str, value: Any, prefix: str = "") -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if isinstance(value, dict):
        for key in sorted(value):
            child_prefix = f"{prefix}.{key}" if prefix else key
            rows.extend(flatten_fields(source_name, value[key], child_prefix))
        return rows
    if isinstance(value, list):
        for index, item in enumerate(value):
            child_prefix = f"{prefix}[{index}]"
            rows.extend(flatten_fields(source_name, item, child_prefix))
        if not value:
            rows.append(
                {
                    "source": source_name,
                    "path": prefix,
                    "type": "list",
                    "value": [],
                }
            )
        return rows
    rows.append(
        {
            "source": source_name,
            "path": prefix,
            "type": type(value).__name__,
            "value": value,
        }
    )
    return rows


def parse_status_summary(status_text: str, models_text: str, skills_text: str, plugins_text: str, hooks_text: str) -> dict[str, Any]:
    summary: dict[str, Any] = {}
    default_match = re.search(r"Sessions\s+│\s+\d+ active · default ([^·]+) \(", status_text)
    if default_match:
        summary["runtime_default_model"] = default_match.group(1).strip()
    runtime_match = re.search(r"Runtime:\s+running \(pid ([0-9]+)", status_text)
    if runtime_match:
        summary["gateway_pid"] = int(runtime_match.group(1))
    listening_match = re.search(r"Listening:\s+([0-9.:]+)", status_text)
    if listening_match:
        summary["listening"] = listening_match.group(1)
    dashboard_match = re.search(r"Dashboard\s+│\s+(http[^\s]+)", status_text)
    if dashboard_match:
        summary["dashboard"] = dashboard_match.group(1)
    warn_match = re.search(r"Summary:\s+([^\n]+)", status_text)
    if warn_match:
        summary["security_audit_summary"] = warn_match.group(1).strip()
    skills_match = re.search(r"Skills \((\d+)/(\d+) ready\)", skills_text)
    if skills_match:
        summary["skills_ready"] = int(skills_match.group(1))
        summary["skills_total"] = int(skills_match.group(2))
    plugins_match = re.search(r"Plugins \((\d+)/(\d+) loaded\)", plugins_text)
    if plugins_match:
        summary["plugins_loaded"] = int(plugins_match.group(1))
        summary["plugins_total"] = int(plugins_match.group(2))
    hooks_match = re.search(r"Hooks \((\d+)/(\d+) ready\)", hooks_text)
    if hooks_match:
        summary["hooks_ready"] = int(hooks_match.group(1))
        summary["hooks_total"] = int(hooks_match.group(2))
    models_default_match = re.search(r"Default\s+:\s+([^\n]+)", models_text)
    if models_default_match:
        summary["models_status_default"] = models_default_match.group(1).strip()
    fallbacks_match = re.search(r"Fallbacks \((\d+)\)\s+:\s+([^\n]+)", models_text)
    if fallbacks_match:
        summary["fallback_count"] = int(fallbacks_match.group(1))
        summary["fallbacks"] = fallbacks_match.group(2).strip()
    return summary


def sanitize_cli_text(text: str) -> str:
    sanitized = text
    sanitized = re.sub(r"(effective=env:)[^ |\n]+", r"\1***REDACTED***", sanitized)
    sanitized = re.sub(r"(env=)[^ |\n]+", r"\1***REDACTED***", sanitized)
    sanitized = re.sub(r"sk-or-v1\.{3}[A-Za-z0-9_-]+", "sk-or-v1...***REDACTED***", sanitized)
    sanitized = re.sub(r"github_[A-Za-z0-9_-]*\.{3}[A-Za-z0-9_-]+", "github_...***REDACTED***", sanitized)
    return sanitized


def build_markdown_report(
    generated_at: str,
    repo_root: Path,
    audit_dir: Path,
    snapshot_path: Path,
    inventory_path: Path,
    status_summary: dict[str, Any],
    sources: dict[str, Any],
    cli_outputs: dict[str, CliCapture],
) -> str:
    lines: list[str] = []
    lines.append("# OpenClaw Configuration Audit")
    lines.append("")
    lines.append(f"- Generated at: `{generated_at}`")
    lines.append(f"- Repo root: `{repo_root}`")
    lines.append(f"- Audit dir: `{audit_dir}`")
    lines.append(f"- Snapshot: `{snapshot_path}`")
    lines.append(f"- Field inventory: `{inventory_path}`")
    lines.append("")
    lines.append("## FACT")
    lines.append("")
    lines.append("- Active runtime target is the VM-backed OpenClaw gateway.")
    lines.append(f"- Runtime default model: `{status_summary.get('runtime_default_model', 'unknown')}`")
    lines.append(f"- Gateway listen address: `{status_summary.get('listening', 'unknown')}`")
    lines.append(f"- Skills ready: `{status_summary.get('skills_ready', 'unknown')}` / `{status_summary.get('skills_total', 'unknown')}`")
    lines.append(f"- Plugins loaded: `{status_summary.get('plugins_loaded', 'unknown')}` / `{status_summary.get('plugins_total', 'unknown')}`")
    lines.append(f"- Hooks ready: `{status_summary.get('hooks_ready', 'unknown')}` / `{status_summary.get('hooks_total', 'unknown')}`")
    lines.append(f"- Security audit summary: `{status_summary.get('security_audit_summary', 'unknown')}`")
    lines.append("")
    lines.append("## INTERPRETATION")
    lines.append("")
    lines.append("- The tracked repo config is authoritative; `/root/.openclaw/openclaw.json` on the VM is the runtime materialization path.")
    lines.append("- The repository-level `.openclaw/control-plane.json` and `config/openclaw/*.json` files add governance and routing policy, but they do not replace the VM runtime file.")
    lines.append("- Host-local config is minimal; the host currently contributes an OpenRouter environment export and desktop/launcher behavior rather than the primary runtime state.")
    lines.append("")
    lines.append("## RECOMMENDATION")
    lines.append("")
    lines.append("- Use the redacted snapshot JSON when you want the full nested configuration view.")
    lines.append("- Use the field inventory JSON when you want every field path independently searchable.")
    lines.append("- Review the CLI appendices when you need actual activation state beyond static files.")
    lines.append("")
    lines.append("## Source Inventory")
    lines.append("")
    for source_name in sorted(sources):
        source_value = sources[source_name]
        if isinstance(source_value, dict):
            lines.append(f"- `{source_name}`: `{len(flatten_fields(source_name, source_value))}` fields")
        else:
            lines.append(f"- `{source_name}`")
    lines.append("")
    lines.append("## CLI Appendices")
    lines.append("")
    for key in ["vm_status_deep", "vm_models_status", "vm_skills_list", "vm_plugins_list", "vm_hooks_list"]:
        capture = cli_outputs[key]
        lines.append(f"### `{capture.command}`")
        lines.append("")
        lines.append("```text")
        lines.append(capture.output.rstrip())
        lines.append("```")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    repo_root = Path.cwd()
    generated_at = utc_now()
    audit_dir = repo_root / ".openclaw" / "audit" / generated_at.replace(":", "").replace("-", "")
    audit_dir.mkdir(parents=True, exist_ok=True)

    env_file = load_dotenv(repo_root / ".env")
    vm_host = env_file.get("VM_SSH_HOST") or env_file.get("ISA_VM_HOST")
    if not vm_host:
        raise SystemExit("STOP=missing_vm_host")

    sources: dict[str, Any] = {}

    host_env_path = Path.home() / ".openclaw" / "env.sh"
    if host_env_path.exists():
        sources["host:~/.openclaw/env.sh"] = parse_env_redacted(host_env_path.read_text(encoding="utf-8"))

    for rel_path in REPO_CONFIG_FILES:
        path = repo_root / rel_path
        if path.exists():
            sources[f"repo:{rel_path}"] = redact_value(json.loads(path.read_text(encoding="utf-8")))

    for vm_path in VM_JSON_FILES:
        try:
            raw = ssh_cat(vm_host, vm_path)
        except subprocess.CalledProcessError:
            continue
        sources[f"vm:{vm_path}"] = redact_value(json.loads(raw))

    try:
        vm_env_raw = ssh_cat(vm_host, "/root/.openclaw/.env")
        sources["vm:/root/.openclaw/.env"] = parse_env_redacted(vm_env_raw)
    except subprocess.CalledProcessError:
        pass

    cli_outputs = {
        "vm_status_deep": CliCapture(
            command="bash scripts/openclaw-status.sh --deep --target vm",
            output=sanitize_cli_text(run(["bash", "scripts/openclaw-status.sh", "--deep", "--target", "vm"], cwd=repo_root, check=False)),
        ),
        "vm_models_status": CliCapture(
            command="openclaw models status",
            output=sanitize_cli_text(ssh_run(vm_host, "openclaw models status", allow_failure=True)),
        ),
        "vm_skills_list": CliCapture(
            command="openclaw skills list",
            output=sanitize_cli_text(ssh_run(vm_host, "openclaw skills list", allow_failure=True)),
        ),
        "vm_plugins_list": CliCapture(
            command="openclaw plugins list",
            output=sanitize_cli_text(ssh_run(vm_host, "openclaw plugins list", allow_failure=True)),
        ),
        "vm_hooks_list": CliCapture(
            command="openclaw hooks list",
            output=sanitize_cli_text(ssh_run(vm_host, "openclaw hooks list", allow_failure=True)),
        ),
    }

    status_summary = parse_status_summary(
        cli_outputs["vm_status_deep"].output,
        cli_outputs["vm_models_status"].output,
        cli_outputs["vm_skills_list"].output,
        cli_outputs["vm_plugins_list"].output,
        cli_outputs["vm_hooks_list"].output,
    )

    snapshot = {
        "_meta": {
            "generated_at": generated_at,
            "repo_root": str(repo_root),
            "vm_host": vm_host,
        },
        "cli_status_summary": status_summary,
        "sources": sources,
    }

    inventory: list[dict[str, Any]] = []
    for source_name in sorted(sources):
        inventory.extend(flatten_fields(source_name, sources[source_name]))

    snapshot_path = audit_dir / "OPENCLAW_CONFIGURATION_SNAPSHOT.redacted.json"
    inventory_path = audit_dir / "OPENCLAW_CONFIGURATION_FIELD_INVENTORY.redacted.json"
    report_path = audit_dir / "OPENCLAW_CONFIGURATION_AUDIT.md"

    snapshot_path.write_text(canonical_dump(snapshot), encoding="utf-8")
    inventory_path.write_text(canonical_dump(inventory), encoding="utf-8")
    report_path.write_text(
        build_markdown_report(
            generated_at=generated_at,
            repo_root=repo_root,
            audit_dir=audit_dir,
            snapshot_path=snapshot_path,
            inventory_path=inventory_path,
            status_summary=status_summary,
            sources=sources,
            cli_outputs=cli_outputs,
        ),
        encoding="utf-8",
    )

    print(f"DONE=openclaw_configuration_audit_generated dir={audit_dir}")


if __name__ == "__main__":
    main()
