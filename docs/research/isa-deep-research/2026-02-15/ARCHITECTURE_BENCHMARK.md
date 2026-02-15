# Architecture Benchmark (5 Approaches)

Last verified date: 2026-02-15

## FACT
- Approaches compared: monorepo modular architecture, microservices, modular monolith, event-driven ingestion pipeline, serverless ingestion.

## INTERPRETATION
- ISA’s dominant constraints are audit readiness and governance enforceability; architecture should maximise evidence capture with minimal operational surface area.

## RECOMMENDATION
- Prefer modular monolith plus event-driven ingestion patterns; defer microservices/serverless until governance and observability are mature.

## Ranked Conclusion
### 1. Modular monolith
Strong governance gates and audit artefacts with lowest operational overhead (matches ISA current single-server shape).
OSS examples (evidence pointers):
- https://github.com/open-policy-agent/opa
  - README.md
- https://github.com/MarquezProject/marquez
  - README.md

### 2. Event-driven ingestion pipeline
Best provenance and replayability when ingestion scales; requires event schema and durable ledger.
OSS examples (evidence pointers):
- https://github.com/OpenLineage/OpenLineage
  - spec/
- https://github.com/dagster-io/dagster
  - README.md

### 3. Monorepo modular architecture
Scales capability modules and ownership; risks CI/build complexity without deterministic tooling.
OSS examples (evidence pointers):
- https://github.com/backstage/backstage
  - README.md
- https://github.com/datahub-project/datahub
  - README.md

### 4. Microservices
Independent scaling but highest governance and audit surface area (SLOs, versioning, deployments).
OSS examples (evidence pointers):
- https://github.com/open-metadata/OpenMetadata
  - README.md
- https://github.com/datahub-project/datahub
  - README.md

### 5. Serverless ingestion
Harder reproducibility and evidence capture without mature tracing/retention; good only for constrained ingestion steps.
OSS examples (evidence pointers):
- https://github.com/sigstore/cosign
  - README.md
- https://github.com/OpenLineage/OpenLineage
  - spec/


Last verified date: 2026-02-15
