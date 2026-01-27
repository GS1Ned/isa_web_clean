# The IRON Protocol

**Version:** 1.0.0  
**Status:** ✅ Active and Binding  
**Last Updated:** 2026-01-27

---

## Purpose

The IRON Protocol is the canonical governance system for ISA development. It exists to:

1. **Prevent context loss** across development sessions
2. **Minimize cognitive overhead** for developers and AI agents
3. **Enforce consistency** through automation, not discipline
4. **Make correct execution the path of least resistance**

---

## Core Principles

| Principle | Meaning |
|---|---|
| **Execution over theory** | Governance exists only to improve execution speed, correctness, and cost-efficiency. |
| **Automation over discipline** | If a rule relies on memory or goodwill, it will fail. |
| **Minimal surface area** | Fewer artefacts, fewer rules, fewer exceptions. |
| **Cost awareness** | High-cost reasoning is reserved for high-value decisions. Deterministic work is delegated. |

---

## Canonical Artefacts

The protocol is built on three canonical artefacts:

| Artefact | File | Owner | Purpose |
|---|---|---|---|
| **Inventory** | `isa.inventory.json` | Machine (CI script) | Ground truth of what exists in the repository. |
| **Roadmap** | `ROADMAP.md` | Human (Lead Architect) | Ground truth of what we are building. |
| **Protocol** | `IRON_PROTOCOL.md` | Human (Lead Architect) | Ground truth of how we work. |

### Value Hierarchy

When sources conflict, higher-value data wins:

1. **Authoritative system data** (schema, config, runtime reality)
2. **Governance intent** (IRON Protocol, ROADMAP)
3. **Explanatory documentation**
4. **Ephemeral context** (comments, notes, task history)

---

## Execution Loop

### Before Starting Any Task

Run the context ingestion script:

```bash
./scripts/iron-context.sh
```

This script:
1. Pulls the latest code from `origin/main`
2. Generates a fresh `isa.inventory.json`
3. Displays current ROADMAP priorities
4. Outputs a Context Acknowledgement block for your PR

### During Development

- Work on the current ROADMAP priority
- If the task diverges from the roadmap, pause and escalate
- If unknown scope is detected, classify it explicitly (IN/OUT/IGNORE)

### Before Submitting a PR

1. Copy the Context Acknowledgement block from `iron-context.sh` output
2. Paste it into your PR description
3. The `iron-gate` CI check will validate compliance

---

## Enforcement

### The `iron-gate` CI Check

Every PR must pass the IRON Gate:

| Check | Requirement |
|---|---|
| **Context Acknowledgement** | PR description must contain `Context-Commit-Hash: <hash>` |
| **Context Freshness** | The hash must be a valid ancestor of `main` |
| **Inventory Integrity** | `isa.inventory.json` must not be modified in the PR |

PRs that fail the IRON Gate cannot be merged.

### Drift Detection

The `iron-inventory.sh` script detects unknown scope:

- New files or directories not in the defined scope will be flagged
- You must explicitly classify them as IN SCOPE, OUT OF SCOPE, or IGNORE
- Silent omission is not allowed

---

## Delegation Policy

### What Requires High-Cost Reasoning

- Strategic planning and roadmap updates
- Architectural design and refactoring
- Complex, multi-component feature implementation
- Root cause analysis of non-trivial bugs

### What Must Be Delegated

- Repository scanning and inventory generation → `iron-inventory.sh`
- Bulk document analysis → `map` tool or cheaper models
- Boilerplate code generation → Templates
- Tests and linting → CI/CD pipeline

---

## Self-Correction

### Failure Detection

| Signal | Meaning | Action |
|---|---|---|
| **Protocol Friction Score > 5%** | Governance overhead is too high | Simplify the protocol |
| **Stale Roadmap Indicator** | Planning is not keeping up with execution | Escalate to Lead Architect |
| **Manual Override Frequency > 1/month** | Protocol has a design flaw | Review and fix the protocol |

### Evolution

The protocol must adapt or be replaced. If it becomes a bottleneck, simplify it. The ultimate goal is to make governance **disappear** into automated, frictionless execution.

---

## Quick Reference

```bash
# Start any task
./scripts/iron-context.sh

# Generate inventory only
./scripts/iron-inventory.sh

# Check current roadmap
cat ROADMAP.md

# Check this protocol
cat IRON_PROTOCOL.md
```

---

**This protocol is now active. All ISA development must comply.**
