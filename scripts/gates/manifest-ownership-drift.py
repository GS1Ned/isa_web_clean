#!/usr/bin/env python3
"""Manifest ownership drift gate.

Checks:
1) Every top-level router surface in server/routers.ts has an owner in CAPABILITY_MANIFEST.
2) Every runtime table declaration name in drizzle schema files (`mysqlTable(...)` and `pgTable(...)`) has an owner in CAPABILITY_MANIFEST.
3) No router/table ownership is assigned to multiple owners in manifest registry.
"""

from __future__ import annotations

import glob
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
ROUTERS_PATH = REPO_ROOT / "server/routers.ts"
MANIFEST_PATH = REPO_ROOT / "docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json"
SCHEMA_GLOBS = [
    str(REPO_ROOT / "drizzle/schema*.ts"),
    str(REPO_ROOT / "drizzle_pg/**/*.ts"),
]

ROUTER_KEY_RE = re.compile(r"^  ([A-Za-z_][A-Za-z0-9_]*)\s*:")
TABLE_RE = re.compile(r"(?:mysqlTable|pgTable)\(\s*['\"]([A-Za-z0-9_]+)['\"]\s*,")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_router_surfaces(path: Path) -> set[str]:
    text = read_text(path)
    return {
        match.group(1)
        for line in text.splitlines()
        if (match := ROUTER_KEY_RE.match(line)) is not None
    }


def parse_schema_table_names() -> set[str]:
    table_names: set[str] = set()
    schema_paths: set[str] = set()
    for schema_glob in SCHEMA_GLOBS:
        schema_paths.update(glob.glob(schema_glob, recursive=True))
    for schema_path in sorted(schema_paths):
        text = Path(schema_path).read_text(encoding="utf-8")
        table_names.update(match.group(1) for match in TABLE_RE.finditer(text))
    return table_names


def parse_manifest_ownership(manifest: dict) -> tuple[dict[str, str], dict[str, str], list[str], list[str]]:
    surface_owner: dict[str, str] = {}
    table_owner: dict[str, str] = {}
    duplicate_surfaces: list[str] = []
    duplicate_tables: list[str] = []

    for entry in manifest.get("surface_registry", {}).get("router_surface_ownership", []):
        surface = entry.get("surface")
        owner = entry.get("owner")
        if not surface or not owner:
            continue
        if surface in surface_owner and surface_owner[surface] != owner:
            duplicate_surfaces.append(surface)
            continue
        surface_owner[surface] = owner

    table_ownership_registry = manifest.get("surface_registry", {}).get("table_ownership", {})
    if isinstance(table_ownership_registry, dict):
        for owner, tables in table_ownership_registry.items():
            if not isinstance(tables, list):
                continue
            for table in tables:
                if not isinstance(table, str):
                    continue
                if table in table_owner and table_owner[table] != owner:
                    duplicate_tables.append(table)
                    continue
                table_owner[table] = owner

    # Fallback/consistency: include capability-owned tables if missing in surface_registry.table_ownership
    for capability in manifest.get("capabilities", []):
        owner = capability.get("id")
        if not owner:
            continue
        for table in capability.get("owned_tables", []):
            if not isinstance(table, str):
                continue
            if table in table_owner and table_owner[table] != owner:
                duplicate_tables.append(table)
                continue
            table_owner.setdefault(table, owner)

    shared_platform = manifest.get("shared_platform", {})
    for table in shared_platform.get("owned_tables", []):
        if not isinstance(table, str):
            continue
        if table in table_owner and table_owner[table] != "SHARED_PLATFORM":
            duplicate_tables.append(table)
            continue
        table_owner.setdefault(table, "SHARED_PLATFORM")

    return surface_owner, table_owner, sorted(set(duplicate_surfaces)), sorted(set(duplicate_tables))


def print_compact_list(label: str, items: list[str], limit: int = 30) -> None:
    print(f"{label}: {len(items)}")
    if not items:
        return
    preview = items[:limit]
    for item in preview:
        print(f"  - {item}")
    remaining = len(items) - len(preview)
    if remaining > 0:
        print(f"  ... and {remaining} more")


def main() -> int:
    print("READY=manifest_ownership_drift_start")

    if not ROUTERS_PATH.exists():
        print(f"STOP=missing_router_file:{ROUTERS_PATH}")
        return 1
    if not MANIFEST_PATH.exists():
        print(f"STOP=missing_manifest_file:{MANIFEST_PATH}")
        return 1

    manifest = json.loads(read_text(MANIFEST_PATH))
    runtime_surfaces = parse_router_surfaces(ROUTERS_PATH)
    runtime_tables = parse_schema_table_names()
    surface_owner, table_owner, duplicate_surfaces, duplicate_tables = parse_manifest_ownership(manifest)

    missing_surfaces = sorted(runtime_surfaces - set(surface_owner.keys()))
    missing_tables = sorted(runtime_tables - set(table_owner.keys()))

    status = "pass"
    if missing_surfaces or missing_tables or duplicate_surfaces or duplicate_tables:
        status = "fail"

    print(f"Status: {status}")
    print(f"Runtime router surfaces parsed: {len(runtime_surfaces)}")
    print(f"Runtime table declarations parsed (mysqlTable/pgTable): {len(runtime_tables)}")
    print(f"Manifest surface ownership entries: {len(surface_owner)}")
    print(f"Manifest table ownership entries: {len(table_owner)}")

    print_compact_list("Missing surface owners", missing_surfaces)
    print_compact_list("Missing table owners", missing_tables)
    print_compact_list("Duplicate surface ownership", duplicate_surfaces)
    print_compact_list("Duplicate table ownership", duplicate_tables)

    summary = {
        "status": status,
        "counts": {
            "runtime_router_surfaces": len(runtime_surfaces),
            "runtime_tables": len(runtime_tables),
            "manifest_surface_ownership_entries": len(surface_owner),
            "manifest_table_ownership_entries": len(table_owner),
            "missing_surface_owners": len(missing_surfaces),
            "missing_table_owners": len(missing_tables),
            "duplicate_surface_ownership": len(duplicate_surfaces),
            "duplicate_table_ownership": len(duplicate_tables),
        },
        "missing_surface_owners": missing_surfaces,
        "missing_table_owners": missing_tables,
        "duplicate_surface_ownership": duplicate_surfaces,
        "duplicate_table_ownership": duplicate_tables,
    }
    print(json.dumps(summary, indent=2))

    if status == "fail":
        print("STOP=manifest_ownership_drift_detected")
        return 1

    print("DONE=manifest_ownership_drift_clean")
    return 0


if __name__ == "__main__":
    sys.exit(main())
