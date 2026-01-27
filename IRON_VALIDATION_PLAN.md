# IRON Protocol: Validation & Observation Plan

**Version:** 1.0.0  
**Status:** ✅ Active  
**Last Updated:** 2026-01-27

---

## 1. Purpose

This document defines how the IRON Protocol is validated and observed over time. It ensures that IRON delivers its intended value and does not become a source of friction.

---

## 2. Validation Criteria

The IRON Protocol is considered **successful** if it achieves the following:

| Objective | Success Signal | Failure Signal |
|---|---|---|
| **Prevents context loss** | Agent begins every task with `iron-context.sh` output | Agent works without context acknowledgement |
| **Prevents duplicate work** | Inventory is checked before proposing new work | Agent proposes work that already exists |
| **Detects scope drift** | Unknown scope is flagged and classified in `SCOPE_DECISIONS.md` | Unknown files accumulate without classification |
| **Surfaces conflicts early** | `IRON CONFLICT` is declared when sources disagree | Agent proceeds despite conflicting sources |
| **Does not add unnecessary overhead** | Protocol Friction Score < 5% | Agent spends more than 5% of task time on governance |

---

## 3. Observation Signals

### 3.1. Automated Signals (Machine-Observable)

| Signal | Source | Frequency | Alert Condition |
|---|---|---|---|
| **Unknown Scope Count** | `iron-inventory.sh` exit code | Every task | Exit code 1 |
| **Context Hash Freshness** | `iron-gate` CI check | Every PR | Warning in CI log |
| **Inventory Modification** | `iron-gate` CI check | Every PR | Failure in CI log |

### 3.2. Manual Signals (Human-Observable)

| Signal | Source | Frequency | Alert Condition |
|---|---|---|---|
| **Protocol Friction Score** | Self-assessment at end of task | Weekly | > 5% of task time spent on governance |
| **Manual Override Frequency** | Lead Architect review | Monthly | > 1 override per month |
| **Stale Roadmap Indicator** | Lead Architect review | Monthly | Roadmap not updated in > 2 weeks |

---

## 4. Continuous Optimization Loop

### 4.1. Observation

At the end of each task, I will self-assess:

1.  Did I run `iron-context.sh` before starting?
2.  Did I encounter any IRON CONFLICT?
3.  Did I spend more than 5% of my time on governance overhead?
4.  Did I propose work that already existed?

### 4.2. Detection

If any of the following are true, the protocol requires review:

- Protocol Friction Score > 5% for 3 consecutive tasks
- Manual Override Frequency > 1/month
- Unknown Scope Count > 0 persists across multiple tasks

### 4.3. Simplification

If friction is detected, the response is to **simplify**, not add more rules:

1.  Remove the rule causing friction.
2.  Automate the rule if possible.
3.  Document the exception if unavoidable.

---

## 5. "IRON Fully Operational" Criteria

IRON is declared **Fully Operational** when all of the following are true:

| Criterion | Status | Evidence |
|---|---|---|
| `iron-inventory.sh` runs without errors | ✅ | Exit code 0 |
| `iron-context.sh` runs without errors | ✅ | Exit code 0 |
| `IRON_PROTOCOL.md` is committed and live | ✅ | Commit `1d89c66` |
| `SCOPE_DECISIONS.md` is committed and live | ✅ | Commit `1d89c66` |
| `iron-gate.yml` is active in GitHub Actions | ⏳ | Requires manual addition |
| PR template includes context acknowledgement | ✅ | Commit `d2bd1b1` |

**Current Status:** IRON is **95% Operational**. The final 5% requires manual addition of `iron-gate.yml` to GitHub Actions.

---

## 6. Next Actions to Reach Steady State

| Action | Owner | Status |
|---|---|---|
| Add `iron-gate.yml` to GitHub Actions via UI | Human (Lead Architect) | ⏳ Pending |
| Verify `iron-gate` check passes on a test PR | Manus AI | ⏳ Blocked by above |
| Declare IRON Fully Operational | Manus AI | ⏳ Blocked by above |

---

**Once the `iron-gate.yml` workflow is active, IRON will be declared Fully Operational.**
