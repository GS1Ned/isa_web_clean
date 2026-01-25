CREATE TABLE `compliance_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stepId` int NOT NULL,
	`evidenceType` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` varchar(512),
	`fileKey` varchar(512),
	`mimeType` varchar(128),
	`fileSize` int,
	`uploadedBy` varchar(255),
	`verificationStatus` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`verifiedAt` timestamp,
	`verifiedBy` varchar(255),
	`verificationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_roadmaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`strategy` varchar(128) NOT NULL,
	`targetScore` int DEFAULT 80,
	`currentScore` decimal(5,2) NOT NULL,
	`projectedScore` decimal(5,2) NOT NULL,
	`status` varchar(32) DEFAULT 'draft',
	`startDate` timestamp NOT NULL,
	`targetCompletionDate` timestamp NOT NULL,
	`estimatedEffort` int,
	`estimatedImpact` decimal(5,2),
	`progressPercentage` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_roadmaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`overallScore` decimal(5,2) NOT NULL,
	`riskManagementScore` decimal(5,2) NOT NULL,
	`remediationScore` decimal(5,2) NOT NULL,
	`evidenceScore` decimal(5,2) NOT NULL,
	`regulationScore` decimal(5,2) NOT NULL,
	`totalRisks` int DEFAULT 0,
	`resolvedRisks` int DEFAULT 0,
	`totalRemediationPlans` int DEFAULT 0,
	`completedPlans` int DEFAULT 0,
	`totalEvidence` int DEFAULT 0,
	`verifiedEvidence` int DEFAULT 0,
	`regulationsCovered` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255) NOT NULL,
	`phone` varchar(20),
	`inquiryType` varchar(50) NOT NULL,
	`message` text,
	`status` enum('new','contacted','converted','archived') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dutch_initiatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiativeName` varchar(255) NOT NULL,
	`shortName` varchar(100) NOT NULL,
	`initiativeType` varchar(100) NOT NULL,
	`status` varchar(100) NOT NULL,
	`sector` varchar(255) NOT NULL,
	`scope` text NOT NULL,
	`startDate` timestamp,
	`endDate` timestamp,
	`reportingDeadline` varchar(255),
	`keyTargets` json NOT NULL,
	`complianceRequirements` text NOT NULL,
	`gs1Relevance` text NOT NULL,
	`requiredGS1Standards` json,
	`requiredGDSNAttributes` json,
	`relatedEURegulations` json,
	`managingOrganization` varchar(255),
	`officialUrl` varchar(500),
	`documentationUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dutch_initiatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `epcis_batch_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`totalEvents` int DEFAULT 0,
	`processedEvents` int DEFAULT 0,
	`failedEvents` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `epcis_batch_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `epcis_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('ObjectEvent','AggregationEvent','TransactionEvent','TransformationEvent','AssociationEvent') NOT NULL,
	`eventTime` timestamp NOT NULL,
	`eventTimeZoneOffset` varchar(10),
	`action` enum('OBSERVE','ADD','DELETE'),
	`bizStep` varchar(255),
	`disposition` varchar(255),
	`readPoint` varchar(255),
	`bizLocation` varchar(255),
	`epcList` json,
	`quantityList` json,
	`sensorElementList` json,
	`sourceList` json,
	`destinationList` json,
	`ilmd` json,
	`rawEvent` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `epcis_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `esrs_datapoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`datapointId` varchar(50) NOT NULL,
	`esrsStandard` varchar(20) NOT NULL,
	`disclosureRequirement` varchar(50),
	`paragraph` varchar(50),
	`relatedAr` varchar(50),
	`name` text NOT NULL,
	`dataType` varchar(50),
	`conditionalOrAlternative` varchar(50),
	`voluntary` boolean DEFAULT false,
	`sfdrPillar3` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `esrs_datapoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `esrs_datapoints_datapointId_unique` UNIQUE(`datapointId`)
);
--> statement-breakpoint
CREATE TABLE `eudr_geolocation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productGtin` varchar(14) NOT NULL,
	`originLat` decimal(10,8) NOT NULL,
	`originLng` decimal(11,8) NOT NULL,
	`geofenceGeoJSON` json,
	`deforestationRisk` enum('low','medium','high'),
	`riskAssessmentDate` timestamp,
	`dueDiligenceStatement` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eudr_geolocation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gs1_standards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`standardCode` varchar(64) NOT NULL,
	`standardName` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(128),
	`scope` text,
	`referenceUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gs1_standards_id` PRIMARY KEY(`id`),
	CONSTRAINT `gs1_standards_standardCode_unique` UNIQUE(`standardCode`)
);
--> statement-breakpoint
CREATE TABLE `hub_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`summary` text,
	`content` text,
	`newsType` enum('NEW_LAW','AMENDMENT','ENFORCEMENT','COURT_DECISION','GUIDANCE','PROPOSAL') NOT NULL,
	`relatedRegulationIds` json,
	`sourceUrl` varchar(512),
	`sourceTitle` varchar(255),
	`credibilityScore` decimal(3,2) DEFAULT '0.00',
	`publishedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text,
	`resourceType` enum('GUIDE','CHECKLIST','TEMPLATE','CASE_STUDY','WHITEPAPER','TOOL') NOT NULL,
	`relatedRegulationIds` json,
	`relatedStandardIds` json,
	`fileUrl` varchar(512),
	`downloadCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingestion_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`syncStartTime` timestamp NOT NULL,
	`syncEndTime` timestamp,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`regulationsInserted` int NOT NULL DEFAULT 0,
	`regulationsUpdated` int NOT NULL DEFAULT 0,
	`regulationsTotal` int NOT NULL DEFAULT 0,
	`errors` int NOT NULL DEFAULT 0,
	`errorDetails` text,
	`durationSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ingestion_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `initiative_regulation_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiativeId` int NOT NULL,
	`regulationId` int NOT NULL,
	`relationshipType` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `initiative_regulation_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `initiative_standard_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiativeId` int NOT NULL,
	`standardId` int NOT NULL,
	`criticality` varchar(50) NOT NULL,
	`implementationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `initiative_standard_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_embeddings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('regulation','standard','esrs_datapoint','dutch_initiative') NOT NULL,
	`sourceId` int NOT NULL,
	`content` text NOT NULL,
	`contentHash` varchar(64) NOT NULL,
	`embedding` json NOT NULL,
	`embeddingModel` varchar(64) NOT NULL DEFAULT 'text-embedding-3-small',
	`title` varchar(512) NOT NULL,
	`url` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_embeddings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mapping_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mappingId` int NOT NULL,
	`vote` boolean NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mapping_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`riskDetected` boolean DEFAULT true,
	`remediationUpdated` boolean DEFAULT true,
	`commentAdded` boolean DEFAULT true,
	`approvalRequested` boolean DEFAULT true,
	`approvalDecision` boolean DEFAULT true,
	`templateUpdated` boolean DEFAULT true,
	`scoreChanged` boolean DEFAULT true,
	`milestoneAchieved` boolean DEFAULT true,
	`minSeverity` varchar(32) DEFAULT 'low',
	`inAppNotifications` boolean DEFAULT true,
	`emailNotifications` boolean DEFAULT false,
	`quietHoursEnabled` boolean DEFAULT false,
	`quietHoursStart` varchar(5),
	`quietHoursEnd` varchar(5),
	`batchNotifications` boolean DEFAULT false,
	`batchInterval` int DEFAULT 60,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `qa_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(255),
	`messageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qa_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qa_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`sources` json,
	`retrievedChunks` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qa_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulation_esrs_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regulationId` int NOT NULL,
	`datapointId` int NOT NULL,
	`relevanceScore` int NOT NULL DEFAULT 5,
	`reasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regulation_esrs_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulation_standard_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regulationId` int NOT NULL,
	`standardId` int NOT NULL,
	`relevanceScore` decimal(3,2) DEFAULT '0.00',
	`mappingReason` text,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`verifiedByAdmin` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regulation_standard_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`celexId` varchar(64),
	`title` varchar(255) NOT NULL,
	`description` text,
	`regulationType` enum('CSRD','ESRS','DPP','EUDR','ESPR','PPWR','EU_TAXONOMY','OTHER') NOT NULL,
	`effectiveDate` timestamp,
	`sourceUrl` varchar(512),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regulations_id` PRIMARY KEY(`id`),
	CONSTRAINT `regulations_celexId_unique` UNIQUE(`celexId`)
);
--> statement-breakpoint
CREATE TABLE `regulatory_change_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regulationId` int NOT NULL,
	`changeType` enum('NEW','UPDATED','EFFECTIVE_DATE_CHANGED','SCOPE_EXPANDED','DEPRECATED') NOT NULL,
	`changeDescription` text,
	`affectedStandardsCount` int DEFAULT 0,
	`severity` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regulatory_change_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remediation_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`totalSteps` int NOT NULL,
	`completedSteps` int DEFAULT 0,
	`evidenceSubmitted` int DEFAULT 0,
	`evidenceVerified` int DEFAULT 0,
	`progressPercentage` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remediation_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remediation_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`stepNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`requiredEvidence` text,
	`status` enum('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
	`assignedTo` varchar(255),
	`dueDate` timestamp,
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remediation_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remediation_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riskType` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`steps` json NOT NULL,
	`estimatedDays` int,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remediation_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `risk_remediation_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`riskId` int NOT NULL,
	`status` enum('draft','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetCompletionDate` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `risk_remediation_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`actionType` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` varchar(32) NOT NULL,
	`sequenceNumber` int NOT NULL,
	`estimatedEffort` int,
	`estimatedImpact` decimal(5,2),
	`startDate` timestamp NOT NULL,
	`targetDate` timestamp NOT NULL,
	`status` varchar(32) DEFAULT 'pending',
	`relatedRiskId` int,
	`relatedPlanId` int,
	`successCriteria` text,
	`blockers` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(64) NOT NULL,
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`actionId` int,
	`requiredApproverId` int NOT NULL,
	`approverRole` varchar(64),
	`status` varchar(32) DEFAULT 'pending',
	`approvedAt` timestamp,
	`approverComments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`actionId` int,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`isApproval` boolean DEFAULT false,
	`approvalStatus` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roadmap_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_dependencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromActionId` int NOT NULL,
	`toActionId` int NOT NULL,
	`dependencyType` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_dependencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetDate` timestamp NOT NULL,
	`targetScore` decimal(5,2) NOT NULL,
	`completedDate` timestamp,
	`status` varchar(32) DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`strategy` varchar(32) NOT NULL,
	`estimatedEffort` int NOT NULL,
	`estimatedImpact` decimal(5,2),
	`targetScore` decimal(5,2),
	`isPublic` boolean DEFAULT true,
	`createdBy` int NOT NULL,
	`usageCount` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0.00',
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roadmap_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `score_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`overallScore` decimal(5,2) NOT NULL,
	`riskManagementScore` decimal(5,2) NOT NULL,
	`remediationScore` decimal(5,2) NOT NULL,
	`evidenceScore` decimal(5,2) NOT NULL,
	`regulationScore` decimal(5,2) NOT NULL,
	`changeReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `score_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `score_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`milestoneType` varchar(128) NOT NULL,
	`milestoneTitle` varchar(255) NOT NULL,
	`description` text,
	`achievedAt` timestamp NOT NULL,
	`badge` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `score_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scoring_benchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`industry` varchar(128) NOT NULL,
	`region` varchar(128) NOT NULL,
	`avgOverallScore` decimal(5,2) NOT NULL,
	`avgRiskManagementScore` decimal(5,2) NOT NULL,
	`avgRemediationScore` decimal(5,2) NOT NULL,
	`avgEvidenceScore` decimal(5,2) NOT NULL,
	`avgRegulationScore` decimal(5,2) NOT NULL,
	`percentile75` decimal(5,2) NOT NULL,
	`percentile90` decimal(5,2) NOT NULL,
	`dataPoints` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scoring_benchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_chain_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricDate` timestamp NOT NULL,
	`totalEvents` int DEFAULT 0,
	`totalNodes` int DEFAULT 0,
	`totalEdges` int DEFAULT 0,
	`highRiskNodes` int DEFAULT 0,
	`averageTraceabilityScore` decimal(5,2),
	`complianceScore` decimal(5,2),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supply_chain_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_chain_edges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromNodeId` int NOT NULL,
	`toNodeId` int NOT NULL,
	`productGtin` varchar(14),
	`relationshipType` enum('supplies','manufactures','distributes','retails') NOT NULL,
	`lastTransactionDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supply_chain_edges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_chain_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nodeType` enum('supplier','manufacturer','distributor','retailer','recycler') NOT NULL,
	`gln` varchar(255),
	`name` varchar(255) NOT NULL,
	`tierLevel` int,
	`locationLat` decimal(10,8),
	`locationLng` decimal(11,8),
	`riskLevel` enum('low','medium','high'),
	`riskFactors` json,
	`certifications` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supply_chain_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_chain_risks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`nodeId` int,
	`riskType` enum('deforestation','labor','environmental','traceability','certification','geolocation') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text NOT NULL,
	`regulationId` int,
	`recommendedAction` text,
	`isResolved` boolean DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supply_chain_risks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_roadmap_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`userId` int NOT NULL,
	`accessLevel` varchar(32) NOT NULL,
	`grantedBy` int NOT NULL,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_roadmap_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`sequenceNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`actionType` varchar(64) NOT NULL,
	`priority` varchar(32) NOT NULL,
	`estimatedEffort` int NOT NULL,
	`estimatedImpact` decimal(5,2),
	`successCriteria` text,
	`relatedStandards` json,
	CONSTRAINT `template_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`sequenceNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetScore` decimal(5,2) NOT NULL,
	`daysFromStart` int NOT NULL,
	CONSTRAINT `template_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`userId` int NOT NULL,
	`roadmapId` int NOT NULL,
	`rating` int,
	`feedback` text,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `template_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`alertType` enum('REGULATION_UPDATE','DEADLINE_APPROACHING','NEW_REGULATION','ENFORCEMENT_ACTION') NOT NULL,
	`regulationId` int,
	`standardId` int,
	`daysBeforeDeadline` int,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`regulationId` int,
	`documentTitle` varchar(255),
	`documentUrl` varchar(512),
	`analysisType` enum('CELEX','DOCUMENT_UPLOAD','URL','TEXT') NOT NULL,
	`detectedStandardsCount` int DEFAULT 0,
	`analysisResult` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interestedRegulations` json,
	`interestedStandards` json,
	`notificationsEnabled` boolean DEFAULT true,
	`industryFocus` varchar(128),
	`companySize` enum('STARTUP','SME','ENTERPRISE','OTHER'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_saved_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('REGULATION','NEWS','RESOURCE') NOT NULL,
	`itemId` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_saved_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `initiative_regulation_mappings` ADD CONSTRAINT `initiative_regulation_mappings_initiativeId_dutch_initiatives_id_fk` FOREIGN KEY (`initiativeId`) REFERENCES `dutch_initiatives`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `initiative_regulation_mappings` ADD CONSTRAINT `initiative_regulation_mappings_regulationId_regulations_id_fk` FOREIGN KEY (`regulationId`) REFERENCES `regulations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `initiative_standard_mappings` ADD CONSTRAINT `initiative_standard_mappings_initiativeId_dutch_initiatives_id_fk` FOREIGN KEY (`initiativeId`) REFERENCES `dutch_initiatives`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `initiative_standard_mappings` ADD CONSTRAINT `initiative_standard_mappings_standardId_gs1_standards_id_fk` FOREIGN KEY (`standardId`) REFERENCES `gs1_standards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qa_conversations` ADD CONSTRAINT `qa_conversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qa_messages` ADD CONSTRAINT `qa_messages_conversationId_qa_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `qa_conversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `compliance_evidence` (`userId`);--> statement-breakpoint
CREATE INDEX `stepId_idx` ON `compliance_evidence` (`stepId`);--> statement-breakpoint
CREATE INDEX `verificationStatus_idx` ON `compliance_evidence` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `compliance_roadmaps` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `compliance_roadmaps` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `compliance_scores` (`userId`);--> statement-breakpoint
CREATE INDEX `overallScore_idx` ON `compliance_scores` (`overallScore`);--> statement-breakpoint
CREATE INDEX `sector_idx` ON `dutch_initiatives` (`sector`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `dutch_initiatives` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `epcis_batch_jobs` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `epcis_batch_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `epcis_batch_jobs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `epcis_events` (`userId`);--> statement-breakpoint
CREATE INDEX `eventTime_idx` ON `epcis_events` (`eventTime`);--> statement-breakpoint
CREATE INDEX `eventType_idx` ON `epcis_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `esrsStandard_idx` ON `esrs_datapoints` (`esrsStandard`);--> statement-breakpoint
CREATE INDEX `disclosureRequirement_idx` ON `esrs_datapoints` (`disclosureRequirement`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `eudr_geolocation` (`userId`);--> statement-breakpoint
CREATE INDEX `productGtin_idx` ON `eudr_geolocation` (`productGtin`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `ingestion_logs` (`status`);--> statement-breakpoint
CREATE INDEX `syncStartTime_idx` ON `ingestion_logs` (`syncStartTime`);--> statement-breakpoint
CREATE INDEX `initiativeId_idx` ON `initiative_regulation_mappings` (`initiativeId`);--> statement-breakpoint
CREATE INDEX `regulationId_idx` ON `initiative_regulation_mappings` (`regulationId`);--> statement-breakpoint
CREATE INDEX `initiativeId_idx` ON `initiative_standard_mappings` (`initiativeId`);--> statement-breakpoint
CREATE INDEX `standardId_idx` ON `initiative_standard_mappings` (`standardId`);--> statement-breakpoint
CREATE INDEX `source_type_idx` ON `knowledge_embeddings` (`sourceType`);--> statement-breakpoint
CREATE INDEX `source_id_idx` ON `knowledge_embeddings` (`sourceId`);--> statement-breakpoint
CREATE INDEX `content_hash_idx` ON `knowledge_embeddings` (`contentHash`);--> statement-breakpoint
CREATE INDEX `source_composite_idx` ON `knowledge_embeddings` (`sourceType`,`sourceId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `mapping_feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `mappingId_idx` ON `mapping_feedback` (`mappingId`);--> statement-breakpoint
CREATE INDEX `unique_vote_idx` ON `mapping_feedback` (`userId`,`mappingId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notification_preferences` (`userId`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `qa_conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `qa_conversations` (`createdAt`);--> statement-breakpoint
CREATE INDEX `conversation_id_idx` ON `qa_messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `qa_messages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `regulationId_idx` ON `regulation_esrs_mappings` (`regulationId`);--> statement-breakpoint
CREATE INDEX `datapointId_idx` ON `regulation_esrs_mappings` (`datapointId`);--> statement-breakpoint
CREATE INDEX `unique_mapping_idx` ON `regulation_esrs_mappings` (`regulationId`,`datapointId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `remediation_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `planId_idx` ON `remediation_progress` (`planId`);--> statement-breakpoint
CREATE INDEX `planId_idx` ON `remediation_steps` (`planId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `remediation_steps` (`status`);--> statement-breakpoint
CREATE INDEX `riskType_idx` ON `remediation_templates` (`riskType`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `risk_remediation_plans` (`userId`);--> statement-breakpoint
CREATE INDEX `riskId_idx` ON `risk_remediation_plans` (`riskId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `risk_remediation_plans` (`status`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_actions` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `roadmap_actions` (`priority`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `roadmap_actions` (`status`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_activity_log` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `roadmap_activity_log` (`userId`);--> statement-breakpoint
CREATE INDEX `activityType_idx` ON `roadmap_activity_log` (`activityType`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_approvals` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `requiredApproverId_idx` ON `roadmap_approvals` (`requiredApproverId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `roadmap_approvals` (`status`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_comments` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `actionId_idx` ON `roadmap_comments` (`actionId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `roadmap_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `fromActionId_idx` ON `roadmap_dependencies` (`fromActionId`);--> statement-breakpoint
CREATE INDEX `toActionId_idx` ON `roadmap_dependencies` (`toActionId`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_milestones` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `roadmap_templates` (`category`);--> statement-breakpoint
CREATE INDEX `createdBy_idx` ON `roadmap_templates` (`createdBy`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `score_history` (`userId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `score_history` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `score_milestones` (`userId`);--> statement-breakpoint
CREATE INDEX `achievedAt_idx` ON `score_milestones` (`achievedAt`);--> statement-breakpoint
CREATE INDEX `industry_region_idx` ON `scoring_benchmarks` (`industry`,`region`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supply_chain_analytics` (`userId`);--> statement-breakpoint
CREATE INDEX `metricDate_idx` ON `supply_chain_analytics` (`metricDate`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supply_chain_edges` (`userId`);--> statement-breakpoint
CREATE INDEX `fromNode_idx` ON `supply_chain_edges` (`fromNodeId`);--> statement-breakpoint
CREATE INDEX `toNode_idx` ON `supply_chain_edges` (`toNodeId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supply_chain_nodes` (`userId`);--> statement-breakpoint
CREATE INDEX `gln_idx` ON `supply_chain_nodes` (`gln`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supply_chain_risks` (`userId`);--> statement-breakpoint
CREATE INDEX `eventId_idx` ON `supply_chain_risks` (`eventId`);--> statement-breakpoint
CREATE INDEX `nodeId_idx` ON `supply_chain_risks` (`nodeId`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `supply_chain_risks` (`severity`);--> statement-breakpoint
CREATE INDEX `riskType_idx` ON `supply_chain_risks` (`riskType`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `team_roadmap_access` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `team_roadmap_access` (`userId`);--> statement-breakpoint
CREATE INDEX `templateId_idx` ON `template_actions` (`templateId`);--> statement-breakpoint
CREATE INDEX `templateId_idx` ON `template_milestones` (`templateId`);--> statement-breakpoint
CREATE INDEX `templateId_idx` ON `template_usage` (`templateId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `template_usage` (`userId`);