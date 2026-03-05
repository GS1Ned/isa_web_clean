-- ISA2-0013a + ISA2-0016 foundation
-- Postgres subset schema for top-3 journeys:
-- Ask ISA / Knowledge Base, ESRS Mapping, Advisory (normalized targets)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_type') THEN
    CREATE TYPE source_type AS ENUM (
      'eu_regulation',
      'eu_directive',
      'gs1_global_standard',
      'gs1_regional_standard',
      'gs1_datamodel',
      'official_guidance',
      'industry_standard',
      'news_article',
      'third_party_analysis'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_status') THEN
    CREATE TYPE source_status AS ENUM ('draft', 'active', 'superseded', 'deprecated', 'archived');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_verification_status') THEN
    CREATE TYPE source_verification_status AS ENUM ('pending', 'verified', 'stale', 'failed');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chunk_type') THEN
    CREATE TYPE chunk_type AS ENUM (
      'article', 'section', 'paragraph', 'table', 'definition', 'requirement', 'guidance', 'example', 'full_document'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rag_verification_status') THEN
    CREATE TYPE rag_verification_status AS ENUM ('pending', 'verified', 'failed', 'skipped');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'embedding_source_type') THEN
    CREATE TYPE embedding_source_type AS ENUM (
      'regulation', 'standard', 'esrs_datapoint', 'dutch_initiative', 'esrs_gs1_mapping'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'regulation_type') THEN
    CREATE TYPE regulation_type AS ENUM ('CSRD','ESRS','DPP','EUDR','ESPR','PPWR','EU_TAXONOMY','OTHER');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gs1_sector') THEN
    CREATE TYPE gs1_sector AS ENUM ('food_hb','diy_garden_pet','healthcare','agriculture');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gs1_datatype') THEN
    CREATE TYPE gs1_datatype AS ENUM ('text','number','boolean','date','code_list','url','other');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gs1_mapping_level') THEN
    CREATE TYPE gs1_mapping_level AS ENUM ('product','company');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'advisory_report_type') THEN
    CREATE TYPE advisory_report_type AS ENUM (
      'COMPLIANCE_ASSESSMENT',
      'STANDARDS_MAPPING',
      'REGULATION_IMPACT',
      'IMPLEMENTATION_GUIDE',
      'GAP_ANALYSIS',
      'SECTOR_ADVISORY',
      'CUSTOM'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'advisory_review_status') THEN
    CREATE TYPE advisory_review_status AS ENUM ('DRAFT','UNDER_REVIEW','APPROVED','PUBLISHED','ARCHIVED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'advisory_publication_status') THEN
    CREATE TYPE advisory_publication_status AS ENUM ('INTERNAL_ONLY','READY_FOR_PUBLICATION','PUBLISHED','WITHDRAWN');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'advisory_lane_status') THEN
    CREATE TYPE advisory_lane_status AS ENUM ('LANE_A','LANE_B','LANE_C');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS sources (
  id serial PRIMARY KEY,
  name varchar(512) NOT NULL,
  acronym varchar(64),
  external_id varchar(255),
  source_type source_type NOT NULL,
  authority_level integer NOT NULL,
  authority_tier varchar(64),
  license_type varchar(64),
  publication_status varchar(64),
  immutable_uri varchar(1024),
  publisher varchar(255),
  publisher_url varchar(512),
  version varchar(64),
  publication_date timestamptz,
  effective_date timestamptz,
  expiration_date timestamptz,
  official_url varchar(1024),
  archive_url varchar(1024),
  status source_status NOT NULL DEFAULT 'active',
  superseded_by integer,
  ingestion_date timestamptz NOT NULL DEFAULT now(),
  last_verified_date timestamptz,
  verification_status source_verification_status NOT NULL DEFAULT 'pending',
  description text,
  sector varchar(128),
  language varchar(8) DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by varchar(255)
);

CREATE UNIQUE INDEX IF NOT EXISTS sources_external_id_uq ON sources (external_id);
CREATE INDEX IF NOT EXISTS sources_source_type_idx ON sources (source_type);
CREATE INDEX IF NOT EXISTS sources_authority_level_idx ON sources (authority_level);
CREATE INDEX IF NOT EXISTS sources_status_idx ON sources (status);
CREATE INDEX IF NOT EXISTS sources_sector_idx ON sources (sector);
CREATE INDEX IF NOT EXISTS sources_publication_date_idx ON sources (publication_date);

CREATE TABLE IF NOT EXISTS source_chunks (
  id serial PRIMARY KEY,
  source_id integer NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  chunk_type chunk_type NOT NULL DEFAULT 'paragraph',
  section_path varchar(512),
  heading varchar(512),
  content text NOT NULL,
  content_hash varchar(64) NOT NULL,
  char_start integer,
  char_end integer,
  embedding jsonb,
  embedding_model varchar(64),
  embedding_generated_at timestamptz,
  version varchar(64),
  is_active boolean NOT NULL DEFAULT true,
  deprecated_at timestamptz,
  deprecation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS source_chunks_source_chunk_uq
  ON source_chunks (source_id, chunk_index);
CREATE INDEX IF NOT EXISTS source_chunks_source_id_idx ON source_chunks (source_id);
CREATE INDEX IF NOT EXISTS source_chunks_chunk_type_idx ON source_chunks (chunk_type);
CREATE INDEX IF NOT EXISTS source_chunks_content_hash_idx ON source_chunks (content_hash);
CREATE INDEX IF NOT EXISTS source_chunks_is_active_idx ON source_chunks (is_active);

CREATE TABLE IF NOT EXISTS rag_traces (
  id serial PRIMARY KEY,
  trace_id varchar(64) NOT NULL,
  conversation_id integer,
  user_id integer,
  query text NOT NULL,
  query_embedding jsonb,
  query_language varchar(8),
  sector_filter varchar(64),
  retrieved_chunk_ids jsonb,
  retrieval_scores jsonb,
  rerank_scores jsonb,
  selected_chunk_ids jsonb,
  selected_spans jsonb,
  extracted_claims jsonb,
  generated_answer text,
  citations jsonb,
  confidence_score numeric(3,2),
  citation_precision numeric(3,2),
  abstained boolean NOT NULL DEFAULT false,
  abstention_reason text,
  verification_status rag_verification_status NOT NULL DEFAULT 'pending',
  verification_details jsonb,
  total_latency_ms integer,
  retrieval_latency_ms integer,
  generation_latency_ms integer,
  llm_model varchar(128),
  embedding_model varchar(128),
  prompt_version varchar(64),
  cache_hit boolean NOT NULL DEFAULT false,
  cache_key varchar(64),
  feedback_id integer,
  error_occurred boolean NOT NULL DEFAULT false,
  error_message text,
  error_stack text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rag_traces_trace_id_idx ON rag_traces (trace_id);
CREATE INDEX IF NOT EXISTS rag_traces_conversation_id_idx ON rag_traces (conversation_id);
CREATE INDEX IF NOT EXISTS rag_traces_user_id_idx ON rag_traces (user_id);
CREATE INDEX IF NOT EXISTS rag_traces_created_at_idx ON rag_traces (created_at);
CREATE INDEX IF NOT EXISTS rag_traces_verification_status_idx ON rag_traces (verification_status);
CREATE INDEX IF NOT EXISTS rag_traces_abstained_idx ON rag_traces (abstained);
CREATE INDEX IF NOT EXISTS rag_traces_error_occurred_idx ON rag_traces (error_occurred);

CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id serial PRIMARY KEY,
  source_type embedding_source_type NOT NULL,
  source_id integer NOT NULL,
  content text NOT NULL,
  content_hash varchar(64) NOT NULL,
  embedding jsonb NOT NULL,
  embedding_model varchar(64) NOT NULL DEFAULT 'text-embedding-3-small',
  title varchar(512) NOT NULL,
  url varchar(512),
  dataset_id varchar(255),
  dataset_version varchar(64),
  last_verified_date timestamptz,
  is_deprecated boolean NOT NULL DEFAULT false,
  deprecation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_embeddings_source_type_idx ON knowledge_embeddings (source_type);
CREATE INDEX IF NOT EXISTS knowledge_embeddings_source_id_idx ON knowledge_embeddings (source_id);
CREATE INDEX IF NOT EXISTS knowledge_embeddings_content_hash_idx ON knowledge_embeddings (content_hash);
CREATE INDEX IF NOT EXISTS knowledge_embeddings_source_composite_idx
  ON knowledge_embeddings (source_type, source_id);

CREATE TABLE IF NOT EXISTS regulations (
  id serial PRIMARY KEY,
  celex_id varchar(64),
  title varchar(255) NOT NULL,
  description text,
  regulation_type regulation_type NOT NULL,
  effective_date timestamptz,
  source_url varchar(512),
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  embedding jsonb,
  needs_verification boolean DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS regulations_celex_id_uq ON regulations (celex_id);

CREATE TABLE IF NOT EXISTS esrs_datapoints (
  id serial PRIMARY KEY,
  code varchar(100) NOT NULL,
  esrs_standard varchar(50),
  disclosure_requirement varchar(100),
  paragraph varchar(100),
  related_ar varchar(100),
  name text NOT NULL,
  data_type varchar(50),
  conditional boolean DEFAULT false,
  voluntary boolean DEFAULT false,
  sfdr_mapping varchar(255),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS esrs_datapoints_code_idx ON esrs_datapoints (code);
CREATE INDEX IF NOT EXISTS esrs_datapoints_standard_idx ON esrs_datapoints (esrs_standard);

CREATE TABLE IF NOT EXISTS gs1_attributes (
  id serial PRIMARY KEY,
  attribute_code varchar(100) NOT NULL,
  attribute_name varchar(255) NOT NULL,
  sector gs1_sector NOT NULL,
  description text,
  datatype gs1_datatype NOT NULL,
  code_list_id integer,
  is_mandatory boolean DEFAULT false,
  esrs_relevance text,
  dpp_relevance text,
  packaging_related boolean DEFAULT false,
  sustainability_related boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gs1_attributes_sector_idx ON gs1_attributes (sector);
CREATE INDEX IF NOT EXISTS gs1_attributes_packaging_idx ON gs1_attributes (packaging_related);
CREATE INDEX IF NOT EXISTS gs1_attributes_sustainability_idx ON gs1_attributes (sustainability_related);

CREATE TABLE IF NOT EXISTS gs1_standards (
  id serial PRIMARY KEY,
  standard_code varchar(64) NOT NULL,
  standard_name varchar(255) NOT NULL,
  description text,
  category varchar(128),
  scope text,
  reference_url varchar(512),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  embedding jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS gs1_standards_standard_code_uq ON gs1_standards (standard_code);

CREATE TABLE IF NOT EXISTS regulation_esrs_mappings (
  id serial PRIMARY KEY,
  regulation_id integer NOT NULL,
  datapoint_id integer NOT NULL,
  relevance_score integer NOT NULL DEFAULT 5,
  reasoning text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS regulation_esrs_mappings_regulation_datapoint_uq
  ON regulation_esrs_mappings (regulation_id, datapoint_id);
CREATE INDEX IF NOT EXISTS regulation_esrs_mappings_regulation_id_idx
  ON regulation_esrs_mappings (regulation_id);
CREATE INDEX IF NOT EXISTS regulation_esrs_mappings_datapoint_id_idx
  ON regulation_esrs_mappings (datapoint_id);

CREATE TABLE IF NOT EXISTS gs1_esrs_mappings (
  mapping_id integer PRIMARY KEY,
  level gs1_mapping_level NOT NULL,
  esrs_standard varchar(50) NOT NULL,
  esrs_topic varchar(255) NOT NULL,
  data_point_name text NOT NULL,
  short_name varchar(512) NOT NULL,
  definition text NOT NULL,
  gs1_relevance text NOT NULL,
  source_document varchar(255) DEFAULT 'GS1 Europe CSRD White Paper v1.0',
  source_date varchar(20) DEFAULT '2025-03-21',
  source_authority varchar(100) DEFAULT 'GS1 in Europe',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gs1_esrs_mappings_standard_idx ON gs1_esrs_mappings (esrs_standard);

CREATE TABLE IF NOT EXISTS mapping_feedback (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  mapping_id integer NOT NULL,
  vote integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS mapping_feedback_user_mapping_uq
  ON mapping_feedback (user_id, mapping_id);
CREATE INDEX IF NOT EXISTS mapping_feedback_user_id_idx ON mapping_feedback (user_id);
CREATE INDEX IF NOT EXISTS mapping_feedback_mapping_id_idx ON mapping_feedback (mapping_id);

CREATE TABLE IF NOT EXISTS advisory_reports (
  id serial PRIMARY KEY,
  title varchar(512) NOT NULL,
  report_type advisory_report_type NOT NULL,
  executive_summary text,
  content text NOT NULL,
  findings jsonb,
  recommendations jsonb,
  target_regulation_ids jsonb,
  target_standard_ids jsonb,
  sector_tags jsonb,
  gs1_impact_tags jsonb,
  decision_artifacts jsonb,
  version varchar(32) NOT NULL,
  generated_date timestamptz NOT NULL DEFAULT now(),
  generated_by varchar(255),
  llm_model varchar(128),
  generation_prompt text,
  quality_score numeric(3,2),
  review_status advisory_review_status NOT NULL DEFAULT 'DRAFT',
  reviewed_by varchar(255),
  reviewed_at timestamptz,
  review_notes text,
  publication_status advisory_publication_status NOT NULL DEFAULT 'INTERNAL_ONLY',
  lane_status advisory_lane_status NOT NULL DEFAULT 'LANE_C',
  governance_notes text,
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  last_accessed_at timestamptz,
  stale_since timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS advisory_reports_type_idx ON advisory_reports (report_type);
CREATE INDEX IF NOT EXISTS advisory_reports_review_status_idx ON advisory_reports (review_status);
CREATE INDEX IF NOT EXISTS advisory_reports_publication_status_idx ON advisory_reports (publication_status);
CREATE INDEX IF NOT EXISTS advisory_reports_generated_date_idx ON advisory_reports (generated_date);

CREATE TABLE IF NOT EXISTS advisory_report_versions (
  id serial PRIMARY KEY,
  report_id integer NOT NULL REFERENCES advisory_reports(id) ON DELETE CASCADE,
  version varchar(32) NOT NULL,
  content text NOT NULL,
  decision_artifacts jsonb,
  change_log text,
  created_by varchar(255),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS advisory_report_versions_report_id_idx
  ON advisory_report_versions (report_id);

CREATE TABLE IF NOT EXISTS advisory_report_target_regulations (
  id serial PRIMARY KEY,
  report_id integer NOT NULL REFERENCES advisory_reports(id) ON DELETE CASCADE,
  regulation_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS advisory_report_target_regulations_report_regulation_uq
  ON advisory_report_target_regulations (report_id, regulation_id);
CREATE INDEX IF NOT EXISTS advisory_report_target_regulations_regulation_idx
  ON advisory_report_target_regulations (regulation_id);

CREATE TABLE IF NOT EXISTS advisory_report_target_standards (
  id serial PRIMARY KEY,
  report_id integer NOT NULL REFERENCES advisory_reports(id) ON DELETE CASCADE,
  standard_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS advisory_report_target_standards_report_standard_uq
  ON advisory_report_target_standards (report_id, standard_id);
CREATE INDEX IF NOT EXISTS advisory_report_target_standards_standard_idx
  ON advisory_report_target_standards (standard_id);
