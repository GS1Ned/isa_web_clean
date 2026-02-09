# Ask ISA — Runtime Contract

Status: DRAFT
Generated_at_utc: 2026-02-09T20:37:32Z
Repo_head_sha: 7a8260077fd4c814ceb66a01e1848d32cf97647d

## Proven server entrypoint
- `server/prompts/ask_isa/index.ts` (export: `assembleAskISAPrompt`)

## Request (minimum)
```json
{
  "question": "string",
  "mode": "string (optional)",
  "constraints": {
    "regime": "string (optional)",
    "jurisdiction": "string (optional)"
  },
  "trace": {
    "request_id": "string (optional)",
    "user_id": "string (optional)"
  }
}
```

## Response (minimum)
```json
{
  "answer": "string",
  "citations": [
    {
      "type": "path|url|doc_id",
      "ref": "string",
      "locator": "string (optional)"
    }
  ],
  "trace": {
    "trace_id": "string",
    "head_sha": "7a8260077fd4c814ceb66a01e1848d32cf97647d"
  }
}
```

## Evidence pointers policy
- Every response MUST include at least one evidence pointer or explicitly label INSUFFICIENT_EVIDENCE.
