ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS dataset_id varchar(255),
  ADD COLUMN IF NOT EXISTS source_role varchar(64),
  ADD COLUMN IF NOT EXISTS source_locator varchar(1024),
  ADD COLUMN IF NOT EXISTS retrieved_at timestamptz,
  ADD COLUMN IF NOT EXISTS content_hash varchar(64),
  ADD COLUMN IF NOT EXISTS admission_basis varchar(64);

CREATE INDEX IF NOT EXISTS sources_dataset_id_idx ON sources (dataset_id);
CREATE INDEX IF NOT EXISTS sources_source_role_idx ON sources (source_role);

ALTER TABLE knowledge_embeddings
  ADD COLUMN IF NOT EXISTS source_chunk_id integer;

CREATE INDEX IF NOT EXISTS knowledge_embeddings_source_chunk_id_idx
  ON knowledge_embeddings (source_chunk_id);

DO $$
BEGIN
  ALTER TABLE knowledge_embeddings
    ADD CONSTRAINT knowledge_embeddings_source_chunk_id_fk
    FOREIGN KEY (source_chunk_id) REFERENCES source_chunks(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
