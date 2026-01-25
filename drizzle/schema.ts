import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, int, varchar, text, timestamp, mysqlEnum, json, decimal, foreignKey, float, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const advisoryReportVersions = mysqlTable("advisory_report_versions", {
	id: int().autoincrement().notNull(),
	reportId: int().notNull(),
	version: varchar({ length: 32 }).notNull(),
	content: text().notNull(),
	changeLog: text(),
	createdBy: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("reportId_idx").on(table.reportId),
]);

export const advisoryReports = mysqlTable("advisory_reports", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 512 }).notNull(),
	reportType: mysqlEnum(['COMPLIANCE_ASSESSMENT','STANDARDS_MAPPING','REGULATION_IMPACT','IMPLEMENTATION_GUIDE','GAP_ANALYSIS','SECTOR_ADVISORY','CUSTOM']).notNull(),
	executiveSummary: text(),
	content: text().notNull(),
	findings: json(),
	recommendations: json(),
	targetRegulationIds: json(),
	targetStandardIds: json(),
	sectorTags: json(),
	gs1ImpactTags: json(),
	version: varchar({ length: 32 }).notNull(),
	generatedDate: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	generatedBy: varchar({ length: 255 }),
	llmModel: varchar({ length: 128 }),
	generationPrompt: text(),
	qualityScore: decimal({ precision: 3, scale: 2 }),
	reviewStatus: mysqlEnum(['DRAFT','UNDER_REVIEW','APPROVED','PUBLISHED','ARCHIVED']).default('DRAFT').notNull(),
	reviewedBy: varchar({ length: 255 }),
	reviewedAt: timestamp({ mode: 'string' }),
	reviewNotes: text(),
	publicationStatus: mysqlEnum(['INTERNAL_ONLY','READY_FOR_PUBLICATION','PUBLISHED','WITHDRAWN']).default('INTERNAL_ONLY').notNull(),
	laneStatus: mysqlEnum(['LANE_A','LANE_B','LANE_C']).default('LANE_C').notNull(),
	governanceNotes: text(),
	viewCount: int().default(0),
	downloadCount: int().default(0),
	lastAccessedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("reportType_idx").on(table.reportType),
	index("reviewStatus_idx").on(table.reviewStatus),
	index("publicationStatus_idx").on(table.publicationStatus),
	index("generatedDate_idx").on(table.generatedDate),
]);

export const askIsaFeedback = mysqlTable("ask_isa_feedback", {
	id: int().autoincrement().notNull(),
	questionId: varchar("question_id", { length: 255 }).notNull(),
	userId: int("user_id"),
	questionText: text("question_text").notNull(),
	answerText: text("answer_text").notNull(),
	feedbackType: mysqlEnum("feedback_type", ['positive','negative']).notNull(),
	feedbackComment: text("feedback_comment"),
	promptVariant: varchar("prompt_variant", { length: 50 }),
	confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
	sourcesCount: int("sources_count"),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("idx_question_id").on(table.questionId),
	index("idx_user_id").on(table.userId),
	index("idx_feedback_type").on(table.feedbackType),
	index("idx_prompt_variant").on(table.promptVariant),
	index("idx_timestamp").on(table.timestamp),
]);


export const attributeRegulationMappings = mysqlTable("attribute_regulation_mappings", {
	id: int().autoincrement().notNull(),
	attributeId: int().notNull(),
	regulationId: int().notNull(),
	esrsDatapointId: int(),
	mappingReason: text(),
	relevanceScore: decimal({ precision: 3, scale: 2 }).default('0.00'),
	verifiedByAdmin: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("attribute_id_idx").on(table.attributeId),
	index("regulation_id_idx").on(table.regulationId),
]);

export const cbvVocabularies = mysqlTable("cbv_vocabularies", {
	id: int().autoincrement().notNull(),
	vocabularyType: varchar("vocabulary_type", { length: 100 }).notNull(),
	code: varchar({ length: 255 }).notNull(),
	label: varchar({ length: 255 }).notNull(),
	definition: text(),
	regulationRelevance: json("regulation_relevance"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_cbv_type").on(table.vocabularyType),
	index("idx_cbv_code").on(table.code),
	index("unique_cbv_type_code_idx").on(table.vocabularyType, table.code),
]);

export const complianceEvidence = mysqlTable("compliance_evidence", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	stepId: int().notNull(),
	evidenceType: varchar({ length: 128 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	fileUrl: varchar({ length: 512 }),
	fileKey: varchar({ length: 512 }),
	mimeType: varchar({ length: 128 }),
	fileSize: int(),
	uploadedBy: varchar({ length: 255 }),
	verificationStatus: mysqlEnum(['pending','verified','rejected']).default('pending').notNull(),
	verifiedAt: timestamp({ mode: 'string' }),
	verifiedBy: varchar({ length: 255 }),
	verificationNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("stepId_idx").on(table.stepId),
	index("verificationStatus_idx").on(table.verificationStatus),
]);

export const complianceRoadmaps = mysqlTable("compliance_roadmaps", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	strategy: varchar({ length: 128 }).notNull(),
	targetScore: int().default(80),
	currentScore: decimal({ precision: 5, scale: 2 }).notNull(),
	projectedScore: decimal({ precision: 5, scale: 2 }).notNull(),
	status: varchar({ length: 32 }).default('draft'),
	startDate: timestamp({ mode: 'string' }).notNull(),
	targetCompletionDate: timestamp({ mode: 'string' }).notNull(),
	estimatedEffort: int(),
	estimatedImpact: decimal({ precision: 5, scale: 2 }),
	progressPercentage: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("status_idx").on(table.status),
]);

export const complianceScores = mysqlTable("compliance_scores", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	overallScore: decimal({ precision: 5, scale: 2 }).notNull(),
	riskManagementScore: decimal({ precision: 5, scale: 2 }).notNull(),
	remediationScore: decimal({ precision: 5, scale: 2 }).notNull(),
	evidenceScore: decimal({ precision: 5, scale: 2 }).notNull(),
	regulationScore: decimal({ precision: 5, scale: 2 }).notNull(),
	totalRisks: int().default(0),
	resolvedRisks: int().default(0),
	totalRemediationPlans: int().default(0),
	completedPlans: int().default(0),
	totalEvidence: int().default(0),
	verifiedEvidence: int().default(0),
	regulationsCovered: int().default(0),
	lastUpdated: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("overallScore_idx").on(table.overallScore),
]);

export const contacts = mysqlTable("contacts", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	company: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }),
	inquiryType: varchar({ length: 50 }).notNull(),
	message: text(),
	status: mysqlEnum(['new','contacted','converted','archived']).default('new').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const criticalEventAcknowledgments = mysqlTable("critical_event_acknowledgments", {
	id: int().autoincrement().notNull(),
	eventId: int().notNull(),
	userId: int().notNull(),
	viewedAt: timestamp({ mode: 'string' }).notNull(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	userNotes: text(),
	dismissed: tinyint().default(0),
	dismissalReason: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("eventId_idx").on(table.eventId),
	index("userId_idx").on(table.userId),
	index("acknowledgedAt_idx").on(table.acknowledgedAt),
]);

export const criticalEventAlerts = mysqlTable("critical_event_alerts", {
	id: int().autoincrement().notNull(),
	eventId: int().notNull(),
	deliveryMethod: mysqlEnum(['EMAIL','DASHBOARD_BANNER','DASHBOARD_NOTIFICATION','SLACK','TEAMS']).notNull(),
	userId: int(),
	status: mysqlEnum(['PENDING','SENT','DELIVERED','FAILED','BOUNCED']).default('PENDING').notNull(),
	errorMessage: text(),
	sentAt: timestamp({ mode: 'string' }),
	deliveredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("eventId_idx").on(table.eventId),
	index("userId_idx").on(table.userId),
	index("status_idx").on(table.status),
]);

export const criticalEvents = mysqlTable("critical_events", {
	id: int().autoincrement().notNull(),
	newsId: int().notNull(),
	eventType: mysqlEnum(['COMPLIANCE_DEADLINE','REGULATORY_AMENDMENT','CONSULTATION_PERIOD','NEW_REGULATION','GS1_STANDARD_UPDATE','ENFORCEMENT_ACTION','TECHNICAL_GUIDANCE','SECTOR_MANDATE']).notNull(),
	severity: mysqlEnum(['CRITICAL','HIGH','MEDIUM','LOW']).notNull(),
	eventDate: timestamp({ mode: 'string' }),
	daysUntilEvent: int(),
	detectionConfidence: decimal({ precision: 3, scale: 2 }),
	affectedRegulations: json(),
	affectedStandards: json(),
	affectedSectors: json(),
	actionRequired: text(),
	alertSent: tinyint().default(0),
	alertSentAt: timestamp({ mode: 'string' }),
	viewCount: int().default(0),
	acknowledgeCount: int().default(0),
	reviewed: tinyint().default(0),
	reviewNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("newsId_idx").on(table.newsId),
	index("eventType_idx").on(table.eventType),
	index("severity_idx").on(table.severity),
	index("eventDate_idx").on(table.eventDate),
	index("alertSent_idx").on(table.alertSent),
]);

export const cteKdeMappings = mysqlTable("cte_kde_mappings", {
	id: int().autoincrement().notNull(),
	cteId: int("cte_id").notNull(),
	kdeId: int("kde_id").notNull(),
	required: tinyint().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_cte_kde_cte").on(table.cteId),
	index("idx_cte_kde_kde").on(table.kdeId),
	index("unique_cte_kde_idx").on(table.cteId, table.kdeId),
]);

export const ctes = mysqlTable("ctes", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }),
	regulationContext: varchar("regulation_context", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_cte_code").on(table.code),
	index("idx_cte_category").on(table.category),
	index("code").on(table.code),
]);

export const datasetRegistry = mysqlTable("dataset_registry", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: mysqlEnum(['GS1_STANDARDS','GDSN_DATA','ESRS_DATAPOINTS','CBV_VOCABULARIES','DPP_RULES','EU_REGULATIONS','INDUSTRY_DATASETS','OTHER']).notNull(),
	source: varchar({ length: 512 }).notNull(),
	format: mysqlEnum(['JSON','CSV','XML','XLSX','PDF','API','OTHER']).notNull(),
	version: varchar({ length: 64 }),
	recordCount: int(),
	fileSize: int(),
	downloadUrl: varchar({ length: 512 }),
	apiEndpoint: varchar({ length: 512 }),
	lastVerifiedDate: timestamp({ mode: 'string' }),
	verifiedBy: varchar({ length: 255 }),
	verificationNotes: text(),
	isActive: tinyint().default(1).notNull(),
	metadata: json(),
	tags: json(),
	relatedRegulationIds: json(),
	relatedStandardIds: json(),
	governanceNotes: text(),
	laneStatus: mysqlEnum(['LANE_A','LANE_B','LANE_C']).default('LANE_C').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("category_idx").on(table.category),
	index("lastVerified_idx").on(table.lastVerifiedDate),
	index("isActive_idx").on(table.isActive),
]);

export const digitalLinkTypes = mysqlTable("digital_link_types", {
	id: int().autoincrement().notNull(),
	linkType: varchar("link_type", { length: 100 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	gs1Curie: varchar("gs1_curie", { length: 100 }),
	schemaOrgEquivalent: varchar("schema_org_equivalent", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_digital_link_type").on(table.linkType),
	index("link_type").on(table.linkType),
]);

export const dppIdentificationRules = mysqlTable("dpp_identification_rules", {
	id: int().autoincrement().notNull(),
	ruleCode: varchar("rule_code", { length: 100 }).notNull(),
	productCategory: varchar("product_category", { length: 255 }).notNull(),
	requiredComponents: json("required_components"),
	optionalComponents: json("optional_components"),
	description: text(),
	regulationContext: varchar("regulation_context", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_dpp_rule_code").on(table.ruleCode),
	index("idx_dpp_rule_category").on(table.productCategory),
	index("rule_code").on(table.ruleCode),
]);

export const dppIdentifierComponents = mysqlTable("dpp_identifier_components", {
	id: int().autoincrement().notNull(),
	componentCode: varchar("component_code", { length: 50 }).notNull(),
	componentName: varchar("component_name", { length: 255 }).notNull(),
	description: text(),
	gs1Standard: varchar("gs1_standard", { length: 100 }),
	format: varchar({ length: 100 }),
	example: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_dpp_comp_code").on(table.componentCode),
	index("component_code").on(table.componentCode),
]);

export const dutchInitiatives = mysqlTable("dutch_initiatives", {
	id: int().autoincrement().notNull(),
	initiativeName: varchar({ length: 255 }).notNull(),
	shortName: varchar({ length: 100 }).notNull(),
	initiativeType: varchar({ length: 100 }).notNull(),
	status: varchar({ length: 100 }).notNull(),
	sector: varchar({ length: 255 }).notNull(),
	scope: text().notNull(),
	startDate: timestamp({ mode: 'string' }),
	endDate: timestamp({ mode: 'string' }),
	reportingDeadline: varchar({ length: 255 }),
	keyTargets: json().notNull(),
	complianceRequirements: text().notNull(),
	gs1Relevance: text().notNull(),
	requiredGS1Standards: json(),
	requiredGDSNAttributes: json(),
	relatedEURegulations: json(),
	managingOrganization: varchar({ length: 255 }),
	officialUrl: varchar({ length: 500 }),
	documentationUrl: varchar({ length: 500 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("sector_idx").on(table.sector),
	index("status_idx").on(table.status),
]);

export const epcisBatchJobs = mysqlTable("epcis_batch_jobs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	fileSize: int().notNull(),
	status: mysqlEnum(['queued','processing','completed','failed']).default('queued').notNull(),
	totalEvents: int().default(0),
	processedEvents: int().default(0),
	failedEvents: int().default(0),
	errorMessage: text(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("status_idx").on(table.status),
	index("createdAt_idx").on(table.createdAt),
]);

export const epcisEventTemplates = mysqlTable("epcis_event_templates", {
	id: int().autoincrement().notNull(),
	templateName: varchar({ length: 255 }).notNull(),
	eventType: mysqlEnum(['object','aggregation','transformation','transaction','association']).notNull(),
	useCase: varchar({ length: 255 }),
	regulationId: int(),
	esrsDatapointId: int(),
	eventSchema: json().notNull(),
	cbvVocabulary: json(),
	description: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("use_case_idx").on(table.useCase),
	index("regulation_id_idx").on(table.regulationId),
]);

export const epcisEvents = mysqlTable("epcis_events", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	eventType: mysqlEnum(['ObjectEvent','AggregationEvent','TransactionEvent','TransformationEvent','AssociationEvent']).notNull(),
	eventTime: timestamp({ mode: 'string' }).notNull(),
	eventTimeZoneOffset: varchar({ length: 10 }),
	action: mysqlEnum(['OBSERVE','ADD','DELETE']),
	bizStep: varchar({ length: 255 }),
	disposition: varchar({ length: 255 }),
	readPoint: varchar({ length: 255 }),
	bizLocation: varchar({ length: 255 }),
	epcList: json(),
	quantityList: json(),
	sensorElementList: json(),
	sourceList: json(),
	destinationList: json(),
	ilmd: json(),
	rawEvent: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("eventTime_idx").on(table.eventTime),
	index("eventType_idx").on(table.eventType),
]);

export const esrsDatapoints = mysqlTable("esrs_datapoints", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 100 }).notNull(),
	esrsStandard: varchar("esrs_standard", { length: 50 }),
	disclosureRequirement: varchar("disclosure_requirement", { length: 100 }),
	paragraph: varchar({ length: 100 }),
	relatedAr: varchar("related_ar", { length: 100 }),
	name: text().notNull(),
	dataType: varchar("data_type", { length: 50 }),
	conditional: tinyint().default(0),
	voluntary: tinyint().default(0),
	sfdrMapping: varchar("sfdr_mapping", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_esrs_code").on(table.code),
	index("idx_esrs_standard").on(table.esrsStandard),
	index("code").on(table.code),
]);

export const esrsXbrlConcepts = mysqlTable("esrs_xbrl_concepts", {
	id: int().autoincrement().notNull(),
	datapointId: varchar({ length: 512 }).notNull(),
	datapointName: varchar({ length: 512 }).notNull(),
	namespace: varchar({ length: 512 }).notNull(),
	dataType: varchar({ length: 255 }),
	periodType: varchar({ length: 50 }),
	balance: varchar({ length: 50 }),
	isAbstract: tinyint().default(0).notNull(),
	isNillable: tinyint().default(0).notNull(),
	substitutionGroup: varchar({ length: 255 }),
	labelEn: text(),
	documentationEn: text(),
	terseLabelEn: text(),
	verboseLabelEn: text(),
	allLabels: json(),
	references: json(),
	taxonomyVersion: varchar({ length: 50 }).notNull(),
	taxonomyUrl: varchar({ length: 512 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("esrs_xbrl_concepts_datapointId_unique").on(table.datapointId),
	index("datapointName_idx").on(table.datapointName),
	index("namespace_idx").on(table.namespace),
	index("isAbstract_idx").on(table.isAbstract),
]);

export const eudrGeolocation = mysqlTable("eudr_geolocation", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	productGtin: varchar({ length: 14 }).notNull(),
	originLat: decimal({ precision: 10, scale: 8 }).notNull(),
	originLng: decimal({ precision: 11, scale: 8 }).notNull(),
	geofenceGeoJson: json(),
	deforestationRisk: mysqlEnum(['low','medium','high']),
	riskAssessmentDate: timestamp({ mode: 'string' }),
	dueDiligenceStatement: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("productGtin_idx").on(table.productGtin),
]);

export const gdsnClassAttributes = mysqlTable("gdsn_class_attributes", {
	id: int().autoincrement().notNull(),
	classId: int("class_id").notNull(),
	attributeCode: varchar("attribute_code", { length: 255 }).notNull(),
	attributeName: varchar("attribute_name", { length: 255 }),
	dataType: varchar("data_type", { length: 50 }),
	required: tinyint().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_gdsn_attr_class").on(table.classId),
	index("idx_gdsn_attr_code").on(table.attributeCode),
	index("unique_class_attr_idx").on(table.classId, table.attributeCode),
]);

export const gdsnClasses = mysqlTable("gdsn_classes", {
	id: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	definition: text(),
	type: int(),
	extensions: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_gdsn_class_name").on(table.name),
]);

export const gdsnValidationRules = mysqlTable("gdsn_validation_rules", {
	id: int().autoincrement().notNull(),
	ruleId: varchar("rule_id", { length: 255 }).notNull(),
	classId: int("class_id"),
	attributeCode: varchar("attribute_code", { length: 255 }),
	ruleType: varchar("rule_type", { length: 50 }),
	ruleExpression: text("rule_expression"),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_gdsn_rule_id").on(table.ruleId),
	index("idx_gdsn_rule_class").on(table.classId),
	index("idx_gdsn_rule_attr").on(table.attributeCode),
	index("rule_id").on(table.ruleId),
]);

export const governanceDocuments = mysqlTable("governance_documents", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 512 }).notNull(),
	documentType: mysqlEnum(['GS1_STANDARD','GS1_GUIDELINE','GS1_WHITE_PAPER','EU_REGULATION','EU_DIRECTIVE','EU_IMPLEMENTING_ACT','EU_DELEGATED_ACT','TECHNICAL_SPECIFICATION','INDUSTRY_GUIDANCE','OTHER']).notNull(),
	category: mysqlEnum(['IDENTIFICATION','CAPTURE','SHARE','ESG_REPORTING','TRACEABILITY','DIGITAL_PRODUCT_PASSPORT','CIRCULAR_ECONOMY','DUE_DILIGENCE','PACKAGING','OTHER']).notNull(),
	version: varchar({ length: 64 }),
	documentCode: varchar({ length: 128 }),
	publishedDate: timestamp({ mode: 'string' }),
	effectiveDate: timestamp({ mode: 'string' }),
	expiryDate: timestamp({ mode: 'string' }),
	description: text(),
	url: varchar({ length: 512 }).notNull(),
	downloadUrl: varchar({ length: 512 }),
	language: varchar({ length: 10 }).default('en').notNull(),
	status: mysqlEnum(['DRAFT','PUBLISHED','SUPERSEDED','WITHDRAWN','ARCHIVED']).default('PUBLISHED').notNull(),
	supersededBy: int(),
	isOfficial: tinyint().default(1).notNull(),
	lastVerifiedDate: timestamp({ mode: 'string' }),
	verifiedBy: varchar({ length: 255 }),
	currencyDisclaimer: text(),
	laneStatus: mysqlEnum(['LANE_A','LANE_B','LANE_C']).default('LANE_C').notNull(),
	relatedRegulationIds: json(),
	relatedStandardIds: json(),
	tags: json(),
	keywords: json(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("documentType_idx").on(table.documentType),
	index("category_idx").on(table.category),
	index("status_idx").on(table.status),
	index("publishedDate_idx").on(table.publishedDate),
	index("documentCode_idx").on(table.documentCode),
]);

export const gs1AttributeCodeLists = mysqlTable("gs1_attribute_code_lists", {
	id: int().autoincrement().notNull(),
	attributeId: int().notNull(),
	code: varchar({ length: 50 }).notNull(),
	description: text(),
	sortOrder: int().default(0),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("attribute_id_idx").on(table.attributeId),
]);

export const gs1AttributeEsrsMapping = mysqlTable("gs1_attribute_esrs_mapping", {
	id: int().autoincrement().notNull(),
	gs1AttributeId: varchar("gs1_attribute_id", { length: 255 }).notNull(),
	gs1AttributeName: varchar("gs1_attribute_name", { length: 255 }).notNull(),
	esrsMappingId: int("esrs_mapping_id").notNull(),
	mappingType: mysqlEnum("mapping_type", ['direct','calculated','aggregated']).notNull(),
	mappingNotes: text("mapping_notes"),
	confidence: mysqlEnum(['high','medium','low']).notNull(),
	validatedBy: varchar("validated_by", { length: 255 }),
	validatedAt: timestamp("validated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("idx_gs1_attr").on(table.gs1AttributeId),
	index("idx_esrs_mapping").on(table.esrsMappingId),
	index("idx_confidence").on(table.confidence),
]);

export const gs1Attributes = mysqlTable("gs1_attributes", {
	id: int().autoincrement().notNull(),
	attributeCode: varchar({ length: 100 }).notNull(),
	attributeName: varchar({ length: 255 }).notNull(),
	sector: mysqlEnum(['food_hb','diy_garden_pet','healthcare','agriculture']).notNull(),
	description: text(),
	datatype: mysqlEnum(['text','number','boolean','date','code_list','url','other']).notNull(),
	codeListId: int(),
	isMandatory: tinyint().default(0),
	esrsRelevance: text(),
	dppRelevance: text(),
	packagingRelated: tinyint().default(0),
	sustainabilityRelated: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("sector_idx").on(table.sector),
	index("packaging_idx").on(table.packagingRelated),
	index("sustainability_idx").on(table.sustainabilityRelated),
]);

export const gs1CodeLists = mysqlTable("gs1_code_lists", {
	id: int().autoincrement().notNull(),
	codeListType: varchar({ length: 255 }).notNull(),
	codeValue: varchar({ length: 512 }).notNull(),
	label: text(),
	description: text(),
	gs1Code: varchar({ length: 255 }),
	deprecated: tinyint().default(0).notNull(),
	esrsRelevance: varchar({ length: 50 }),
	vocabularyVersion: varchar({ length: 50 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("codeListType_idx").on(table.codeListType),
	index("codeValue_idx").on(table.codeValue),
	index("deprecated_idx").on(table.deprecated),
]);

export const gs1EsrsMappings = mysqlTable("gs1_esrs_mappings", {
	mappingId: int("mapping_id").notNull(),
	level: mysqlEnum(['product','company']).notNull(),
	esrsStandard: varchar("esrs_standard", { length: 50 }).notNull(),
	esrsTopic: varchar("esrs_topic", { length: 255 }).notNull(),
	dataPointName: text("data_point_name").notNull(),
	shortName: varchar("short_name", { length: 512 }).notNull(),
	definition: text().notNull(),
	gs1Relevance: text("gs1_relevance").notNull(),
	sourceDocument: varchar("source_document", { length: 255 }).default('GS1 Europe CSRD White Paper v1.0'),
	sourceDate: varchar("source_date", { length: 20 }).default('2025-03-21'),
	sourceAuthority: varchar("source_authority", { length: 100 }).default('GS1 in Europe'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const gs1EuCarbonFootprintAttributes = mysqlTable("gs1_eu_carbon_footprint_attributes", {
	id: int().autoincrement().notNull(),
	bmsId: varchar({ length: 10 }).notNull(),
	gdsnName: varchar({ length: 100 }).notNull(),
	attributeName: varchar({ length: 255 }).notNull(),
	className: mysqlEnum(['CarbonFootPrintHeader','CarbonFootprintDetail']).notNull(),
	definition: text().notNull(),
	instruction: text(),
	businessUsage: text(),
	dataType: mysqlEnum(['Code','Date','Numeric','Text']).notNull(),
	codeList: varchar({ length: 100 }),
	example: text(),
	mandatory: tinyint().default(0).notNull(),
	repeatable: tinyint().default(0).notNull(),
	sourceDocument: varchar({ length: 255 }).default('GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0').notNull(),
	sourcePublisher: varchar({ length: 100 }).default('GS1 in Europe').notNull(),
	sourceVersion: varchar({ length: 20 }).default('1.0').notNull(),
	sourceDate: varchar({ length: 20 }).default('2025-02').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("bmsId_idx").on(table.bmsId),
	index("gdsnName_idx").on(table.gdsnName),
	index("className_idx").on(table.className),
	index("bmsId").on(table.bmsId),
]);

export const gs1EuCarbonFootprintCodeLists = mysqlTable("gs1_eu_carbon_footprint_code_lists", {
	id: int().autoincrement().notNull(),
	codeListName: varchar({ length: 100 }).notNull(),
	attributeBmsId: varchar({ length: 10 }).notNull(),
	code: varchar({ length: 100 }).notNull(),
	definition: text().notNull(),
	sortOrder: int().default(0),
	isActive: tinyint().default(1).notNull(),
	sourceDocument: varchar({ length: 255 }).default('GDSN Implementation Guideline for exchanging Carbon Footprint Data v1.0').notNull(),
	sourceVersion: varchar({ length: 20 }).default('1.0').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("codeListName_idx").on(table.codeListName),
	index("attributeBmsId_idx").on(table.attributeBmsId),
	index("code_idx").on(table.code),
]);

export const gs1LocalCodeLists = mysqlTable("gs1_local_code_lists", {
	id: int().autoincrement().notNull(),
	validationRuleId: varchar({ length: 50 }).notNull(),
	codeListName: varchar({ length: 255 }).notNull(),
	codeValue: varchar({ length: 255 }).notNull(),
	codeDescription: text(),
	codeListSegment: varchar({ length: 255 }),
	addedInVersion: varchar({ length: 20 }),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("lcl_rule_id_idx").on(table.validationRuleId),
	index("lcl_code_list_idx").on(table.codeListName),
	index("lcl_active_idx").on(table.isActive),
]);

export const gs1Standards = mysqlTable("gs1_standards", {
	id: int().autoincrement().notNull(),
	standardCode: varchar({ length: 64 }).notNull(),
	standardName: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 128 }),
	scope: text(),
	referenceUrl: varchar({ length: 512 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	embedding: json(),
},
(table) => [
	index("gs1_standards_standardCode_unique").on(table.standardCode),
]);

export const gs1ValidationRules = mysqlTable("gs1_validation_rules", {
	id: int().autoincrement().notNull(),
	ruleId: varchar({ length: 50 }).notNull(),
	ruleIdBelu: varchar({ length: 50 }),
	ruleType: mysqlEnum(['benelux','gdsn','local']).notNull(),
	errorMessageDutch: text(),
	errorMessageEnglish: text(),
	severity: mysqlEnum(['error','warning','info']).default('error'),
	targetMarkets: text(),
	targetSectors: text(),
	affectedAttributes: text(),
	validationLogic: text(),
	addedInVersion: varchar({ length: 20 }),
	changeType: mysqlEnum(['new','technical','textual','delete']),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("rule_id_idx").on(table.ruleId),
	index("rule_type_idx").on(table.ruleType),
	index("active_idx").on(table.isActive),
]);

export const gs1WebVocabulary = mysqlTable("gs1_web_vocabulary", {
	id: int().autoincrement().notNull(),
	termUri: varchar({ length: 500 }).notNull(),
	termType: mysqlEnum(['class','property']).notNull(),
	termName: varchar({ length: 255 }).notNull(),
	label: varchar({ length: 500 }).notNull(),
	description: text(),
	domain: varchar({ length: 500 }),
	range: varchar({ length: 500 }),
	dppRelevant: tinyint().default(0),
	esrsRelevant: tinyint().default(0),
	eudrRelevant: tinyint().default(0),
	packagingRelated: tinyint().default(0),
	sustainabilityRelated: tinyint().default(0),
	isDeprecated: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("term_type_idx").on(table.termType),
	index("dpp_relevant_idx").on(table.dppRelevant),
	index("esrs_relevant_idx").on(table.esrsRelevant),
	index("eudr_relevant_idx").on(table.eudrRelevant),
	index("termUri").on(table.termUri),
]);

export const gs1WebvocProperties = mysqlTable("gs1_webvoc_properties", {
	id: int().autoincrement().notNull(),
	propertyId: varchar({ length: 512 }).notNull(),
	propertyName: varchar({ length: 255 }).notNull(),
	label: text(),
	description: text(),
	domain: varchar({ length: 512 }),
	range: varchar({ length: 512 }),
	propertyType: varchar({ length: 50 }),
	esrsTopic: varchar({ length: 50 }),
	esrsRelevance: varchar({ length: 50 }),
	vocabularyVersion: varchar({ length: 50 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("gs1_webvoc_properties_propertyId_unique").on(table.propertyId),
	index("propertyName_idx").on(table.propertyName),
	index("domain_idx").on(table.domain),
	index("esrsTopic_idx").on(table.esrsTopic),
]);

export const gs1WebvocTerms = mysqlTable("gs1_webvoc_terms", {
	id: int().autoincrement().notNull(),
	termId: varchar({ length: 512 }).notNull(),
	termType: varchar({ length: 255 }).notNull(),
	label: text(),
	comment: text(),
	domain: varchar({ length: 512 }),
	range: varchar({ length: 512 }),
	subClassOf: varchar({ length: 512 }),
	subPropertyOf: varchar({ length: 512 }),
	gs1Code: varchar({ length: 255 }),
	deprecated: tinyint().default(0).notNull(),
	jsonldEntry: json(),
	vocabularyVersion: varchar({ length: 50 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("gs1_webvoc_terms_termId_unique").on(table.termId),
	index("termType_idx").on(table.termType),
	index("label_idx").on(table.label),
	index("deprecated_idx").on(table.deprecated),
]);

export const hubNews = mysqlTable("hub_news", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 512 }).notNull(),
	summary: text(),
	content: text(),
	newsType: mysqlEnum(['NEW_LAW','AMENDMENT','ENFORCEMENT','COURT_DECISION','GUIDANCE','PROPOSAL']).notNull(),
	relatedRegulationIds: json(),
	sourceUrl: varchar({ length: 512 }),
	sourceTitle: varchar({ length: 255 }),
	credibilityScore: decimal({ precision: 3, scale: 2 }).default('0.00'),
	gs1ImpactTags: json(),
	sectorTags: json(),
	relatedStandardIds: json(),
	gs1ImpactAnalysis: text(),
	suggestedActions: json(),
	publishedDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	regulationTags: json(),
	impactLevel: mysqlEnum(['LOW','MEDIUM','HIGH']).default('MEDIUM'),
	sourceType: mysqlEnum(['EU_OFFICIAL','GS1_OFFICIAL','DUTCH_NATIONAL','INDUSTRY','MEDIA']).default('EU_OFFICIAL'),
	retrievedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	isAutomated: tinyint().default(0),
	sources: json(),
	// ChatGPT-recommended improvements for regulatory intelligence
	regulatoryState: mysqlEnum("regulatory_state", ['PROPOSAL','POLITICAL_AGREEMENT','ADOPTED','DELEGATED_ACT_DRAFT','DELEGATED_ACT_ADOPTED','GUIDANCE','ENFORCEMENT_SIGNAL','POSTPONED_OR_SOFTENED']).default('ADOPTED'),
	isNegativeSignal: tinyint("is_negative_signal").default(0),
	confidenceLevel: mysqlEnum("confidence_level", ['CONFIRMED_LAW','DRAFT_PROPOSAL','GUIDANCE_INTERPRETATION','MARKET_PRACTICE']).default('GUIDANCE_INTERPRETATION'),
	negativeSignalKeywords: json("negative_signal_keywords"),
	// Phase 2: Link to canonical regulatory event
	regulatoryEventId: int("regulatory_event_id"),
});

export const hubNewsHistory = mysqlTable("hub_news_history", {
	id: int().autoincrement().notNull(),
	originalId: int().notNull(),
	title: varchar({ length: 512 }).notNull(),
	summary: text(),
	content: text(),
	newsType: mysqlEnum(['NEW_LAW','AMENDMENT','ENFORCEMENT','COURT_DECISION','GUIDANCE','PROPOSAL']).notNull(),
	relatedRegulationIds: json(),
	regulationTags: json(),
	impactLevel: mysqlEnum(['LOW','MEDIUM','HIGH']).default('MEDIUM'),
	sourceUrl: varchar({ length: 512 }),
	sourceTitle: varchar({ length: 255 }),
	sourceType: mysqlEnum(['EU_OFFICIAL','GS1_OFFICIAL','DUTCH_NATIONAL','INDUSTRY','MEDIA']).default('EU_OFFICIAL'),
	credibilityScore: decimal({ precision: 3, scale: 2 }).default('0.00'),
	gs1ImpactTags: json(),
	publishedDate: timestamp({ mode: 'string' }),
	retrievedAt: timestamp({ mode: 'string' }).notNull(),
	isAutomated: tinyint().default(0),
	archivedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	originalCreatedAt: timestamp({ mode: 'string' }).notNull(),
	originalUpdatedAt: timestamp({ mode: 'string' }).notNull(),
	sources: json(),
	sectorTags: json(),
	relatedStandardIds: json(),
	gs1ImpactAnalysis: text(),
	suggestedActions: json(),
},
(table) => [
	index("idx_originalId").on(table.originalId),
	index("idx_publishedDate").on(table.publishedDate),
	index("idx_archivedAt").on(table.archivedAt),
]);

export const hubResources = mysqlTable("hub_resources", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 512 }).notNull(),
	description: text(),
	resourceType: mysqlEnum(['GUIDE','CHECKLIST','TEMPLATE','CASE_STUDY','WHITEPAPER','TOOL']).notNull(),
	relatedRegulationIds: json(),
	relatedStandardIds: json(),
	fileUrl: varchar({ length: 512 }),
	downloadCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const ingestionLogs = mysqlTable("ingestion_logs", {
	id: int().autoincrement().notNull(),
	syncStartTime: timestamp({ mode: 'string' }).notNull(),
	syncEndTime: timestamp({ mode: 'string' }),
	status: mysqlEnum(['pending','success','failed']).default('pending').notNull(),
	regulationsInserted: int().default(0).notNull(),
	regulationsUpdated: int().default(0).notNull(),
	regulationsTotal: int().default(0).notNull(),
	errors: int().default(0).notNull(),
	errorDetails: text(),
	durationSeconds: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("status_idx").on(table.status),
	index("syncStartTime_idx").on(table.syncStartTime),
]);

export const initiativeRegulationMappings = mysqlTable("initiative_regulation_mappings", {
	id: int().autoincrement().notNull(),
	initiativeId: int().notNull().references(() => dutchInitiatives.id),
	regulationId: int().notNull().references(() => regulations.id),
	relationshipType: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("initiativeId_idx").on(table.initiativeId),
	index("regulationId_idx").on(table.regulationId),
]);

export const initiativeStandardMappings = mysqlTable("initiative_standard_mappings", {
	id: int().autoincrement().notNull(),
	initiativeId: int().notNull().references(() => dutchInitiatives.id),
	standardId: int().notNull().references(() => gs1Standards.id),
	criticality: varchar({ length: 50 }).notNull(),
	implementationNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("initiativeId_idx").on(table.initiativeId),
	index("standardId_idx").on(table.standardId),
]);

export const kdes = mysqlTable("kdes", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	dataType: varchar("data_type", { length: 50 }),
	mandatory: tinyint().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_kde_code").on(table.code),
	index("code").on(table.code),
]);

export const knowledgeEmbeddings = mysqlTable("knowledge_embeddings", {
	id: int().autoincrement().notNull(),
	sourceType: mysqlEnum(['regulation','standard','esrs_datapoint','dutch_initiative','esrs_gs1_mapping']).notNull(),
	sourceId: int().notNull(),
	content: text().notNull(),
	contentHash: varchar({ length: 64 }).notNull(),
	embedding: json().notNull(),
	embeddingModel: varchar({ length: 64 }).default('text-embedding-3-small').notNull(),
	title: varchar({ length: 512 }).notNull(),
	url: varchar({ length: 512 }),
	datasetId: varchar({ length: 255 }),
	datasetVersion: varchar({ length: 64 }),
	lastVerifiedDate: timestamp({ mode: 'string' }),
	isDeprecated: tinyint().default(0).notNull(),
	deprecationReason: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("source_type_idx").on(table.sourceType),
	index("source_id_idx").on(table.sourceId),
	index("content_hash_idx").on(table.contentHash),
	index("source_composite_idx").on(table.sourceType, table.sourceId),
]);

export const mappingFeedback = mysqlTable("mapping_feedback", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	mappingId: int().notNull(),
	vote: tinyint().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("mappingId_idx").on(table.mappingId),
	index("unique_vote_idx").on(table.userId, table.mappingId),
]);

export const newsRecommendations = mysqlTable("news_recommendations", {
	id: int().autoincrement().notNull(),
	newsId: int("news_id").notNull(),
	resourceType: varchar("resource_type", { length: 50 }).notNull(),
	resourceId: int("resource_id").notNull(),
	resourceTitle: varchar("resource_title", { length: 512 }),
	relevanceScore: decimal("relevance_score", { precision: 3, scale: 2 }).notNull(),
	reasoning: text(),
	matchedKeywords: text("matched_keywords"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_news_id").on(table.newsId),
	index("idx_resource").on(table.resourceType, table.resourceId),
]);

export const notificationPreferences = mysqlTable("notification_preferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	riskDetected: tinyint().default(1),
	remediationUpdated: tinyint().default(1),
	commentAdded: tinyint().default(1),
	approvalRequested: tinyint().default(1),
	approvalDecision: tinyint().default(1),
	templateUpdated: tinyint().default(1),
	scoreChanged: tinyint().default(1),
	milestoneAchieved: tinyint().default(1),
	minSeverity: varchar({ length: 32 }).default('low'),
	inAppNotifications: tinyint().default(1),
	emailNotifications: tinyint().default(0),
	quietHoursEnabled: tinyint().default(0),
	quietHoursStart: varchar({ length: 5 }),
	quietHoursEnd: varchar({ length: 5 }),
	batchNotifications: tinyint().default(0),
	batchInterval: int().default(60),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("notification_preferences_userId_unique").on(table.userId),
	index("userId_idx").on(table.userId),
]);

export const pipelineExecutionLog = mysqlTable("pipeline_execution_log", {
	id: int().autoincrement().notNull(),
	executionId: varchar("execution_id", { length: 50 }).notNull(),
	pipelineType: varchar("pipeline_type", { length: 50 }).notNull(),
	triggeredBy: varchar("triggered_by", { length: 50 }).notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	durationMs: int("duration_ms"),
	status: varchar({ length: 20 }).notNull(),
	sourcesAttempted: int("sources_attempted").notNull(),
	sourcesSucceeded: int("sources_succeeded").notNull(),
	sourcesFailed: int("sources_failed").notNull(),
	itemsFetched: int("items_fetched").notNull(),
	itemsDeduplicated: int("items_deduplicated").notNull(),
	itemsProcessed: int("items_processed").notNull(),
	itemsSaved: int("items_saved").notNull(),
	itemsFailed: int("items_failed").notNull(),
	aiCallsMade: int("ai_calls_made").notNull(),
	aiCallsSucceeded: int("ai_calls_succeeded").notNull(),
	aiCallsFailed: int("ai_calls_failed").notNull(),
	aiAvgQualityScore: float("ai_avg_quality_score"),
	itemsWithSummary: int("items_with_summary").notNull(),
	itemsWithRegulationTags: int("items_with_regulation_tags").notNull(),
	itemsWithGs1ImpactTags: int("items_with_gs1_impact_tags").notNull(),
	itemsWithSectorTags: int("items_with_sector_tags").notNull(),
	itemsWithRecommendations: int("items_with_recommendations").notNull(),
	errorCount: int("error_count").default(0).notNull(),
	errorMessages: text("error_messages"),
	warnings: text(),
	configSnapshot: text("config_snapshot"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_started_at").on(table.startedAt),
	index("idx_status").on(table.status),
	index("idx_pipeline_type").on(table.pipelineType),
	index("idx_execution_id").on(table.executionId),
	index("execution_id").on(table.executionId),
]);

export const qaConversations = mysqlTable("qa_conversations", {
	id: int().autoincrement().notNull(),
	userId: int(),
	title: varchar({ length: 255 }),
	messageCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("user_id_idx").on(table.userId),
	index("created_at_idx").on(table.createdAt),
]);

export const qaMessages = mysqlTable("qa_messages", {
	id: int().autoincrement().notNull(),
	conversationId: int().notNull(),
	role: mysqlEnum(['user','assistant']).notNull(),
	content: text().notNull(),
	sources: json(),
	retrievedChunks: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("conversation_id_idx").on(table.conversationId),
	index("created_at_idx").on(table.createdAt),
]);

export const rawCbvVocabularies = mysqlTable("raw_cbv_vocabularies", {
	id: int().autoincrement().notNull(),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const rawCtesKdes = mysqlTable("raw_ctes_kdes", {
	id: int().autoincrement().notNull(),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const rawDigitalLinkTypes = mysqlTable("raw_digital_link_types", {
	id: int().autoincrement().notNull(),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const rawDppIdentificationRules = mysqlTable("raw_dpp_identification_rules", {
	id: int().autoincrement().notNull(),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const rawDppIdentifierComponents = mysqlTable("raw_dpp_identifier_components", {
	id: int().autoincrement().notNull(),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const rawEsrsDatapoints = mysqlTable("raw_esrs_datapoints", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 100 }).notNull(),
	esrsStandard: varchar("esrs_standard", { length: 50 }),
	disclosureRequirement: varchar("disclosure_requirement", { length: 100 }),
	paragraph: varchar({ length: 100 }),
	relatedAr: varchar("related_ar", { length: 100 }),
	name: text().notNull(),
	dataTypeRaw: varchar("data_type_raw", { length: 100 }),
	conditionalRaw: tinyint("conditional_raw").default(0),
	voluntaryRaw: tinyint("voluntary_raw").default(0),
	sfdrMapping: varchar("sfdr_mapping", { length: 255 }),
	sheetName: varchar("sheet_name", { length: 50 }),
	rowIndex: int("row_index"),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_raw_esrs_code").on(table.code),
	index("idx_raw_esrs_sheet").on(table.sheetName),
]);

export const rawGdsnClassAttributes = mysqlTable("raw_gdsn_class_attributes", {
	id: int().autoincrement().notNull(),
	classId: int("class_id").notNull(),
	attributeCode: varchar("attribute_code", { length: 255 }).notNull(),
	attributeName: varchar("attribute_name", { length: 255 }),
	dataType: varchar("data_type", { length: 50 }),
	required: tinyint().default(0),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_raw_gdsn_attr_class").on(table.classId),
	index("idx_raw_gdsn_attr_code").on(table.attributeCode),
]);

export const rawGdsnClasses = mysqlTable("raw_gdsn_classes", {
	id: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	definition: text(),
	type: int(),
	extensions: json(),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_raw_gdsn_class_name").on(table.name),
]);

export const rawGdsnValidationRules = mysqlTable("raw_gdsn_validation_rules", {
	id: int().autoincrement().notNull(),
	ruleId: varchar("rule_id", { length: 255 }).notNull(),
	classId: int("class_id"),
	attributeCode: varchar("attribute_code", { length: 255 }),
	ruleType: varchar("rule_type", { length: 50 }),
	ruleExpression: text("rule_expression"),
	errorMessage: text("error_message"),
	rawJson: json("raw_json"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_raw_gdsn_rule_id").on(table.ruleId),
	index("idx_raw_gdsn_rule_class").on(table.classId),
]);

export const regulationEsrsMappings = mysqlTable("regulation_esrs_mappings", {
	id: int().autoincrement().notNull(),
	regulationId: int().notNull(),
	datapointId: int().notNull(),
	relevanceScore: int().default(5).notNull(),
	reasoning: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("regulationId_idx").on(table.regulationId),
	index("datapointId_idx").on(table.datapointId),
	index("unique_mapping_idx").on(table.regulationId, table.datapointId),
]);

export const regulationStandardMappings = mysqlTable("regulation_standard_mappings", {
	id: int().autoincrement().notNull(),
	regulationId: int().notNull(),
	standardId: int().notNull(),
	relevanceScore: decimal({ precision: 3, scale: 2 }).default('0.00'),
	mappingReason: text(),
	detectedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	verifiedByAdmin: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const regulations = mysqlTable("regulations", {
	id: int().autoincrement().notNull(),
	celexId: varchar({ length: 64 }),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	regulationType: mysqlEnum(['CSRD','ESRS','DPP','EUDR','ESPR','PPWR','EU_TAXONOMY','OTHER']).notNull(),
	effectiveDate: timestamp({ mode: 'string' }),
	sourceUrl: varchar({ length: 512 }),
	lastUpdated: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	embedding: json(),
},
(table) => [
	index("regulations_celexId_unique").on(table.celexId),
]);

export const regulatoryChangeAlerts = mysqlTable("regulatory_change_alerts", {
	id: int().autoincrement().notNull(),
	regulationId: int().notNull(),
	changeType: mysqlEnum(['NEW','UPDATED','EFFECTIVE_DATE_CHANGED','SCOPE_EXPANDED','DEPRECATED']).notNull(),
	changeDescription: text(),
	affectedStandardsCount: int().default(0),
	severity: mysqlEnum(['LOW','MEDIUM','HIGH','CRITICAL']).default('MEDIUM'),
	detectedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const regulatoryChangeLog = mysqlTable("regulatory_change_log", {
	id: int().autoincrement().notNull(),
	entryDate: timestamp({ mode: 'string' }).notNull(),
	sourceType: mysqlEnum(['EU_DIRECTIVE','EU_REGULATION','EU_DELEGATED_ACT','EU_IMPLEMENTING_ACT','EFRAG_IG','EFRAG_QA','EFRAG_TAXONOMY','GS1_AISBL','GS1_EUROPE','GS1_NL']).notNull(),
	sourceOrg: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 512 }).notNull(),
	description: text().notNull(),
	url: varchar({ length: 512 }).notNull(),
	documentHash: varchar({ length: 64 }),
	impactAssessment: text(),
	isaVersionAffected: varchar({ length: 16 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("entryDate_idx").on(table.entryDate),
	index("sourceType_idx").on(table.sourceType),
	index("isaVersion_idx").on(table.isaVersionAffected),
]);

export const remediationProgress = mysqlTable("remediation_progress", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	planId: int().notNull(),
	totalSteps: int().notNull(),
	completedSteps: int().default(0),
	evidenceSubmitted: int().default(0),
	evidenceVerified: int().default(0),
	progressPercentage: int().default(0),
	lastUpdated: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("planId_idx").on(table.planId),
]);

export const remediationSteps = mysqlTable("remediation_steps", {
	id: int().autoincrement().notNull(),
	planId: int().notNull(),
	stepNumber: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	requiredEvidence: text(),
	status: mysqlEnum(['pending','in_progress','completed','skipped']).default('pending').notNull(),
	assignedTo: varchar({ length: 255 }),
	dueDate: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("planId_idx").on(table.planId),
	index("status_idx").on(table.status),
]);

export const remediationTemplates = mysqlTable("remediation_templates", {
	id: int().autoincrement().notNull(),
	riskType: varchar({ length: 128 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	steps: json().notNull(),
	estimatedDays: int(),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("riskType_idx").on(table.riskType),
]);

export const riskRemediationPlans = mysqlTable("risk_remediation_plans", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	riskId: int().notNull(),
	status: mysqlEnum(['draft','in_progress','completed','cancelled']).default('draft').notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	targetCompletionDate: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("riskId_idx").on(table.riskId),
	index("status_idx").on(table.status),
]);

export const roadmapActions = mysqlTable("roadmap_actions", {
	id: int().autoincrement().notNull(),
	roadmapId: int().notNull(),
	actionType: varchar({ length: 128 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	priority: varchar({ length: 32 }).notNull(),
	sequenceNumber: int().notNull(),
	estimatedEffort: int(),
	estimatedImpact: decimal({ precision: 5, scale: 2 }),
	startDate: timestamp({ mode: 'string' }).notNull(),
	targetDate: timestamp({ mode: 'string' }).notNull(),
	status: varchar({ length: 32 }).default('pending'),
	relatedRiskId: int(),
	relatedPlanId: int(),
	successCriteria: text(),
	blockers: text(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("roadmapId_idx").on(table.roadmapId),
	index("priority_idx").on(table.priority),
	index("status_idx").on(table.status),
]);

export const roadmapActivityLog = mysqlTable("roadmap_activity_log", {
	id: int().autoincrement().notNull(),
	roadmapId: int().notNull(),
	userId: int().notNull(),
	activityType: varchar({ length: 64 }).notNull(),
	description: text(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("roadmapId_idx").on(table.roadmapId),
	index("userId_idx").on(table.userId),
	index("activityType_idx").on(table.activityType),
]);

export const roadmapApprovals = mysqlTable("roadmap_approvals", {
	id: int().autoincrement().notNull(),
	roadmapId: int().notNull(),
	actionId: int(),
	requiredApproverId: int().notNull(),
	approverRole: varchar({ length: 64 }),
	status: varchar({ length: 32 }).default('pending'),
	approvedAt: timestamp({ mode: 'string' }),
	approverComments: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("roadmapId_idx").on(table.roadmapId),
	index("requiredApproverId_idx").on(table.requiredApproverId),
	index("status_idx").on(table.status),
]);

export const roadmapComments = mysqlTable("roadmap_comments", {
	id: int().autoincrement().notNull(),
	roadmapId: int().notNull(),
	actionId: int(),
	userId: int().notNull(),
	content: text().notNull(),
	isApproval: tinyint().default(0),
	approvalStatus: varchar({ length: 32 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("roadmapId_idx").on(table.roadmapId),
	index("actionId_idx").on(table.actionId),
	index("userId_idx").on(table.userId),
]);

export const roadmapDependencies = mysqlTable("roadmap_dependencies", {
	id: int().autoincrement().notNull(),
	fromActionId: int().notNull(),
	toActionId: int().notNull(),
	dependencyType: varchar({ length: 64 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("fromActionId_idx").on(table.fromActionId),
	index("toActionId_idx").on(table.toActionId),
]);

export const roadmapMilestones = mysqlTable("roadmap_milestones", {
	id: int().autoincrement().notNull(),
	roadmapId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	targetDate: timestamp({ mode: 'string' }).notNull(),
	targetScore: decimal({ precision: 5, scale: 2 }).notNull(),
	completedDate: timestamp({ mode: 'string' }),
	status: varchar({ length: 32 }).default('pending'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("roadmapId_idx").on(table.roadmapId),
]);

export const roadmapTemplates = mysqlTable("roadmap_templates", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 64 }).notNull(),
	strategy: varchar({ length: 32 }).notNull(),
	estimatedEffort: int().notNull(),
	estimatedImpact: decimal({ precision: 5, scale: 2 }),
	targetScore: decimal({ precision: 5, scale: 2 }),
	isPublic: tinyint().default(1),
	createdBy: int().notNull(),
	usageCount: int().default(0),
	rating: decimal({ precision: 3, scale: 2 }).default('0.00'),
	tags: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("category_idx").on(table.category),
	index("createdBy_idx").on(table.createdBy),
]);

export const scoreHistory = mysqlTable("score_history", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	overallScore: decimal({ precision: 5, scale: 2 }).notNull(),
	riskManagementScore: decimal({ precision: 5, scale: 2 }).notNull(),
	remediationScore: decimal({ precision: 5, scale: 2 }).notNull(),
	evidenceScore: decimal({ precision: 5, scale: 2 }).notNull(),
	regulationScore: decimal({ precision: 5, scale: 2 }).notNull(),
	changeReason: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("createdAt_idx").on(table.createdAt),
]);

export const scoreMilestones = mysqlTable("score_milestones", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	milestoneType: varchar({ length: 128 }).notNull(),
	milestoneTitle: varchar({ length: 255 }).notNull(),
	description: text(),
	achievedAt: timestamp({ mode: 'string' }).notNull(),
	badge: varchar({ length: 128 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("achievedAt_idx").on(table.achievedAt),
]);

export const scoringBenchmarks = mysqlTable("scoring_benchmarks", {
	id: int().autoincrement().notNull(),
	industry: varchar({ length: 128 }).notNull(),
	region: varchar({ length: 128 }).notNull(),
	avgOverallScore: decimal({ precision: 5, scale: 2 }).notNull(),
	avgRiskManagementScore: decimal({ precision: 5, scale: 2 }).notNull(),
	avgRemediationScore: decimal({ precision: 5, scale: 2 }).notNull(),
	avgEvidenceScore: decimal({ precision: 5, scale: 2 }).notNull(),
	avgRegulationScore: decimal({ precision: 5, scale: 2 }).notNull(),
	percentile75: decimal({ precision: 5, scale: 2 }).notNull(),
	percentile90: decimal({ precision: 5, scale: 2 }).notNull(),
	dataPoints: int().default(0),
	lastUpdated: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("industry_region_idx").on(table.industry, table.region),
]);

export const scraperExecutions = mysqlTable("scraper_executions", {
	id: int().autoincrement().notNull(),
	sourceId: varchar("source_id", { length: 64 }).notNull(),
	sourceName: varchar("source_name", { length: 255 }).notNull(),
	success: tinyint().notNull(),
	itemsFetched: int("items_fetched").default(0).notNull(),
	errorMessage: text("error_message"),
	attempts: int().default(1).notNull(),
	durationMs: int("duration_ms"),
	triggeredBy: mysqlEnum("triggered_by", ['cron','manual','api']).default('cron').notNull(),
	executionId: varchar("execution_id", { length: 64 }),
	startedAt: timestamp("started_at", { mode: 'string' }).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_source_id").on(table.sourceId),
	index("idx_execution_id").on(table.executionId),
	index("idx_started_at").on(table.startedAt),
]);

export const scraperHealthSummary = mysqlTable("scraper_health_summary", {
	id: int().autoincrement().notNull(),
	sourceId: varchar("source_id", { length: 64 }).notNull(),
	sourceName: varchar("source_name", { length: 255 }).notNull(),
	successRate24H: int("success_rate_24h").default(100).notNull(),
	totalExecutions24H: int("total_executions_24h").default(0).notNull(),
	failedExecutions24H: int("failed_executions_24h").default(0).notNull(),
	avgItemsFetched24H: int("avg_items_fetched_24h").default(0).notNull(),
	avgDurationMs24H: int("avg_duration_ms_24h"),
	lastExecutionSuccess: tinyint("last_execution_success"),
	lastExecutionAt: timestamp("last_execution_at", { mode: 'string' }),
	lastSuccessAt: timestamp("last_success_at", { mode: 'string' }),
	lastErrorMessage: text("last_error_message"),
	consecutiveFailures: int("consecutive_failures").default(0).notNull(),
	alertSent: tinyint("alert_sent").default(0).notNull(),
	alertSentAt: timestamp("alert_sent_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_source_id").on(table.sourceId),
	index("idx_last_execution_at").on(table.lastExecutionAt),
	index("source_id").on(table.sourceId),
]);

export const supplyChainAnalytics = mysqlTable("supply_chain_analytics", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	metricDate: timestamp({ mode: 'string' }).notNull(),
	totalEvents: int().default(0),
	totalNodes: int().default(0),
	totalEdges: int().default(0),
	highRiskNodes: int().default(0),
	averageTraceabilityScore: decimal({ precision: 5, scale: 2 }),
	complianceScore: decimal({ precision: 5, scale: 2 }),
	lastUpdated: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("metricDate_idx").on(table.metricDate),
]);

export const supplyChainEdges = mysqlTable("supply_chain_edges", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	fromNodeId: int().notNull(),
	toNodeId: int().notNull(),
	productGtin: varchar({ length: 14 }),
	relationshipType: mysqlEnum(['supplies','manufactures','distributes','retails']).notNull(),
	lastTransactionDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("fromNode_idx").on(table.fromNodeId),
	index("toNode_idx").on(table.toNodeId),
]);

export const supplyChainNodes = mysqlTable("supply_chain_nodes", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	nodeType: mysqlEnum(['supplier','manufacturer','distributor','retailer','recycler']).notNull(),
	gln: varchar({ length: 255 }),
	name: varchar({ length: 255 }).notNull(),
	tierLevel: int(),
	locationLat: decimal({ precision: 10, scale: 8 }),
	locationLng: decimal({ precision: 11, scale: 8 }),
	riskLevel: mysqlEnum(['low','medium','high']),
	riskFactors: json(),
	certifications: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("gln_idx").on(table.gln),
]);

export const supplyChainRisks = mysqlTable("supply_chain_risks", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	eventId: int().notNull(),
	nodeId: int(),
	riskType: mysqlEnum(['deforestation','labor','environmental','traceability','certification','geolocation']).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).notNull(),
	description: text().notNull(),
	regulationId: int(),
	recommendedAction: text(),
	isResolved: tinyint().default(0),
	resolvedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("userId_idx").on(table.userId),
	index("eventId_idx").on(table.eventId),
	index("nodeId_idx").on(table.nodeId),
	index("severity_idx").on(table.severity),
	index("riskType_idx").on(table.riskType),
]);

export const teamRoadmapAccess = mysqlTable("team_roadmap_access", {
	id: int().autoincrement().notNull(),
	roadmapId: int().notNull(),
	userId: int().notNull(),
	accessLevel: varchar({ length: 32 }).notNull(),
	grantedBy: int().notNull(),
	grantedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("roadmapId_idx").on(table.roadmapId),
	index("userId_idx").on(table.userId),
]);

export const templateActions = mysqlTable("template_actions", {
	id: int().autoincrement().notNull(),
	templateId: int().notNull(),
	sequenceNumber: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	actionType: varchar({ length: 64 }).notNull(),
	priority: varchar({ length: 32 }).notNull(),
	estimatedEffort: int().notNull(),
	estimatedImpact: decimal({ precision: 5, scale: 2 }),
	successCriteria: text(),
	relatedStandards: json(),
},
(table) => [
	index("templateId_idx").on(table.templateId),
]);

export const templateMilestones = mysqlTable("template_milestones", {
	id: int().autoincrement().notNull(),
	templateId: int().notNull(),
	sequenceNumber: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	targetScore: decimal({ precision: 5, scale: 2 }).notNull(),
	daysFromStart: int().notNull(),
},
(table) => [
	index("templateId_idx").on(table.templateId),
]);

export const templateUsage = mysqlTable("template_usage", {
	id: int().autoincrement().notNull(),
	templateId: int().notNull(),
	userId: int().notNull(),
	roadmapId: int().notNull(),
	rating: int(),
	feedback: text(),
	usedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("templateId_idx").on(table.templateId),
	index("userId_idx").on(table.userId),
]);

export const userAlerts = mysqlTable("user_alerts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	alertType: mysqlEnum(['REGULATION_UPDATE','DEADLINE_APPROACHING','NEW_REGULATION','ENFORCEMENT_ACTION']).notNull(),
	regulationId: int(),
	standardId: int(),
	daysBeforeDeadline: int(),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const userAnalyses = mysqlTable("user_analyses", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	regulationId: int(),
	documentTitle: varchar({ length: 255 }),
	documentUrl: varchar({ length: 512 }),
	analysisType: mysqlEnum(['CELEX','DOCUMENT_UPLOAD','URL','TEXT']).notNull(),
	detectedStandardsCount: int().default(0),
	analysisResult: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const userPreferences = mysqlTable("user_preferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	interestedRegulations: json(),
	interestedStandards: json(),
	notificationsEnabled: tinyint().default(1),
	industryFocus: varchar({ length: 128 }),
	companySize: mysqlEnum(['STARTUP','SME','ENTERPRISE','OTHER']),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("user_preferences_userId_unique").on(table.userId),
]);

export const userSavedItems = mysqlTable("user_saved_items", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	itemType: mysqlEnum(['REGULATION','NEWS','RESOURCE']).notNull(),
	itemId: int().notNull(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

// Type exports for commonly used tables
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Regulation = typeof regulations.$inferSelect;
export type InsertRegulation = typeof regulations.$inferInsert;

export type GS1Standard = typeof gs1Standards.$inferSelect;
export type InsertGS1Standard = typeof gs1Standards.$inferInsert;

export type HubNews = typeof hubNews.$inferSelect;
export type InsertHubNews = typeof hubNews.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;


// Error Tracking Table
export const errorLog = mysqlTable("error_log", {
	id: int().autoincrement().notNull(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	severity: mysqlEnum(['critical', 'error', 'warning', 'info']).notNull(),
	message: text().notNull(),
	operation: varchar({ length: 255 }).notNull(),
	stackTrace: text(),
	context: json(),
	userId: int(),
	requestId: varchar({ length: 128 }),
	resolved: tinyint().default(0).notNull(),
	resolvedAt: timestamp({ mode: 'string' }),
	resolvedBy: varchar({ length: 255 }),
	notes: text(),
},
(table) => [
	index("timestamp_idx").on(table.timestamp),
	index("severity_idx").on(table.severity),
	index("operation_idx").on(table.operation),
	index("userId_idx").on(table.userId),
]);

// Performance Tracking Table
export const performanceLog = mysqlTable("performance_log", {
	id: int().autoincrement().notNull(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	operation: varchar({ length: 255 }).notNull(),
	duration: int().notNull(), // milliseconds
	success: tinyint().default(1).notNull(),
	userId: int(),
	requestId: varchar({ length: 128 }),
	metadata: json(),
},
(table) => [
	index("timestamp_idx").on(table.timestamp),
	index("operation_idx").on(table.operation),
	index("duration_idx").on(table.duration),
	index("userId_idx").on(table.userId),
]);

// Alert History Table
export const alertHistory = mysqlTable("alert_history", {
	id: int().autoincrement().notNull(),
	alertType: varchar("alert_type", { length: 50 }).notNull(), // 'error_rate', 'critical_error', 'performance_degradation'
	severity: varchar({ length: 20 }).notNull(), // 'info', 'warning', 'critical'
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	metadata: json(), // { errorRate, operations, thresholds, etc. }
	notificationSent: tinyint("notification_sent").default(0).notNull(), // 0 = false, 1 = true
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	acknowledgedBy: int("acknowledged_by"), // userId
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("alert_type_idx").on(table.alertType),
	index("severity_idx").on(table.severity),
	index("created_at_idx").on(table.createdAt),
	index("acknowledged_at_idx").on(table.acknowledgedAt),
]);

// Alert Cooldowns Table
export const alertCooldowns = mysqlTable("alert_cooldowns", {
	id: int().autoincrement().notNull(),
	alertType: varchar("alert_type", { length: 50 }).notNull(),
	alertKey: varchar("alert_key", { length: 255 }).notNull(), // e.g., 'error_rate' or 'performance_degradation:operation_name'
	lastTriggeredAt: timestamp("last_triggered_at", { mode: 'string' }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("alert_type_key_idx").on(table.alertType, table.alertKey),
	index("expires_at_idx").on(table.expiresAt),
]);

export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = typeof alertHistory.$inferInsert;
export type AlertCooldown = typeof alertCooldowns.$inferSelect;
export type InsertAlertCooldown = typeof alertCooldowns.$inferInsert;


// Webhook Configuration Table
export const webhookConfiguration = mysqlTable("webhook_configuration", {
	id: int().autoincrement().notNull(),
	platform: mysqlEnum("platform", ["slack", "teams"]).notNull(),
	webhookUrl: text("webhook_url").notNull(),
	channelName: varchar("channel_name", { length: 255 }),
	enabled: tinyint("enabled").default(1).notNull(), // 0 = false, 1 = true
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("platform_idx").on(table.platform),
	index("enabled_idx").on(table.enabled),
]);

// Webhook Delivery History Table
export const webhookDeliveryHistory = mysqlTable("webhook_delivery_history", {
	id: int().autoincrement().notNull(),
	platform: mysqlEnum("platform", ["slack", "teams"]).notNull(),
	webhookUrl: text("webhook_url").notNull(),
	severity: mysqlEnum("severity", ["info", "warning", "critical"]).notNull(),
	title: text("title").notNull(),
	message: text("message").notNull(),
	success: tinyint("success").notNull(), // 0 = false, 1 = true
	statusCode: int("status_code"),
	attempts: int("attempts").default(1),
	error: text("error"),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("platform_idx").on(table.platform),
	index("delivered_at_idx").on(table.deliveredAt),
	index("success_idx").on(table.success),
]);

export type WebhookConfiguration = typeof webhookConfiguration.$inferSelect;
export type InsertWebhookConfiguration = typeof webhookConfiguration.$inferInsert;
export type WebhookDeliveryHistory = typeof webhookDeliveryHistory.$inferSelect;
export type InsertWebhookDeliveryHistory = typeof webhookDeliveryHistory.$inferInsert;


// ============================================================================
// REGULATORY EVENTS TABLE (Phase 2: Hard-Gate Closure)
// ============================================================================
// Canonical event model for Check 5 (Event-Based Aggregation) and Check 6 (Delta Analysis)
// Events are the decision unit; articles link to events, not vice versa.

export const regulatoryEvents = mysqlTable("regulatory_events", {
	id: int().autoincrement().notNull(),
	
	// Event identification
	dedupKey: varchar("dedup_key", { length: 255 }).notNull(), // Format: {primary_regulation}_{event_type}_{quarter}
	eventType: mysqlEnum("event_type", [
		'PROPOSAL',
		'POLITICAL_AGREEMENT',
		'ADOPTION',
		'DELEGATED_ACT_DRAFT',
		'DELEGATED_ACT_ADOPTION',
		'IMPLEMENTING_ACT',
		'GUIDANCE_PUBLICATION',
		'ENFORCEMENT_START',
		'DEADLINE_MILESTONE',
		'POSTPONEMENT',
		'AMENDMENT'
	]).notNull(),
	
	// Affected regulations
	primaryRegulation: varchar("primary_regulation", { length: 64 }).notNull(), // e.g., "CSDDD", "CSRD", "ESPR"
	affectedRegulations: json("affected_regulations").notNull(), // Array of regulation codes
	
	// Lifecycle state
	lifecycleState: mysqlEnum("lifecycle_state", [
		'PROPOSAL',
		'POLITICAL_AGREEMENT',
		'ADOPTED',
		'DELEGATED_ACT_DRAFT',
		'DELEGATED_ACT_ADOPTED',
		'GUIDANCE',
		'ENFORCEMENT_SIGNAL',
		'POSTPONED_OR_SOFTENED'
	]).notNull(),
	
	// Event timing
	eventDateEarliest: timestamp("event_date_earliest", { mode: 'string' }),
	eventDateLatest: timestamp("event_date_latest", { mode: 'string' }),
	eventQuarter: varchar("event_quarter", { length: 7 }).notNull(), // Format: "2025-Q1"
	
	// Delta Analysis (Check 6) - All 5 required fields
	previousAssumption: text("previous_assumption"), // What was assumed before this event?
	newInformation: text("new_information"), // What does this event reveal?
	whatChanged: text("what_changed"), // What is explicitly different now?
	whatDidNotChange: text("what_did_not_change"), // What remains stable?
	decisionImpact: text("decision_impact"), // Why does this matter for decisions?
	
	// Event summary
	eventTitle: varchar("event_title", { length: 512 }).notNull(),
	eventSummary: text("event_summary"),
	
	// Source articles (linked via source_article_ids)
	sourceArticleIds: json("source_article_ids").notNull(), // Array of hub_news IDs
	
	// Decision Value Definition (Check 1)
	decisionValueType: mysqlEnum("decision_value_type", [
		'OBLIGATION_CHANGE',
		'SCOPE_CHANGE',
		'TIMING_CHANGE',
		'INTERPRETATION_CLARIFICATION',
		'DATA_REQUIREMENT',
		'ASSUMPTION_INVALIDATED'
	]),
	
	// Stability Risk Indicator (Check 7)
	stabilityRisk: mysqlEnum("stability_risk", [
		'LOW',
		'MEDIUM',
		'HIGH'
	]),
	
	// Confidence and authority
	confidenceLevel: mysqlEnum("confidence_level", [
		'CONFIRMED_LAW',
		'DRAFT_PROPOSAL',
		'GUIDANCE_INTERPRETATION',
		'MARKET_PRACTICE'
	]).default('GUIDANCE_INTERPRETATION'),
	confidenceSource: varchar("confidence_source", { length: 255 }), // Highest authority source
	
	// Status and completeness
	status: mysqlEnum("status", ['COMPLETE', 'INCOMPLETE', 'DRAFT']).default('DRAFT').notNull(),
	completenessScore: int("completeness_score").default(0), // 0-100, must be ≥80 for COMPLETE
	
	// Validation metadata
	deltaValidationPassed: tinyint("delta_validation_passed").default(0),
	missingDeltaFields: json("missing_delta_fields"), // Array of field names that failed validation
	
	// Timestamps
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => [
	index("dedup_key_idx").on(table.dedupKey),
	index("event_type_idx").on(table.eventType),
	index("primary_regulation_idx").on(table.primaryRegulation),
	index("lifecycle_state_idx").on(table.lifecycleState),
	index("event_quarter_idx").on(table.eventQuarter),
	index("status_idx").on(table.status),
	index("completeness_score_idx").on(table.completenessScore),
]);

export type RegulatoryEvent = typeof regulatoryEvents.$inferSelect;
export type InsertRegulatoryEvent = typeof regulatoryEvents.$inferInsert;
