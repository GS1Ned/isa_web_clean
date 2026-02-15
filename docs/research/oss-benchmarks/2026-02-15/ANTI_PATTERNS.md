# Anti-Patterns (2026-02-15)

Last verified date: 2026-02-15

## APX-001 - Direct Console Calls in Production Paths

FACT
- Direct console methods in server code make observability non-uniform and hard to route to sinks (DB, APM, alerting). They also create test noise.
- Evidence:
  - ISA baseline has a dedicated logger facade: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/utils/server-logger.ts
  - GitHub Actions example of grep-based gates exists (disabled in ISA): https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/console-check.yml.disabled

INTERPRETATION
- Centralizing logs behind a facade lets ISA evolve sinks without changing call sites.

RECOMMENDATION
- Route all server logs through `serverLogger` and persist important errors through `server/_core/logger-wiring.ts`.

---

## APX-002 - Generated JSON Artifacts Without Schemas

FACT
- JSON artifacts without schema validation drift silently and break downstream consumption.
- Evidence:
  - ISA already validates JSON artifacts against schemas using AJV in CI: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/schema-validation.yml
  - AJV is a canonical JSON Schema validator: https://ajv.js.org/ (date: )

INTERPRETATION
- Treat schemas as contracts; validate in CI and keep artifacts deterministic.

RECOMMENDATION
- For any new generated JSON (research or product), add a schema under `docs/quality/schemas/` and validate in CI.

---

## APX-003 - Ingestion Without Idempotency and Provenance

FACT
- Ingestion jobs that cannot be re-run safely will duplicate data or produce non-deterministic outputs.
- Evidence:
  - Stripe idempotency guidance (conceptual reference): https://stripe.com/docs/idempotency (date: )
  - Temporal positioning for durable workflows and retries: https://docs.temporal.io/ (date: )

INTERPRETATION
- Idempotency keys + provenance (source URL, timestamp, content hash) are the minimum set for reliable reprocessing.

RECOMMENDATION
- Add idempotency keys per ingest item; store provenance and hashes; enforce dedupe at write boundaries.

---

## APX-004 - Monolith Routers and Mixed Concerns

FACT
- When a router file contains many unrelated domains, both humans and agents lose locality, and changes become high-risk.
- Evidence:
  - ISA has a large router composition file: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/routers.ts
  - tRPC encourages router composition patterns: https://trpc.io/docs/router (date: )

INTERPRETATION
- Modular routers reduce agent context and make ownership possible.

RECOMMENDATION
- Split router composition into domain modules with a thin root router.

---

## APX-005 - Observability Without Trace Correlation

FACT
- Without a trace/correlation id passed across HTTP, DB, and LLM calls, it is difficult to answer "what happened" for a user request.
- Evidence:
  - OpenTelemetry docs on tracing concepts: https://opentelemetry.io/docs/concepts/signals/traces/ (date: )
  - ISA error ledger persistence wiring (trace id field): https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/logger-wiring.ts

INTERPRETATION
- Correlation id propagation is a low-effort, high-leverage change.

RECOMMENDATION
- Ensure every request has a trace id; attach it to logs, DB writes, and LLM invocation records.
