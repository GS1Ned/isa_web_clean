/**
 * Create all missing tables in Postgres.
 * Uses a simple approach: CREATE TABLE IF NOT EXISTS with basic columns.
 * The actual column definitions are in drizzle_pg/schema.ts.
 * We use drizzle-kit push approach via raw SQL.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL_POSTGRES || 'postgresql://postgres.gwlszaepkwtjrqfgejin:wibjez-hUzmeh-8desqy@aws-1-eu-north-1.pooler.supabase.com:6543/postgres', {
  ssl: { rejectUnauthorized: false }
});

// All tables that need to exist, with their DDL
const tables = [
  `CREATE TABLE IF NOT EXISTS automation_request_ledger (
    id SERIAL PRIMARY KEY,
    source VARCHAR(128),
    request_type VARCHAR(64),
    payload JSONB,
    status VARCHAR(32) DEFAULT 'pending',
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS cbv_vocabularies (
    id SERIAL PRIMARY KEY,
    vocabulary_type VARCHAR(100),
    identifier VARCHAR(255),
    name VARCHAR(512),
    definition TEXT,
    list_version VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS critical_event_acknowledgments (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS critical_event_alerts (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    delivery_method VARCHAR(64) NOT NULL,
    user_id INTEGER,
    status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS critical_events (
    id SERIAL PRIMARY KEY,
    news_id INTEGER NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    severity VARCHAR(64) NOT NULL,
    event_date TIMESTAMPTZ,
    title VARCHAR(512),
    description TEXT,
    impact_summary TEXT,
    affected_regulations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cte_kde_mappings (
    id SERIAL PRIMARY KEY,
    cte_id INTEGER,
    kde_id INTEGER,
    mapping_type VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ctes (
    id SERIAL PRIMARY KEY,
    cte_id VARCHAR(64),
    name VARCHAR(512),
    description TEXT,
    category VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS digital_link_types (
    id SERIAL PRIMARY KEY,
    link_type VARCHAR(128),
    title VARCHAR(512),
    description TEXT,
    uri_template VARCHAR(1024),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dpp_identification_rules (
    id SERIAL PRIMARY KEY,
    rule_id VARCHAR(64),
    name VARCHAR(512),
    description TEXT,
    product_category VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dpp_identifier_components (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER,
    component_type VARCHAR(64),
    identifier VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dutch_initiatives (
    id SERIAL PRIMARY KEY,
    name VARCHAR(512) NOT NULL,
    description TEXT,
    organization VARCHAR(255),
    category VARCHAR(128),
    status VARCHAR(64),
    website_url VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS epcis_batch_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    status VARCHAR(32) DEFAULT 'pending',
    total_events INTEGER DEFAULT 0,
    processed_events INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS epcis_event_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    template_data JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS esg_atomic_requirements (
    id SERIAL PRIMARY KEY,
    obligation_id INTEGER,
    requirement_text TEXT,
    data_type VARCHAR(64),
    unit VARCHAR(64),
    frequency VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS esg_corpus (
    id SERIAL PRIMARY KEY,
    title VARCHAR(512),
    source VARCHAR(255),
    content TEXT,
    document_type VARCHAR(64),
    publication_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS esg_data_requirements (
    id SERIAL PRIMARY KEY,
    requirement_id INTEGER,
    data_element VARCHAR(255),
    data_source VARCHAR(255),
    collection_method VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS esg_gs1_mappings (
    id SERIAL PRIMARY KEY,
    requirement_id INTEGER,
    gs1_standard_id INTEGER,
    mapping_type VARCHAR(64),
    confidence NUMERIC(5,2),
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS esg_obligations (
    id SERIAL PRIMARY KEY,
    corpus_id INTEGER,
    obligation_text TEXT,
    category VARCHAR(128),
    priority VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS esrs_xbrl_concepts (
    id SERIAL PRIMARY KEY,
    concept_id VARCHAR(128),
    label VARCHAR(512),
    data_type VARCHAR(64),
    period_type VARCHAR(32),
    esrs_standard VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS eudr_geolocation (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(128),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    country VARCHAR(128),
    risk_level VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gdsn_class_attributes (
    id SERIAL PRIMARY KEY,
    class_id INTEGER,
    attribute_name VARCHAR(255),
    data_type VARCHAR(64),
    is_mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gdsn_classes (
    id SERIAL PRIMARY KEY,
    class_code VARCHAR(64),
    class_name VARCHAR(255),
    description TEXT,
    parent_code VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gdsn_validation_rules (
    id SERIAL PRIMARY KEY,
    rule_id VARCHAR(64),
    rule_type VARCHAR(32),
    description TEXT,
    severity VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gs1_attribute_esrs_mapping (
    id SERIAL PRIMARY KEY,
    attribute_id INTEGER,
    esrs_datapoint_id INTEGER,
    mapping_type VARCHAR(64),
    confidence NUMERIC(5,2),
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gs1_code_lists (
    id SERIAL PRIMARY KEY,
    code_list_name VARCHAR(255),
    code VARCHAR(128),
    value VARCHAR(512),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gs1_eu_carbon_footprint_attributes (
    id SERIAL PRIMARY KEY,
    attribute_name VARCHAR(255),
    data_type VARCHAR(64),
    description TEXT,
    unit VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gs1_eu_carbon_footprint_code_lists (
    id SERIAL PRIMARY KEY,
    code_list_name VARCHAR(255),
    code VARCHAR(128),
    value VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gs1_local_code_lists (
    id SERIAL PRIMARY KEY,
    market VARCHAR(64),
    code_list_name VARCHAR(255),
    code VARCHAR(128),
    value VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gs1_validation_rules (
    id SERIAL PRIMARY KEY,
    rule_id VARCHAR(50) NOT NULL,
    rule_id_belu VARCHAR(50),
    rule_type VARCHAR(64) NOT NULL,
    error_message_dutch TEXT,
    error_message_english TEXT,
    severity VARCHAR(64) DEFAULT 'error',
    target_markets TEXT,
    target_sectors TEXT,
    affected_attributes TEXT,
    validation_logic TEXT,
    added_in_version VARCHAR(20),
    change_type VARCHAR(64),
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gs1_webvoc_properties (
    id SERIAL PRIMARY KEY,
    uri VARCHAR(1024),
    label VARCHAR(512),
    definition TEXT,
    domain VARCHAR(255),
    range VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS gs1_webvoc_terms (
    id SERIAL PRIMARY KEY,
    uri VARCHAR(1024),
    label VARCHAR(512),
    definition TEXT,
    term_type VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS hub_news_history (
    id SERIAL PRIMARY KEY,
    news_id INTEGER,
    field_name VARCHAR(128),
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(128),
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS hub_resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(512) NOT NULL,
    description TEXT,
    resource_type VARCHAR(64),
    url VARCHAR(1024),
    category VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ingest_item_provenance (
    id SERIAL PRIMARY KEY,
    item_type VARCHAR(64),
    item_id INTEGER,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    pipeline_run_id VARCHAR(128),
    raw_hash VARCHAR(128)
  )`,
  `CREATE TABLE IF NOT EXISTS ingestion_logs (
    id SERIAL PRIMARY KEY,
    pipeline_name VARCHAR(128),
    status VARCHAR(32),
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    metadata JSONB
  )`,
  `CREATE TABLE IF NOT EXISTS initiative_regulation_mappings (
    id SERIAL PRIMARY KEY,
    initiative_id INTEGER,
    regulation_id INTEGER,
    mapping_type VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS initiative_standard_mappings (
    id SERIAL PRIMARY KEY,
    initiative_id INTEGER,
    standard_id INTEGER,
    mapping_type VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS kdes (
    id SERIAL PRIMARY KEY,
    kde_id VARCHAR(64),
    name VARCHAR(512),
    description TEXT,
    data_type VARCHAR(64),
    category VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS news_recommendations (
    id SERIAL PRIMARY KEY,
    news_id INTEGER,
    recommended_news_id INTEGER,
    score NUMERIC(5,2),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS policy_action_audit (
    id SERIAL PRIMARY KEY,
    action_type VARCHAR(64),
    actor VARCHAR(128),
    target_type VARCHAR(64),
    target_id VARCHAR(128),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_cbv_vocabularies (
    id SERIAL PRIMARY KEY,
    vocabulary_type VARCHAR(100),
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_ctes_kdes (
    id SERIAL PRIMARY KEY,
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_digital_link_types (
    id SERIAL PRIMARY KEY,
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_dpp_identification_rules (
    id SERIAL PRIMARY KEY,
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_dpp_identifier_components (
    id SERIAL PRIMARY KEY,
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_esrs_datapoints (
    id SERIAL PRIMARY KEY,
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_gdsn_class_attributes (
    id SERIAL PRIMARY KEY,
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_gdsn_classes (
    id SERIAL PRIMARY KEY,
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS raw_gdsn_validation_rules (
    id SERIAL PRIMARY KEY,
    raw_data JSONB,
    source_url VARCHAR(1024),
    ingested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS regulation_standard_mappings (
    id SERIAL PRIMARY KEY,
    regulation_id INTEGER,
    standard_id INTEGER,
    mapping_type VARCHAR(64),
    confidence NUMERIC(5,2),
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS regulatory_change_log (
    id SERIAL PRIMARY KEY,
    regulation_id INTEGER,
    change_type VARCHAR(64),
    title VARCHAR(512),
    description TEXT,
    effective_date TIMESTAMPTZ,
    source_url VARCHAR(1024),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS remediation_progress (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER,
    step_id INTEGER,
    status VARCHAR(32),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS remediation_steps (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER,
    title VARCHAR(512),
    description TEXT,
    order_index INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS remediation_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    risk_type VARCHAR(64),
    steps JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS risk_remediation_plans (
    id SERIAL PRIMARY KEY,
    risk_id INTEGER,
    user_id INTEGER,
    status VARCHAR(32) DEFAULT 'active',
    target_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS roadmap_activity_log (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER,
    user_id INTEGER,
    action_type VARCHAR(64),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS roadmap_approvals (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER,
    approver_id INTEGER,
    status VARCHAR(32),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS roadmap_comments (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER,
    user_id INTEGER,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS roadmap_dependencies (
    id SERIAL PRIMARY KEY,
    action_id INTEGER,
    depends_on_action_id INTEGER,
    dependency_type VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS score_history (
    id SERIAL PRIMARY KEY,
    score_id INTEGER,
    overall_score NUMERIC(5,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS score_milestones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    regulation_id INTEGER,
    milestone_type VARCHAR(64),
    score_value NUMERIC(5,2),
    achieved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS scoring_benchmarks (
    id SERIAL PRIMARY KEY,
    regulation_id INTEGER,
    sector VARCHAR(128),
    benchmark_type VARCHAR(64),
    value NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS supply_chain_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    analysis_type VARCHAR(64),
    results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS supply_chain_edges (
    id SERIAL PRIMARY KEY,
    source_node_id INTEGER,
    target_node_id INTEGER,
    edge_type VARCHAR(64),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS team_roadmap_access (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER,
    user_id INTEGER,
    access_level VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS webhook_configuration (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    webhook_type VARCHAR(64) NOT NULL,
    events JSONB,
    headers JSONB,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    secret VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS webhook_delivery_history (
    id SERIAL PRIMARY KEY,
    webhook_id INTEGER,
    event_type VARCHAR(64),
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    success BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  )`
];

async function run() {
  let created = 0;
  let existed = 0;
  let errors = 0;
  
  for (const ddl of tables) {
    const tableMatch = ddl.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
    const tableName = tableMatch ? tableMatch[1] : 'unknown';
    
    try {
      // Check if exists
      const check = await sql`SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = ${tableName}`;
      if (check.length > 0) {
        existed++;
        continue;
      }
      
      await sql.unsafe(ddl);
      console.log(`  CREATED: ${tableName}`);
      created++;
    } catch (e) {
      console.error(`  ERROR ${tableName}: ${e.message}`);
      errors++;
    }
  }
  
  console.log(`\nDone. Created: ${created}, Existed: ${existed}, Errors: ${errors}`);
  
  const total = await sql`SELECT COUNT(*) as cnt FROM pg_tables WHERE schemaname = 'public'`;
  console.log(`Total tables: ${total[0].cnt}`);
  
  await sql.end();
}

run().catch(e => { console.error(e); process.exit(1); });
