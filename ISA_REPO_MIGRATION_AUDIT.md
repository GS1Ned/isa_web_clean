# ISA Repository Migration Audit Report

**Date:** 2026-03-13
**Scope:** WRITE (content replacement + minimal fixes)
**Repository Reference:** GS1Ned/isa_web_clean (target), Manus S3 internal (sandbox)
**Status:** ISA Governance — Final v1.0

---

## 1. Executive Summary

This audit documents the reconfiguration of the ISA Manus deployment task from the old repository (`GS1Ned/isa_web`) to the new repository (`GS1Ned/isa_web_clean`). The migration was completed successfully using a content replacement strategy that preserves all Manus platform infrastructure (domains, secrets, database bindings, features) while replacing the application code with the clean repository contents.

Three issues were discovered and fixed during the migration:

1. **Iframe embedding blocked** — Helmet.js security headers prevented Manus Preview pane from loading (pre-existing fix in isa_web_clean, commit `f0cb00e`).
2. **DATABASE_URL malformed** — The environment variable contained an erroneous `DATABASE_URL=` prefix in its value, causing URL parse failures.
3. **TiDB SSL required** — TiDB Serverless rejects insecure connections; the connection builder lacked automatic SSL for TiDB hosts.

---

## 2. Pre-Migration State

### 2.1 Manus Sandbox Configuration

| Item | Value |
|------|-------|
| Project Name | isa_web |
| Project Path | /home/ubuntu/isa_web |
| Features | db, server, user |
| Internal Git Remote (origin) | s3://vida-prod-gitrepo/webdev-git/87048354/cozU6EotfgGjqPV9552owj |
| Domains | isa-standards-cozu6eot.manus.space, gs1isa.com, www.gs1isa.com |
| Dev Server Port | 3000 |

### 2.2 Old Repository State

The sandbox contained code from `GS1Ned/isa_web` (the original repository). This code was outdated relative to the clean repository and lacked several fixes including the iframe security headers fix.

### 2.3 Key Finding: Manus Architecture

The Manus webdev system maintains its own internal git repository on S3 (`origin` remote). GitHub is configured as a secondary remote (`user_github`). This means "rebinding" to a different GitHub repo is not a native operation — it requires a content replacement strategy.

---

## 3. Migration Strategy

**Approach: Content Replacement (Option A)**

This strategy was chosen because it:
- Preserves all Manus infrastructure (S3 git, domains, secrets, database bindings, features)
- Avoids disrupting the Manus internal state
- Allows the sandbox to continue functioning with the same project identity

### 3.1 Steps Executed

1. **Backup checkpoint** — Saved current state as version `9ce8868f`
2. **Clone isa_web_clean** — Cloned `GS1Ned/isa_web_clean` to `/home/ubuntu/isa_web_clean_temp`
3. **Remove old content** — Deleted all files from `/home/ubuntu/isa_web/` except `.git/` and `node_modules/`
4. **Copy new content** — Copied 8,864 files from isa_web_clean into the sandbox
5. **Install dependencies** — Ran `pnpm install` (completed in 5.1s)
6. **Configure GitHub remote** — Added `user_github` remote pointing to `GS1Ned/isa_web_clean`
7. **Restart dev server** — Restarted with new codebase

---

## 4. Issues Discovered and Fixed

### 4.1 Iframe Security Headers (Pre-existing Fix)

**Root cause:** Helmet.js `devSecurityHeaders` did not explicitly disable `frameguard`, `crossOriginOpenerPolicy`, and `crossOriginResourcePolicy`, causing the Manus Preview iframe to be blocked.

**File changed:** `server/_core/security-headers.ts` (lines 102-104)

**Fix:** Already present in isa_web_clean (commit `f0cb00e`). Carried over via content replacement.

```typescript
export const devSecurityHeaders = helmet({
  contentSecurityPolicy: false,
  hsts: false,
  frameguard: false,                 // Allow iframe embedding for Manus Preview pane
  crossOriginOpenerPolicy: false,    // Allow iframe embedding
  crossOriginResourcePolicy: false,  // Allow cross-origin resource access
});
```

**Impact:** Development mode only. Production security headers remain unchanged.

### 4.2 DATABASE_URL Malformed Prefix

**Root cause:** The Manus platform injected the environment variable with the key name included in the value: `DATABASE_URL=mysql://...` instead of just `mysql://...`. This caused `new URL()` to fail with `ERR_INVALID_URL`.

**File changed:** `server/_core/env.ts` (lines 22-25)

**Fix:** Added sanitization at module load time to strip the accidental prefix.

```typescript
// Sanitize DATABASE_URL: strip accidental "DATABASE_URL=" prefix injected by some environments
if (process.env.DATABASE_URL?.startsWith("DATABASE_URL=")) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^DATABASE_URL=/, "");
}
```

**Impact:** Defensive fix. No effect when the value is correctly formatted.

### 4.3 TiDB Serverless SSL Requirement

**Root cause:** TiDB Serverless clusters reject connections without SSL ("Connections using insecure transport are prohibited"). The DATABASE_URL stored in Manus does not include an `?ssl=require` query parameter, and the connection builder only enabled SSL when explicitly requested via URL parameters.

**File changed:** `server/db-connection.ts` (lines 78-80)

**Fix:** Added automatic SSL detection for TiDB Cloud hosts.

```typescript
} else if (url.hostname.includes("tidbcloud.com")) {
  // TiDB Serverless requires SSL; auto-enable when no explicit SSL param is set
  config.ssl = { rejectUnauthorized: false };
}
```

**Impact:** Automatic SSL for any TiDB Cloud host. Does not affect connections with explicit SSL parameters or non-TiDB hosts.

---

## 5. Post-Migration Validation

### 5.1 Server Health

| Check | Result |
|-------|--------|
| Dev server running | ✅ Port 3000, PID active |
| Local HTTP 200 | ✅ `curl http://localhost:3000/` returns 200 |
| Public URL HTTP 200 | ✅ Preview URL returns 200 |
| TypeScript compilation | ✅ 0 errors |
| LSP diagnostics | ✅ No errors |
| Dependencies | ✅ OK |

### 5.2 Database Connectivity

| Check | Result |
|-------|--------|
| DATABASE_URL parsed | ✅ No ERR_INVALID_URL |
| SSL connection | ✅ No "insecure transport" errors |
| BM25 index initialized | ✅ 33 regulations, 59 standards (1146ms) |
| Alert monitoring | ✅ "No alerts detected" |

### 5.3 Preview / Iframe

| Check | Result |
|-------|--------|
| X-Frame-Options header | ✅ Absent (not blocking) |
| Cross-Origin-Opener-Policy | ✅ Absent (not blocking) |
| Cross-Origin-Resource-Policy | ✅ Absent (not blocking) |
| Manus Preview pane | ✅ Loads correctly |
| Screenshot captured | ✅ Full ISA homepage visible |

### 5.4 Application Features

| Feature | Status |
|---------|--------|
| Homepage rendering | ✅ Full UI with navigation |
| Admin menu | ✅ Visible (database-dependent) |
| Search bar | ✅ Present |
| NL/EN language toggle | ✅ Present |
| Dashboard link | ✅ Present |

---

## 6. GitHub Remote Configuration

| Remote | URL | Purpose |
|--------|-----|---------|
| origin | s3://vida-prod-gitrepo/... | Manus internal (primary) |
| user_github | github.com/GS1Ned/isa_web_clean | GitHub sync (secondary) |

**Authentication:** `GH_TOKEN` environment variable (verified working).

**Note:** Two legacy GitHub tokens (`ManusISARepoAutomation`, `manus`) are expired. Only `GH_TOKEN` is functional for GitHub API access.

---

## 7. Files Changed (Migration Fixes Only)

| File | Change | Lines |
|------|--------|-------|
| `server/_core/env.ts` | DATABASE_URL prefix sanitization | +4 |
| `server/db-connection.ts` | TiDB SSL auto-enable | +3 |

Total: 2 files, 7 lines added, 0 lines removed.

The iframe security headers fix was already present in isa_web_clean and required no additional changes.

---

## 8. Rollback Plan

If the migration needs to be reverted:

1. Use `webdev_rollback_checkpoint` with version `9ce8868f` to restore the pre-migration state
2. Restart the dev server
3. Verify the old codebase is serving

---

## 9. Remaining Items

### 9.1 Known Non-Blocking Issues

- **Expired GitHub tokens:** `ManusISARepoAutomation` and `manus` tokens are expired. Only `GH_TOKEN` works. Recommend rotating or removing expired tokens.
- **DATABASE_URL prefix:** This is a platform-level issue. The sanitization fix is defensive but the root cause should be reported to Manus support.

### 9.2 Recommended Next Steps

1. **Save checkpoint** — Capture the current working state
2. **Push to GitHub** — Sync the two minimal fixes back to `GS1Ned/isa_web_clean`
3. **Rotate expired tokens** — Remove or regenerate `ManusISARepoAutomation` and `manus` tokens
4. **Report DATABASE_URL issue** — Notify Manus support about the prefix injection bug

---

## 10. Summary

The migration from `GS1Ned/isa_web` to `GS1Ned/isa_web_clean` is complete. The ISA application is fully operational with database connectivity, preview loading, and all navigation features working. Three issues were identified and resolved with a total of 7 lines of code changes across 2 files.
