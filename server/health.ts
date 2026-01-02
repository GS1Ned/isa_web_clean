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
