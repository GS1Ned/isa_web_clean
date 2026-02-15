import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

// Ensure test-mode semantics are active during module import.
// Some modules validate env / wire loggers at import time, before `setupFiles` run.
process.env.NODE_ENV ||= "test";
process.env.VITEST ||= "true";
process.env.DOTENV_CONFIG_QUIET ||= "true";
process.env.ISA_TEST_SILENT ||= "true";

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
  "server/esrs-gs1-mapping.test.ts",
  "server/gs1-nl-content.test.ts",
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
  "server/test-helpers/db-test-utils.test.ts",
];

export default defineConfig(() => {
  // DB tests must be opt-in. A configured DATABASE_URL alone should not turn unit tests
  // into integration tests (new devs/agents often have a .env but no seeded DB).
  const runDbTests = process.env.RUN_DB_TESTS === "true";
  const exclude = runDbTests ? [] : dbDependentTests;

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
