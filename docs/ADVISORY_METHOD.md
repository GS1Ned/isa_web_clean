# Advisory method

## Purpose

This document defines how ISA produces advisory outputs from locked artefacts. It describes the method at a level suitable for GS1 (Global Standards One) stakeholders without exposing implementation details.

## Inputs

ISA advisory outputs are based on:
- A frozen dataset registry and registered datasets
- A locked advisory artefact (Markdown and JSON forms)
- Documented mappings, gaps and recommendations within the advisory scope

ISA does not use:
- Customer data
- Unregistered external sources at query time

## Method overview

1. Scope definition
- Identify the regulations and sectors covered by the advisory
- Confirm the frozen registry version

2. Evidence extraction
- Use only registered datasets and locked artefacts
- Maintain provenance to source artefacts

3. Mapping representation
- Represent relationships as mapping results with stable identifiers
- Track mapping status (direct, partial, missing)

4. Gap identification
- Record gaps as structured items with severity
- Link each gap to the affected regulation, sector and domain tags

5. Recommendation formulation
- Provide recommendations by timeframe (short, medium, long)
- Link recommendations to gaps and expected standards evolution implications

## Traceability requirements

Every advisory output must include:
- Advisory ID and version
- Registry version and dataset IDs
- Source artefact paths and hashes where available
- Deterministic ordering for diffability

## Limitations

- ISA does not guarantee future regulatory outcomes
- ISA outputs are only valid for the versions of datasets and standards recorded in the advisory provenance
