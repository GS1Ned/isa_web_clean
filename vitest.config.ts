import { defineConfig } from "vitest/config";
import path from "path";
import { createMysqlConnection } from "./server/db-connection";

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

async function isDatabaseAvailable() {
  if (!process.env.DATABASE_URL) {
    return false;
  }

  try {
    const connection = await createMysqlConnection(process.env.DATABASE_URL);
    await connection.ping();
    await connection.end();
    return true;
  } catch {
    return false;
  }
}

export default defineConfig(async () => {
  const dbAvailable = await isDatabaseAvailable();
  const exclude = dbAvailable ? [] : dbDependentTests;

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
    },
  };
});
