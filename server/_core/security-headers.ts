/**
 * Security Headers Middleware
 * 
 * Configures HTTP security headers using Helmet.js to protect against
 * common web vulnerabilities.
 * 
 * Headers configured:
 * - Content-Security-Policy (CSP)
 * - X-Frame-Options (clickjacking protection)
 * - X-Content-Type-Options (MIME sniffing protection)
 * - Strict-Transport-Security (HSTS)
 * - X-DNS-Prefetch-Control
 * - Referrer-Policy
 */

import helmet from "helmet";

/**
 * Helmet configuration for production security
 * 
 * Balances security with functionality:
 * - Allows inline scripts/styles (needed for React/Vite)
 * - Allows external resources (Google Fonts, CDNs)
 * - Enables HSTS for HTTPS enforcement
 * - Protects against clickjacking and MIME sniffing
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vite HMR and React
        "'unsafe-eval'", // Required for development
        "https://cdn.jsdelivr.net", // For external libraries
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind and inline styles
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:", // For inline fonts
      ],
      imgSrc: [
        "'self'",
        "data:", // For inline images
        "https:", // Allow all HTTPS images (S3, external sources)
        "blob:", // For generated images
      ],
      connectSrc: [
        "'self'",
        "https://api.manus.im", // Manus OAuth
        "https://*.manusvm.computer", // Dev server
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [], // Upgrade HTTP to HTTPS
    },
  },

  // Prevent clickjacking attacks
  frameguard: {
    action: "deny", // Don't allow embedding in iframes
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // Enable HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Control DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // Referrer policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },

  // Remove X-Powered-By header
  hidePoweredBy: true,
});

/**
 * Relaxed security headers for development
 * 
 * Allows more permissive CSP for HMR and debugging
 */
export const devSecurityHeaders = helmet({
  contentSecurityPolicy: false, // Disable CSP in development
  hsts: false, // Disable HSTS in development (no HTTPS)
});
