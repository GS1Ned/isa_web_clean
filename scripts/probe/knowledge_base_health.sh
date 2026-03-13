#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "PREFLIGHT=knowledge_base_health"

for path in \
  "${REPO_ROOT}/drizzle/schema.ts" \
  "${REPO_ROOT}/server/db-knowledge-vector.ts" \
  "${REPO_ROOT}/server/hybrid-search.ts" \
  "${REPO_ROOT}/server/citation-validation.ts" \
  "${REPO_ROOT}/server/knowledge-provenance.ts" \
  "${REPO_ROOT}/server/routers/citation-admin.ts" \
  "${REPO_ROOT}/server/routers/ask-isa.ts" \
  "${REPO_ROOT}/docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md" \
  "${REPO_ROOT}/server/knowledge-provenance.test.ts"
do
  if [[ ! -f "${path}" ]]; then
    echo "STOP=missing_required_file:${path}"
    exit 1
  fi
done

if ! command -v rg >/dev/null 2>&1; then
  echo "STOP=rg_not_found"
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "STOP=pnpm_not_found"
  exit 1
fi

echo "READY=knowledge_base_repo_evidence"

rg -n "contentHash: varchar|datasetId: varchar|datasetVersion: varchar|lastVerifiedDate: timestamp|isDeprecated: tinyint" \
  "${REPO_ROOT}/drizzle/schema.ts" >/dev/null

rg -n "export async function vectorSearchKnowledge|knowledgeEmbeddings|contentHash|datasetId|datasetVersion|lastVerifiedDate" \
  "${REPO_ROOT}/server/db-knowledge-vector.ts" >/dev/null

rg -n "export async function hybridSearch|authorityLevel|authorityScore" \
  "${REPO_ROOT}/server/hybrid-search.ts" >/dev/null

rg -n "buildKnowledgeEvidenceKey|doesKnowledgeChunkNeedVerification|evidenceKeyReason|datasetId: chunk.datasetId|datasetVersion: chunk.datasetVersion|lastVerifiedDate: chunk.lastVerifiedDate" \
  "${REPO_ROOT}/server/citation-validation.ts" >/dev/null

rg -n "doesKnowledgeChunkNeedVerification" \
  "${REPO_ROOT}/server/routers/citation-admin.ts" >/dev/null

rg -n "evidenceKey: source.evidenceKey|needsVerification: source.needsVerification|lastVerifiedDate: source.lastVerifiedDate" \
  "${REPO_ROOT}/server/routers/ask-isa.ts" >/dev/null

rg -n "Retrieval And Citation Substrate Expectations|ke:<chunkId>:<contentHash>|older than 90 days" \
  "${REPO_ROOT}/docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md" >/dev/null

pnpm exec vitest run server/knowledge-provenance.test.ts --no-coverage

echo "DONE=knowledge_base_health"
