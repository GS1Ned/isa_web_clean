# Phase 1 — Core Capability Build (Ask ISA first)

Status: DRAFT (Plan-as-code entrypoint)  
Scope: Ask ISA end-to-end, then News Hub baseline

## Canonical references
- Planning: docs/planning/NEXT_ACTIONS.json
- Agent map: docs/agent/AGENT_MAP.md
- Core contract: docs/core/ISA_CORE_CONTRACT.md
- Ask ISA spec: docs/spec/ASK_ISA.md
- News Hub spec: docs/spec/NEWS_HUB.md

## Proven in-repo entrypoints (evidence pointers)
- Server Ask ISA prompt entry: server/prompts/ask_isa/index.ts
- Client Ask ISA UI references: client/src (search: "Ask ISA")
- Ask ISA feedback/query schema: drizzle/schema_ask_isa_feedback.ts and drizzle/schema_corpus_governance.ts

## Phase objective
Deliver a minimal, testable Ask ISA path that:
1) accepts a question,
2) produces a traceable response with evidence pointers,
3) is callable from the client UI,
4) and can be validated via an automated “smoke” harness later reintroduced as gates.

## Ask ISA contract
- Runtime contract: `docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md`
