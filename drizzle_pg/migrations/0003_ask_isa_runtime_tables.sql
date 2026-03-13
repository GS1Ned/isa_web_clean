DO $$
BEGIN
  CREATE TYPE qa_message_role AS ENUM ('user', 'assistant');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE ask_isa_feedback_type AS ENUM ('positive', 'negative');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS qa_conversations (
  id serial PRIMARY KEY,
  user_id integer,
  title varchar(255),
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qa_conversations_user_id_idx
  ON qa_conversations (user_id);

CREATE INDEX IF NOT EXISTS qa_conversations_created_at_idx
  ON qa_conversations (created_at);

CREATE TABLE IF NOT EXISTS qa_messages (
  id serial PRIMARY KEY,
  conversation_id integer NOT NULL REFERENCES qa_conversations(id) ON DELETE CASCADE,
  role qa_message_role NOT NULL,
  content text NOT NULL,
  sources jsonb,
  retrieved_chunks integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qa_messages_conversation_id_idx
  ON qa_messages (conversation_id);

CREATE INDEX IF NOT EXISTS qa_messages_created_at_idx
  ON qa_messages (created_at);

CREATE TABLE IF NOT EXISTS ask_isa_feedback (
  id serial PRIMARY KEY,
  question_id varchar(255) NOT NULL,
  user_id integer,
  question_text text NOT NULL,
  answer_text text NOT NULL,
  feedback_type ask_isa_feedback_type NOT NULL,
  feedback_comment text,
  prompt_variant varchar(50),
  confidence_score numeric(3,2),
  sources_count integer,
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ask_isa_feedback_question_id_idx
  ON ask_isa_feedback (question_id);

CREATE INDEX IF NOT EXISTS ask_isa_feedback_user_id_idx
  ON ask_isa_feedback (user_id);

CREATE INDEX IF NOT EXISTS ask_isa_feedback_feedback_type_idx
  ON ask_isa_feedback (feedback_type);

CREATE INDEX IF NOT EXISTS ask_isa_feedback_prompt_variant_idx
  ON ask_isa_feedback (prompt_variant);

CREATE INDEX IF NOT EXISTS ask_isa_feedback_timestamp_idx
  ON ask_isa_feedback ("timestamp");
