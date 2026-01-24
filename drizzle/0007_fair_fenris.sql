ALTER TABLE `hub_news` ADD `regulatoryState` enum('PROPOSAL','POLITICAL_AGREEMENT','ADOPTED','DELEGATED_ACT_DRAFT','DELEGATED_ACT_ADOPTED','GUIDANCE','ENFORCEMENT_SIGNAL','POSTPONED_OR_SOFTENED') DEFAULT 'ADOPTED';--> statement-breakpoint
ALTER TABLE `hub_news` ADD `isNegativeSignal` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `hub_news` ADD `confidenceLevel` enum('CONFIRMED_LAW','DRAFT_PROPOSAL','GUIDANCE_INTERPRETATION','MARKET_PRACTICE') DEFAULT 'GUIDANCE_INTERPRETATION';--> statement-breakpoint
ALTER TABLE `hub_news` ADD `negativeSignalKeywords` json;