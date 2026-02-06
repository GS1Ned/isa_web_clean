# The IRON Protocol

**Version:** 2.0.0  
**Status:** ✅ Active and Binding  
**Last Updated:** 2026-01-27

---

## 1. Purpose

The IRON Protocol is the canonical governance system for ISA development. It exists to:

1. **Prevent context loss** across development sessions
2. **Minimize cognitive overhead** for developers and AI agents
3. **Enforce consistency** through automation, not discipline
4. **Make correct execution the path of least resistance**

---

## 2. Core Principles

| Principle | Meaning |
|---|---|
| **Execution over theory** | Governance exists only to improve execution speed, correctness, and cost-efficiency. |
| **Automation over discipline** | If a rule relies on memory or goodwill, it will fail. |
| **Minimal surface area** | Fewer artefacts, fewer rules, fewer exceptions. |
| **Cost awareness** | High-cost reasoning is reserved for high-value decisions. Deterministic work is delegated. |

---

## 3. Canonical Artefacts & Value Hierarchy

The protocol is built on a strict hierarchy of authority:

| Level | Artefact(s) | Owner | Purpose |
|---|---|---|---|
| **L1: System State** | Live system (runtime reality) | Machine | The ultimate ground truth. |
| **L2: Governance Intent** | `ROADMAP.md`, `IRON_PROTOCOL.md` | Human | The strategic direction and rules of work. |
| **L3: System Inventory** | `isa.inventory.json`, `SCOPE_DECISIONS.md` | Machine | The ground truth of what exists in the repository. |
| **L4: Explanatory Docs** | All other `.md` files | Human | Supporting context and documentation. |
| **L5: Ephemeral Context** | Chat history, notes, etc. | N/A | Transient, non-authoritative information. |

**When sources conflict, higher-level data wins.**

---

## 4. Execution Loop & Conflict Handling

### 4.1. Before Starting Any Task

Run the context ingestion script:

```bash
./scripts/iron-context.sh
```

This script is the **single entry point** for all development work.

### 4.2. During Development

- Work on the current ROADMAP priority.
- If the task diverges from the roadmap, **pause and escalate**.

### 4.3. IRON CONFLICT: The Stop Condition

Execution **must halt** if an **IRON CONFLICT** is detected. An IRON CONFLICT occurs when:

1.  **L1 (System State) conflicts with L2 (Governance Intent):** The live system behaves in a way that contradicts the roadmap.
2.  **L2 (Governance Intent) conflicts with L3 (System Inventory):** The roadmap assumes a state that the inventory proves false.
3.  **L3 (System Inventory) detects unknown scope:** The `iron-inventory.sh` script finds files/directories not in `SCOPE_DECISIONS.md`.

When an IRON CONFLICT occurs, the agent must:
1.  Declare `IRON CONFLICT`.
2.  State the conflicting sources and their levels in the value hierarchy.
3.  Pause all work until the conflict is resolved by the Lead Architect.

### 4.4. Before Submitting a PR

1.  Copy the Context Acknowledgement block from `iron-context.sh` output.
2.  Paste it into your PR description.
3.  The `iron-gate` CI check will validate compliance.

---

## 5. Enforcement & Self-Correction

### 5.1. The `iron-gate` CI Check

Every PR must pass the IRON Gate:

| Check | Requirement |
|---|---|
| **Context Acknowledgement** | PR description must contain `Context-Commit-Hash: <hash>` |
| **Context Freshness** | The hash must be a valid ancestor of `main` |
| **Inventory Integrity** | `isa.inventory.json` must not be modified in the PR |

### 5.2. Scope Drift Handling

1.  `iron-inventory.sh` detects unknown scope and exits with an error.
2.  Developer/agent must record a decision (IN/OUT/IGNORE) in `SCOPE_DECISIONS.md`.
3.  `iron-inventory.sh` is updated to reflect the decision.

### 5.3. Self-Correction Loop

| Signal | Meaning | Action |
|---|---|---|
| **Protocol Friction Score > 5%** | Governance overhead is too high | Simplify the protocol |
| **Stale Roadmap Indicator** | Planning is not keeping up with execution | Escalate to Lead Architect |
| **Manual Override Frequency > 1/month** | Protocol has a design flaw | Review and fix the protocol |

---

## 6. Bootstrap Exceptions

- **CI Workflow Creation:** The `iron-gate.yml` workflow was created manually via the GitHub UI due to GitHub App permission limitations. This is a **one-time bootstrap condition** and is documented here for posterity.

---

## 7. Quick Reference

```bash
# Start any task
./scripts/iron-context.sh

# Generate inventory only
./scripts/iron-inventory.sh

# Check current roadmap
cat ROADMAP.md

# Check scope decisions
cat SCOPE_DECISIONS.md

# Check this protocol
cat IRON_PROTOCOL.md
```

---

**This protocol is now active. All ISA development must comply.**
