import mysql from "mysql2/promise";
import { serverLogger } from './utils/server-logger';

type MysqlOptions = mysql.PoolOptions;

const SSL_QUERY_KEYS = ["ssl", "sslmode", "ssl-mode", "sslMode"];

/**
 * Parse SSL configuration from URL parameter
 * Supports both string values (sslmode=require) and JSON objects (ssl={"rejectUnauthorized":true})
 */
function normalizeSslValue(value: string | null): mysql.SslOptions | undefined {
  if (!value) return undefined;

  // Try to parse as JSON first (for URL-encoded JSON objects from DATABASE_URL)
  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as mysql.SslOptions;
      }
    } catch {
      // Not valid JSON, fall through to string parsing
    }
  }

  // Parse string values (standard sslmode parameter)
  const normalized = value.toLowerCase();

  // Enable SSL with no verification (common for development/test)
  if (["true", "1", "required", "require"].includes(normalized)) {
    return { rejectUnauthorized: false };
  }

  // Disable SSL
  if (["false", "0", "disabled", "disable"].includes(normalized)) {
    return undefined;
  }

  // Enable SSL with full certificate verification
  if (["verify-ca", "verify-full", "verify_ca", "verify_full"].includes(normalized)) {
    return { rejectUnauthorized: true };
  }

  // Enable SSL but skip certificate verification
  if (["skip-verify", "accept-invalid", "skip_verify", "accept_invalid"].includes(normalized)) {
    return { rejectUnauthorized: false };
  }

  // Default: if we got a value but don't recognize it, enable SSL without verification
  serverLogger.warn(`[db-connection] Unknown SSL value "${value}", defaulting to SSL with rejectUnauthorized=false`);
  return { rejectUnauthorized: false };
}

export function buildMysqlConfig(databaseUrl: string): MysqlOptions {
  const url = new URL(databaseUrl);
  const sslValue =
    SSL_QUERY_KEYS.map((key) => url.searchParams.get(key)).find(Boolean) ??
    null;
  const ssl = normalizeSslValue(sslValue);

  const config: MysqlOptions = {
    host: url.hostname,
    port: url.port ? Number(url.port) : undefined,
    database: url.pathname.replace(/^\//, ""),
  };

  if (url.username) {
    config.user = decodeURIComponent(url.username);
  }

  if (url.password) {
    config.password = decodeURIComponent(url.password);
  }

  if (ssl) {
    config.ssl = ssl;
  }

  return config;
}

export function createMysqlPool(databaseUrl: string) {
  const config = buildMysqlConfig(databaseUrl);
  return mysql.createPool(config);
}

export async function createMysqlConnection(databaseUrl: string) {
  const config = buildMysqlConfig(databaseUrl);
  return mysql.createConnection(config);
}
