/**
 * Create missing tables in Postgres for router compatibility.
 * These tables are needed by various routers but were not part of the initial 41-table migration.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES || 'postgresql://postgres.gwlszaepkwtjrqfgejin:wibjez-hUzmeh-8desqy@aws-1-eu-north-1.pooler.supabase.com:6543/postgres', {
  ssl: { rejectUnauthorized: false }
});

const tables = [
  {
    name: 'gs1_attribute_code_lists',
    ddl: `CREATE TABLE IF NOT EXISTS gs1_attribute_code_lists (
      id SERIAL PRIMARY KEY,
      attribute_id INTEGER REFERENCES gs1_attributes(id),
      code VARCHAR(128) NOT NULL,
      name VARCHAR(512) NOT NULL,
      description TEXT,
      source VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'gs1_web_vocabulary',
    ddl: `CREATE TABLE IF NOT EXISTS gs1_web_vocabulary (
      id SERIAL PRIMARY KEY,
      uri VARCHAR(1024) NOT NULL,
      label VARCHAR(512) NOT NULL,
      definition TEXT,
      comment TEXT,
      domain VARCHAR(255),
      range VARCHAR(255),
      super_property VARCHAR(1024),
      version VARCHAR(64),
      deprecated BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'attribute_regulation_mappings',
    ddl: `CREATE TABLE IF NOT EXISTS attribute_regulation_mappings (
      id SERIAL PRIMARY KEY,
      attribute_id INTEGER REFERENCES gs1_attributes(id),
      regulation_id INTEGER REFERENCES regulations(id),
      mapping_type VARCHAR(64),
      relevance_score NUMERIC(5,2),
      rationale TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'roadmap_templates',
    ddl: `CREATE TABLE IF NOT EXISTS roadmap_templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      regulation_type VARCHAR(64),
      sector VARCHAR(128),
      complexity VARCHAR(32),
      estimated_duration_weeks INTEGER,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'template_actions',
    ddl: `CREATE TABLE IF NOT EXISTS template_actions (
      id SERIAL PRIMARY KEY,
      template_id INTEGER REFERENCES roadmap_templates(id),
      title VARCHAR(512) NOT NULL,
      description TEXT,
      category VARCHAR(128),
      priority VARCHAR(32),
      estimated_effort_hours INTEGER,
      order_index INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'template_milestones',
    ddl: `CREATE TABLE IF NOT EXISTS template_milestones (
      id SERIAL PRIMARY KEY,
      template_id INTEGER REFERENCES roadmap_templates(id),
      title VARCHAR(512) NOT NULL,
      description TEXT,
      target_week INTEGER,
      order_index INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'template_usage',
    ddl: `CREATE TABLE IF NOT EXISTS template_usage (
      id SERIAL PRIMARY KEY,
      template_id INTEGER REFERENCES roadmap_templates(id),
      user_id INTEGER,
      roadmap_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'roadmap_milestones',
    ddl: `CREATE TABLE IF NOT EXISTS roadmap_milestones (
      id SERIAL PRIMARY KEY,
      roadmap_id INTEGER,
      title VARCHAR(512) NOT NULL,
      description TEXT,
      target_date TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      status VARCHAR(32) DEFAULT 'pending',
      order_index INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'compliance_scores',
    ddl: `CREATE TABLE IF NOT EXISTS compliance_scores (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      regulation_id INTEGER REFERENCES regulations(id),
      overall_score NUMERIC(5,2),
      data_readiness_score NUMERIC(5,2),
      process_maturity_score NUMERIC(5,2),
      documentation_score NUMERIC(5,2),
      assessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'compliance_evidence',
    ddl: `CREATE TABLE IF NOT EXISTS compliance_evidence (
      id SERIAL PRIMARY KEY,
      score_id INTEGER REFERENCES compliance_scores(id),
      requirement_id VARCHAR(128),
      evidence_type VARCHAR(64),
      description TEXT,
      status VARCHAR(32),
      verified_at TIMESTAMPTZ,
      verified_by INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'compliance_roadmaps',
    ddl: `CREATE TABLE IF NOT EXISTS compliance_roadmaps (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      regulation_id INTEGER REFERENCES regulations(id),
      template_id INTEGER,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(32) DEFAULT 'active',
      target_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'supply_chain_risks',
    ddl: `CREATE TABLE IF NOT EXISTS supply_chain_risks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      risk_type VARCHAR(64) NOT NULL,
      severity VARCHAR(32) NOT NULL,
      title VARCHAR(512) NOT NULL,
      description TEXT,
      affected_regulation_id INTEGER REFERENCES regulations(id),
      mitigation_status VARCHAR(32) DEFAULT 'open',
      detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      resolved_at TIMESTAMPTZ,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'epcis_events',
    ddl: `CREATE TABLE IF NOT EXISTS epcis_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(64) NOT NULL,
      event_time TIMESTAMPTZ NOT NULL,
      event_timezone VARCHAR(32),
      action VARCHAR(32),
      biz_step VARCHAR(512),
      disposition VARCHAR(512),
      read_point VARCHAR(512),
      biz_location VARCHAR(512),
      epc_list JSONB,
      quantity_list JSONB,
      source_list JSONB,
      destination_list JSONB,
      ilmd JSONB,
      extensions JSONB,
      raw_event JSONB,
      user_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  },
  {
    name: 'supply_chain_nodes',
    ddl: `CREATE TABLE IF NOT EXISTS supply_chain_nodes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      gln VARCHAR(64),
      name VARCHAR(512) NOT NULL,
      node_type VARCHAR(64),
      country VARCHAR(128),
      region VARCHAR(128),
      latitude NUMERIC(10,6),
      longitude NUMERIC(10,6),
      risk_level VARCHAR(32),
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    )`
  }
];

async function run() {
  let created = 0;
  let existed = 0;
  
  for (const table of tables) {
    try {
      // Check if table exists
      const check = await sql`SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = ${table.name}`;
      if (check.length > 0) {
        console.log(`  EXISTS: ${table.name}`);
        existed++;
        continue;
      }
      
      await sql.unsafe(table.ddl);
      console.log(`  CREATED: ${table.name}`);
      created++;
    } catch (e) {
      console.error(`  ERROR creating ${table.name}: ${e.message}`);
    }
  }
  
  console.log(`\nDone. Created: ${created}, Already existed: ${existed}`);
  
  // Verify total
  const total = await sql`SELECT COUNT(*) as cnt FROM pg_tables WHERE schemaname = 'public'`;
  console.log(`Total tables in Postgres: ${total[0].cnt}`);
  
  await sql.end();
}

run().catch(e => { console.error(e); process.exit(1); });
