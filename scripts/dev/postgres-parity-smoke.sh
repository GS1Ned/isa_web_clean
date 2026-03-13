#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env"
  set +a
fi

DATABASE_URL="${DATABASE_URL_POSTGRES:-${DATABASE_URL:-}}"

echo "READY=postgres_parity_smoke_start"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "STOP=postgres_parity_smoke_database_url_missing"
  echo "Set DATABASE_URL_POSTGRES (preferred) or DATABASE_URL"
  exit 1
fi

if command -v psql >/dev/null 2>&1; then
  bash "$REPO_ROOT/scripts/dev/postgres-apply-migrations.sh"

  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
  BEGIN;

  INSERT INTO sources (name, source_type, authority_level)
  VALUES ('smoke_source', 'official_guidance', 4);

  INSERT INTO source_chunks (source_id, chunk_index, content, content_hash)
  SELECT id, 0, 'smoke chunk content', md5('smoke chunk content')
  FROM sources
  WHERE name = 'smoke_source'
  LIMIT 1;

  INSERT INTO rag_traces (trace_id, query, generated_answer, abstained)
  VALUES ('smoke-trace-001', 'smoke query', 'smoke answer', false);

  INSERT INTO regulations (title, regulation_type)
  VALUES ('Smoke Regulation', 'OTHER');

  INSERT INTO esrs_datapoints (code, name)
  VALUES ('SMOKE_DP_001', 'Smoke Datapoint');

  INSERT INTO gs1_standards (standard_code, standard_name)
  VALUES ('SMOKE_STD_001', 'Smoke Standard');

  INSERT INTO advisory_reports (title, report_type, content, version)
  VALUES ('Smoke Advisory', 'CUSTOM', 'smoke content', '0.0.1');

  WITH latest_report AS (
    SELECT id FROM advisory_reports WHERE title = 'Smoke Advisory' ORDER BY id DESC LIMIT 1
  ),
  latest_reg AS (
    SELECT id FROM regulations WHERE title = 'Smoke Regulation' ORDER BY id DESC LIMIT 1
  )
  INSERT INTO advisory_report_target_regulations (report_id, regulation_id)
  SELECT latest_report.id, latest_reg.id
  FROM latest_report, latest_reg;

  WITH latest_report AS (
    SELECT id FROM advisory_reports WHERE title = 'Smoke Advisory' ORDER BY id DESC LIMIT 1
  ),
  latest_std AS (
    SELECT id FROM gs1_standards WHERE standard_code = 'SMOKE_STD_001' ORDER BY id DESC LIMIT 1
  )
  INSERT INTO advisory_report_target_standards (report_id, standard_id)
  SELECT latest_report.id, latest_std.id
  FROM latest_report, latest_std;

  SELECT COUNT(*) AS sources_count FROM sources;
  SELECT COUNT(*) AS chunks_count FROM source_chunks;
  SELECT COUNT(*) AS rag_traces_count FROM rag_traces;
  SELECT COUNT(*) AS advisory_target_regulation_links FROM advisory_report_target_regulations;
  SELECT COUNT(*) AS advisory_target_standard_links FROM advisory_report_target_standards;

  ROLLBACK;
SQL

  echo "DONE=postgres_parity_smoke_pass"
  exit 0
fi

if command -v pnpm >/dev/null 2>&1; then
  pnpm exec tsx scripts/dev/postgres-parity-smoke.ts
  exit 0
fi

echo "STOP=postgres_parity_smoke_runtime_missing"
exit 1
