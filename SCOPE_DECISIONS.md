# IRON Protocol: Scope Decisions

**Version:** 1.0.0  
**Status:** ✅ Active and Binding  
**Last Updated:** 2026-01-27

---

## Purpose

This document is the **canonical registry of scope decisions** for the ISA repository. It exists to:

1.  Make scope decisions **explicit and persistent**
2.  Prevent repeated reconsideration of the same scope changes
3.  Provide a clear, auditable trail of how the repository is structured

---

## Process

1.  The `iron-inventory.sh` script detects unknown scope and flags it.
2.  The developer/agent must make an explicit decision: **IN**, **OUT**, or **IGNORE**.
3.  That decision is recorded in this file.
4.  The `iron-inventory.sh` script is updated to reflect the decision.

Once a decision is recorded here, it is considered **final** unless explicitly revisited.

---

## Scope Decisions

| Path / Pattern | Decision | Justification | Date |
|---|---|---|---|
| `isa.inventory.json` | **IN** | Canonical inventory file, part of the protocol. | 2026-01-27 |
| `node_modules/` | **OUT** | Generated dependencies, not source code. | 2026-01-27 |
| `.git/` | **OUT** | Version control metadata, not source code. | 2026-01-27 |
| `dist/` | **OUT** | Build output, not source code. | 2026-01-27 |
| `build/` | **OUT** | Build output, not source code. | 2026-01-27 |
| `.next/` | **OUT** | Build output, not source code. | 2026-01-27 |
| `*.xlsx` | **OUT** | Binary data, not source code. | 2026-01-27 |
| `*.zip` | **OUT** | Binary data, not source code. | 2026-01-27 |
| `Archive/` | **OUT** | Deprecated or historical content. | 2026-01-27 |
| `.DS_Store` | **OUT** | macOS specific metadata. | 2026-01-27 |
