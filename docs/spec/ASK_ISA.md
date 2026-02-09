# Spec: ASK_ISA (Minimal)

## Goal
Provide Q&A over ISA knowledge with traceable evidence pointers.

## Inputs
- user_question (string)
- optional context selectors (dataset IDs, date ranges)

## Outputs
- answer (string)
- evidence (list of provenance pointers)

## Acceptance criteria
- A deterministic endpoint exists to answer a question (may be stubbed).
- Response includes evidence pointers for every material claim.
