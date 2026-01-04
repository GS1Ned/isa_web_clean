/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse and DDoS attacks.
 * 
 * Configuration:
 * - API endpoints (/api/trpc): 100 requests per 15 minutes per IP
 * - Static assets: 1000 requests per 15 minutes per IP
 * - Trusted proxies: Cloudflare, AWS, etc.
 */

import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Rate limiter for tRPC API endpoints
 * 
 * Limits: 100 requests per 15 minutes per IP
 * Response: 429 Too Many Requests with JSON error
 */
const createNamedRateLimiter = (options: Parameters<typeof rateLimit>[0]) => {
  const middleware = rateLimit(options);
  Object.defineProperty(middleware, "name", {
    value: "rateLimitMiddleware",
  });
  return middleware;
};

export const apiRateLimiter = createNamedRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: {
      message: "Too many requests from this IP, please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: {
        message: "Too many requests from this IP, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    });
  },
  // Skip rate limiting for trusted IPs (optional)
  skip: (req: Request) => {
    // Example: Skip rate limiting for localhost in development
    const trustedIPs = ["127.0.0.1", "::1"];
    const clientIP = req.ip || req.socket.remoteAddress || "";
    return trustedIPs.includes(clientIP);
  },
});

/**
 * Rate limiter for static assets and general routes
 * 
 * Limits: 1000 requests per 15 minutes per IP
 * More permissive for static content (images, CSS, JS)
 */
export const staticRateLimiter = createNamedRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many requests, please slow down.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 
 * Limits: 10 requests per 15 minutes per IP
 * Prevents brute force attacks on login/signup
 */
export const authRateLimiter = createNamedRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Very strict limit for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many authentication attempts, please try again later.",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
    },
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});
