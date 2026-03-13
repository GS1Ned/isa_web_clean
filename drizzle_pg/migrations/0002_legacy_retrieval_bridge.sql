ALTER TABLE knowledge_embeddings
  ADD COLUMN IF NOT EXISTS authority_level varchar(64),
  ADD COLUMN IF NOT EXISTS legal_status varchar(64),
  ADD COLUMN IF NOT EXISTS effective_date timestamptz,
  ADD COLUMN IF NOT EXISTS expiry_date timestamptz,
  ADD COLUMN IF NOT EXISTS version varchar(64),
  ADD COLUMN IF NOT EXISTS source_authority varchar(255),
  ADD COLUMN IF NOT EXISTS celex_id varchar(64),
  ADD COLUMN IF NOT EXISTS canonical_url varchar(512),
  ADD COLUMN IF NOT EXISTS semantic_layer varchar(64),
  ADD COLUMN IF NOT EXISTS document_type varchar(128),
  ADD COLUMN IF NOT EXISTS parent_embedding_id integer,
  ADD COLUMN IF NOT EXISTS regulation_id integer,
  ADD COLUMN IF NOT EXISTS confidence_score numeric(5, 2),
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;

CREATE INDEX IF NOT EXISTS knowledge_embeddings_authority_level_idx
  ON knowledge_embeddings (authority_level);
CREATE INDEX IF NOT EXISTS knowledge_embeddings_semantic_layer_idx
  ON knowledge_embeddings (semantic_layer);
CREATE INDEX IF NOT EXISTS knowledge_embeddings_source_authority_idx
  ON knowledge_embeddings (source_authority);

ALTER TABLE regulations
  ADD COLUMN IF NOT EXISTS version varchar(64),
  ADD COLUMN IF NOT EXISTS status varchar(64),
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS parent_celex_id varchar(64);

ALTER TABLE gs1_standards
  ADD COLUMN IF NOT EXISTS version varchar(64),
  ADD COLUMN IF NOT EXISTS publication_date timestamptz,
  ADD COLUMN IF NOT EXISTS source_url varchar(512),
  ADD COLUMN IF NOT EXISTS publisher varchar(128),
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;
