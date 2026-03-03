#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=catalog_health"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

require_file() {
  local path="$1"
  [[ -f "$path" ]] || {
    echo "STOP=missing_required_file path=$path"
    exit 1
  }
}

require_pattern() {
  local pattern="$1"
  local path="$2"
  rg -q --fixed-strings "$pattern" "$path" || {
    echo "STOP=missing_expected_pattern path=$path pattern=$pattern"
    exit 1
  }
}

required_files=(
  "docs/spec/CATALOG/RUNTIME_CONTRACT.md"
  "server/catalog-authority.ts"
  "server/catalog-authority.test.ts"
  "server/db-dataset-registry.ts"
  "server/routers/dataset-registry.ts"
  "server/routers/standards-directory.ts"
  "server/routers/standards-directory.test.ts"
  "drizzle/schema_dataset_registry.ts"
)

for path in "${required_files[@]}"; do
  require_file "$path"
done

echo "READY=required_files"

require_pattern "authorityTier" "drizzle/schema_dataset_registry.ts"
require_pattern "publicationStatus" "drizzle/schema_dataset_registry.ts"
require_pattern "immutableUri" "drizzle/schema_dataset_registry.ts"
require_pattern "lastVerifiedAt" "drizzle/schema_dataset_registry.ts"
require_pattern "laneStatus" "drizzle/schema_dataset_registry.ts"

require_pattern "deriveCatalogAuthorityTierFromUrl" "server/db-dataset-registry.ts"
require_pattern "deriveCatalogAuthorityTierFromUrl" "server/routers/dataset-registry.ts"
require_pattern "authorityTier: z.string().optional()" "server/routers/dataset-registry.ts"
require_pattern "publicationStatus: z.string().optional()" "server/routers/dataset-registry.ts"
require_pattern "immutableUri: z.string().optional()" "server/routers/dataset-registry.ts"

echo "READY=dataset_registry_authority_contract"

require_pattern "authoritativeSourceUrl" "server/routers/standards-directory.ts"
require_pattern "datasetIdentifier" "server/routers/standards-directory.ts"
require_pattern "lastVerifiedDate" "server/routers/standards-directory.ts"
require_pattern "should include transparency metadata" "server/routers/standards-directory.test.ts"

echo "READY=standards_directory_transparency_contract"

require_pattern "## Authority Metadata Expectations" "docs/spec/CATALOG/RUNTIME_CONTRACT.md"
require_pattern "server/catalog-authority.ts" "docs/spec/CATALOG/RUNTIME_CONTRACT.md"

echo "READY=runtime_contract_alignment"

pnpm exec vitest run server/catalog-authority.test.ts --no-coverage

echo "DONE=catalog_health_ok repo_root=$REPO_ROOT"
