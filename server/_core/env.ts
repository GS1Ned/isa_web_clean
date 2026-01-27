/**
 * ISA Environment Configuration with Fail-Fast Validation
 * 
 * Production: Throws error listing missing required variable NAMES
 * Development: Logs warning, exits non-zero if critical vars missing
 */

const isProduction = process.env.NODE_ENV === "production";

// Required variables that must be present
const REQUIRED_VARS = ["VITE_APP_ID", "JWT_SECRET", "DATABASE_URL"] as const;

// Critical variables that cause exit in development if missing
const CRITICAL_VARS = ["DATABASE_URL", "JWT_SECRET"] as const;

// Common insecure defaults that should be rejected
const INSECURE_DEFAULTS = ["", "change-me", "secret", "development", "change-me-in-production"];

/**
 * Validate environment variables at startup
 * Only prints variable NAMES, never values
 */
function validateEnv(): void {
  const missing: string[] = [];
  const invalid: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Validate JWT_SECRET (cookieSecret)
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (jwtSecret && jwtSecret.length < 32) {
    invalid.push("JWT_SECRET (must be >= 32 chars, got " + jwtSecret.length + ")");
  }
  if (INSECURE_DEFAULTS.includes(jwtSecret)) {
    invalid.push("JWT_SECRET (using insecure default value)");
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (dbUrl && !dbUrl.startsWith("mysql://")) {
    invalid.push("DATABASE_URL (must start with mysql://)");
  }
  if (dbUrl && !/\/[^/?]+(\?|$)/.test(dbUrl)) {
    invalid.push("DATABASE_URL (must include database name)");
  }

  // Handle validation failures
  if (missing.length > 0 || invalid.length > 0) {
    const errorLines: string[] = [];
    
    if (missing.length > 0) {
      errorLines.push("Missing required environment variables: " + missing.join(", "));
    }
    if (invalid.length > 0) {
      errorLines.push("Invalid environment variables: " + invalid.join("; "));
    }

    if (isProduction) {
      // Production: throw error immediately
      throw new Error("[ENV] Configuration error:\n" + errorLines.join("\n"));
    } else {
      // Development: log warning
      process.stderr.write("[ENV] ⚠️  Configuration warning:\n");
      errorLines.forEach(line => process.stderr.write("  - " + line + "\n"));

      // Exit if critical variables are missing
      const criticalMissing = missing.filter(v => 
        (CRITICAL_VARS as readonly string[]).includes(v)
      );
      if (criticalMissing.length > 0) {
        process.stderr.write("[ENV] ❌ Critical variables missing: " + criticalMissing.join(", ") + "\n");
        process.stderr.write("[ENV] Server cannot start without these. Exiting.\n");
        process.exit(1);
      }
    }
  } else {
    // All validations passed
    if (!isProduction) {
      process.stdout.write("[ENV] ✓ All required environment variables present and valid\n");
    }
  }
}

// Run validation on module load
validateEnv();

// Export validated environment configuration
export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  githubPat: process.env.GITHUB_PAT ?? "",
};
