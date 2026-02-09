# Spec: NEWS_HUB (Minimal)

## Goal
Ingest, store, and present regulatory/standards news items.

## Inputs
- configured sources
- schedule trigger or manual trigger

## Outputs
- stored news items with provenance
- list API for latest items

## Acceptance criteria
- Ingestion is triggerable deterministically.
- Items are listable and include provenance fields.
