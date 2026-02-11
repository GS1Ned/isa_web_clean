import { config } from "dotenv";
config({ override: true }); // Override shell environment with .env file
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import "./logger-wiring"; // Initialize persisted serverLogger
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { performHealthCheck, performReadinessCheck } from "../health";
import { serveStatic, setupVite } from "./vite";
import { apiRateLimiter, authRateLimiter } from "./rate-limit";
import { securityHeaders, devSecurityHeaders } from "./security-headers";
import {
  handleDailyNewsIngestion,
  handleWeeklyNewsArchival,
  handleCronHealth,
} from "../cron-endpoint";
import { scheduleAlertMonitoring } from "../alert-monitoring-cron";
import { initializeBM25Index } from "../bm25-search";
import { serverLogger } from '../utils/server-logger';

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy for proper IP detection behind reverse proxy
  app.set('trust proxy', 1);

  // Security headers (production only)
  if (process.env.NODE_ENV === "production") {
    app.use(securityHeaders);
  } else {
    app.use(devSecurityHeaders);
  }

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback (with strict rate limiting)
  app.use("/api/oauth", authRateLimiter);
  registerOAuthRoutes(app);
  // Health check endpoint (public, no auth required)
  app.get("/health", async (req, res) => {
    try {
      const health = await performHealthCheck();
      const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      });
    }
  });

  // Readiness check endpoint (public, no auth required)
  app.get("/ready", async (req, res) => {
    try {
      const readiness = await performReadinessCheck();
      const statusCode = readiness.ready ? 200 : 503;
      res.status(statusCode).json(readiness);
    } catch (error) {
      res.status(503).json({
        ready: false,
        error: error instanceof Error ? error.message : 'Readiness check failed',
      });
    }
  });

  // Cron REST endpoints (before tRPC to avoid conflicts)
  app.get("/cron/health", handleCronHealth);
  app.get("/cron/daily-news-ingestion", handleDailyNewsIngestion);
  app.get("/cron/weekly-news-archival", handleWeeklyNewsArchival);

  // tRPC API (with rate limiting)
  app.use(
    "/api/trpc",
    apiRateLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Start alert monitoring (runs every 5 minutes)
    scheduleAlertMonitoring();
    
    // Initialize BM25 search index in background (non-blocking)
    initializeBM25Index().catch(err => {
      serverLogger.error('[BM25] Failed to initialize search index:', err);
    });
  });
}

startServer().catch(console.error);
