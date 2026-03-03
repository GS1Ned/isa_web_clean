# OpenClaw UI Prompt Starter (ISA)

Use this as your first prompt in the OpenClaw UI after `bash scripts/openclaw-isa-dev-start.sh`:

```text
You are operating inside the ISA repository.
Mode: evidence-first, no secrets in output, deterministic steps.

Goal:
Move ISA toward the canonical TARGET state with one small, reviewable change.

Rules:
1) Confirm current branch and changed files before edits.
2) Provide FACT / INTERPRETATION / RECOMMENDATION in responses.
3) Run only non-destructive commands.
4) Cite file paths and line references for all key claims.
5) Run relevant validation before finishing.
6) Update existing canonical docs only when documentation changes are required.
7) Do not create parallel architecture, target-state, roadmap, or report documents.

Canonical document set to use:
- `docs/agent/AGENT_MAP.md`
- `docs/spec/ARCHITECTURE.md`
- `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
- `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`
- `docs/architecture/panel/_generated/EVIDENCE_INDEX.json`
- `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json`
- `docs/planning/NEXT_ACTIONS.json`
- `docs/governance/OPENCLAW_POLICY_ENVELOPE.md`
- relevant capability runtime contract(s) under `docs/spec/*/RUNTIME_CONTRACT.md`

Do not use as architecture authority:
- `docs/spec/ISA_CAPABILITY_MAP.md`
- `docs/spec/ESRS_MAPPING/isa-core-architecture.md`
- any newly proposed `TARGET_STATE.md` or `ROADMAP.md`
- any plan or architecture narrative not linked from the canonical chain above

Target-state interpretation rules:
- `docs/spec/ARCHITECTURE.md` defines the only canonical CURRENT/TARGET contract.
- `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md` defines the six canonical capabilities and ownership rule.
- `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json` is the authoritative ownership contract.
- `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json` defines shared primitives promoted out of single-capability ownership.
- `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json` defines cross-capability dependency edges.
- `docs/architecture/panel/_generated/EVIDENCE_INDEX.json` and `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json` define proof and validation expectations.
- OpenClaw must operate within `docs/governance/OPENCLAW_POLICY_ENVELOPE.md` and must not bypass policy controls.
- Do not introduce Manus integration, router compilers, new storage topologies, or new platform layers as TARGET-state facts unless they are already evidenced in the canonical set or explicitly added by the selected READY item.

Start by:
1) Reading the canonical document set in the order listed above.
2) Selecting the first `READY` item in `docs/planning/NEXT_ACTIONS.json` that advances the target-state deltas or canonical contracts.
3) Mapping the work to the affected capability, manifest ownership, shared primitives, dependency graph, and runtime contract.
4) Mapping the work to the relevant `CURRENT->TARGET` delta row(s) in `docs/spec/ARCHITECTURE.md`.
5) Proposing a concise execution plan, then implementing one minimal diff.
6) Updating canonical docs only if the selected change materially changes canonical behavior or evidence.
7) Running only the validations relevant to the changed target-state surfaces, preferring commands listed in `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json` and the affected runtime contract(s).

Definition of done for this session:
- the change aligns with the canonical TARGET state
- ownership remains consistent with the manifest and shared primitive rules
- no parallel architecture or roadmap document was created
- relevant validation passed or any remaining limitation is explicitly stated
- the final report names any remaining `CURRENT->TARGET` delta still open
```

Optional follow-up prompt:

```text
Continue execution for the selected READY item.
Keep the change aligned to `docs/spec/ARCHITECTURE.md` TARGET state and the machine-readable contracts.
End with a short validation report and any remaining CURRENT->TARGET delta.
```
