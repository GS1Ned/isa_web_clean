# Spec: ESRS_MAPPING (Minimal)

## Goal
Serve ESRS ↔ GS1 mapping queries and expose mapping coverage.

## Inputs
- ESRS datapoint (and/or GS1 attribute)

## Outputs
- mapping rows
- provenance pointers per row

## Acceptance criteria
- Mapping query returns deterministic results.
- Each mapping row contains provenance pointers.
