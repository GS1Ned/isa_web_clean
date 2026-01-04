import mysql from "mysql2/promise";

type MysqlOptions = mysql.PoolOptions;

const SSL_QUERY_KEYS = ["ssl", "sslmode", "ssl-mode", "sslMode"];

function normalizeSslValue(value: string | null): mysql.SslOptions | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();

  if (["true", "1", "required"].includes(normalized)) {
    return { rejectUnauthorized: false };
  }

  if (["false", "0", "disabled"].includes(normalized)) {
    return undefined;
  }

  if (["verify-ca", "verify-full"].includes(normalized)) {
    return { rejectUnauthorized: true };
  }

  if (["skip-verify", "accept-invalid"].includes(normalized)) {
    return { rejectUnauthorized: false };
  }

  return undefined;
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
