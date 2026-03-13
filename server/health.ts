/**
 * Health Check Endpoint for ISA Platform
 * 
 * Provides system health status for monitoring and alerting.
 * Used by: Load balancers, monitoring tools, uptime services
 */

import { getDb } from './db';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
    server: {
      status: 'ok';
      uptime: number;
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
    };
  };
}

/**
 * Perform health check on database connection
 */
async function checkDatabase(): Promise<{ status: 'ok' | 'error'; responseTime?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Simple query to verify database connectivity
    const db = await getDb();
    if (!db) {
      return {
        status: 'error',
        error: 'Database connection not available',
      };
    }
    await db.execute('SELECT 1');
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'ok',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

/**
 * Get server health metrics
 */
function getServerHealth() {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  
  return {
    status: 'ok' as const,
    uptime,
    memory: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
  };
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const [databaseCheck, serverCheck] = await Promise.all([
    checkDatabase(),
    Promise.resolve(getServerHealth()),
  ]);
  
  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (databaseCheck.status === 'error') {
    status = 'unhealthy';
  } else if (serverCheck.memory.percentage > 90) {
    status = 'degraded';
  }
  
  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: databaseCheck,
      server: serverCheck,
    },
  };
}


/**
 * Readiness check - verifies all required env vars are present
 * Returns names only, never values
 */
export function checkEnvReadiness(): { ready: boolean; missing: string[]; present: string[] } {
  const REQUIRED_VARS = ["VITE_APP_ID", "JWT_SECRET", "DATABASE_URL"];
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const varName of REQUIRED_VARS) {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }
  
  return {
    ready: missing.length === 0,
    missing,
    present,
  };
}

/**
 * Perform readiness check (DB + env vars)
 */
export async function performReadinessCheck(): Promise<{
  ready: boolean;
  checks: {
    database: { status: 'ok' | 'error'; error?: string };
    envVars: { ready: boolean; missing: string[]; present: string[] };
  };
}> {
  const [dbCheck, envCheck] = await Promise.all([
    checkDatabase().catch(e => ({ status: 'error' as const, error: e.message })),
    Promise.resolve(checkEnvReadiness()),
  ]);
  
  return {
    ready: dbCheck.status === 'ok' && envCheck.ready,
    checks: {
      database: { status: dbCheck.status, error: dbCheck.error },
      envVars: envCheck,
    },
  };
}
