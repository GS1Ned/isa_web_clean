import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

const dbDependentTests = [
  "server/alert-system.test.ts",
  "server/admin-analytics.test.ts",
  "server/cellar-ingestion-integration.test.ts",
  "server/coverage-analytics.test.ts",
  "server/data-quality.test.ts",
  "server/db-error-tracking.test.ts",
  "server/db-performance-tracking.test.ts",
  "server/dutch-initiatives.test.ts",
  "server/epcis-integration.test.ts",
  "server/epcis-ui.test.ts",
  "server/esrs.test.ts",
  "server/gs1-mapping-engine.test.ts",
  "server/news-health-monitor.test.ts",
  "server/news-pipeline-db-integration.test.ts",
  "server/news-pipeline.test.ts",
  "server/observability.test.ts",
  "server/onboarding.test.ts",
  "server/regulatory-change-log.test.ts",
  "server/regulation-esrs-mapper.test.ts",
  "server/run-first-ingestion.test.ts",
  "server/routers/advisory-reports.test.ts",
  "server/routers/dataset-registry.test.ts",
  "server/routers/gs1-attributes-multi-sector.test.ts",
  "server/routers/gs1-attributes.test.ts",
  "server/routers/governance-documents.test.ts",
  "server/routers/scraper-health.test.ts",
  "server/routers/standards-directory.test.ts",
  "server/standards-directory.test.ts",
  "server/routers.test.ts",
];

export default defineConfig(() => {
  // Use explicit environment flag instead of async detection
  const runDbTests = process.env.RUN_DB_TESTS === "true" || process.env.DATABASE_URL;
  const exclude = runDbTests ? [] : dbDependentTests;

  console.log(`[vitest.config] RUN_DB_TESTS=${process.env.RUN_DB_TESTS}, DATABASE_URL=${!!process.env.DATABASE_URL}, excluding ${exclude.length} tests`);

  return {
    root: templateRoot,
    resolve: {
      alias: {
        "@": path.resolve(templateRoot, "client", "src"),
        "@shared": path.resolve(templateRoot, "shared"),
        "@assets": path.resolve(templateRoot, "attached_assets"),
      },
    },
    test: {
      environment: "jsdom",
      include: [
        "server/**/*.test.ts",
        "server/**/*.spec.ts",
        "client/src/**/*.test.tsx",
        "client/src/**/*.test.ts",
      ],
      exclude,
      setupFiles: ["./vitest.setup.ts"],
      testTimeout: 30000, // 30s timeout for database tests
      hookTimeout: 10000, // 10s timeout for setup/teardown hooks
    },
  };
});
