# EUR-Lex Web Service Research Findings

**Date:** December 2, 2025  
**Purpose:** Determine feasibility of automated EUR-Lex regulation ingestion for ISA platform

---

## EUR-Lex Web Service Overview

### Technology

- **Protocol:** SOAP (XML-based)
- **Access:** Free after registration
- **Authentication:** Username/password credentials
- **Query Format:** Expert query syntax (similar to EUR-Lex website search)
- **Response Format:** XML metadata only

### Key Capabilities

✅ Query EUR-Lex directly without website interaction  
✅ Full-text search within document content  
✅ Expert search query support (same as website)  
✅ Metadata retrieval in XML format  
❌ **Cannot download document files directly via SOAP API**

### Document Download Methods

1. **Cellar RESTful API** - Download documents by identifier
2. **Stable URL construction** - Create direct download links using guidelines

---

## Registration Process

### Steps to Register

1. Visit [Webservice registration](https://eur-lex.europa.eu/content/help/data-reuse/webservice.html?locale=en)
2. Click "Register" (requires EU Login account)
3. Create EU Login account if needed
4. Click "Sign in" and complete registration form
5. Fill out form with:
   - **Used data:** Purpose of data usage
   - **Final use of data:** What you intend to do with the data
   - **Maximum calls per day:** Expected API usage volume
   - **Comments:** Additional context
   - **User details:** Name, email, organization, country
   - **Terms acceptance:** Accept EUR-Lex conditions of use
6. Submit form and wait for email with access credentials

### Access Credentials

- **WSDL URL:** https://eur-lex.europa.eu/eurlex-ws?wsdl
- **Username:** Provided via email after registration approval
- **Password:** Provided via email after registration approval

---

## Using the Web Service

### Query Process

1. Call webservice with username/password
2. Provide WSDL URL to application
3. Construct query using [expert query syntax](https://eur-lex.europa.eu/content/help/search/expert-search.html)
4. Query can contain:
   - `SELECT` clause (metadata fields to return)
   - `ORDER BY` clause (sorting)
   - Full-text search terms
5. Receive XML response with metadata

### Expert Query Syntax

Queries must be written in EUR-Lex expert query format:

- Example: `SELECT DN, TI WHERE DT = 'Regulation' AND DD >= '2024-01-01'`
- Can filter by document type, date, CELEX number, subject matter, etc.
- Supports full-text search within document content

---

## Alternative: CELLAR SPARQL Endpoint

### Why CELLAR is Better for ISA

✅ **No registration required** (public endpoint)  
✅ **SPARQL queries** (more flexible than SOAP)  
✅ **Direct metadata access** (no XML parsing)  
✅ **Already implemented** in ISA (cellar-connector.ts)  
✅ **RESTful API** for document downloads

### CELLAR Capabilities

- SPARQL endpoint: https://publications.europa.eu/webapi/rdf/sparql
- Query all EU publications metadata
- Filter by CELEX ID, date, type, subject
- Download documents via RESTful API

---

## Recommendation for ISA

### ❌ Do NOT use EUR-Lex SOAP Web Service

**Reasons:**

1. Requires manual registration and approval
2. SOAP protocol is legacy technology (harder to implement)
3. XML response parsing adds complexity
4. Cannot download document files directly
5. Rate limits may be restrictive

### ✅ Use CELLAR SPARQL Endpoint (Already Implemented)

**Reasons:**

1. **No registration required** - public endpoint
2. **Modern SPARQL queries** - flexible and powerful
3. **Already working** in ISA codebase (cellar-connector.ts)
4. **RESTful document downloads** - simple HTTP requests
5. **No rate limits** for reasonable usage

### Implementation Strategy

1. **Keep existing CELLAR connector** (server/cellar-connector.ts)
2. **Fix SPARQL query** to return ESG regulations (currently returns 0 results)
3. **Optimize query performance** (currently queries 500 legal acts)
4. **Add weekly cron job** for automated ingestion
5. **Use Cellar RESTful API** for document downloads if needed

---

## CELLAR Query Optimization Plan

### Current Issue

- Query returns 500 legal acts but 0 ESG regulations after filtering
- CELEX ID regex may be too restrictive: `^3[0-9]{4}[LR]`
- Need to broaden search to capture CSRD, ESRS, EUDR, DPP, PPWR, CSDDD

### Proposed Fix

1. **Expand CELEX pattern** to include all regulation types
2. **Add keyword filtering** in SPARQL query (sustainability, ESG, climate, etc.)
3. **Query by subject matter** codes (environment, social, governance)
4. **Test with known CELEX IDs** (32013R0575 for CSRD, etc.)

---

## Next Steps

1. ✅ Research EUR-Lex SOAP API (completed - not recommended)
2. ⏭️ Fix CELLAR SPARQL query to return ESG regulations
3. ⏭️ Optimize query performance (reduce from 500 to ~50 relevant acts)
4. ⏭️ Create weekly cron job for automated CELLAR ingestion
5. ⏭️ Add email notifications for new regulations discovered
6. ⏭️ Test end-to-end ingestion workflow

---

## Conclusion

**EUR-Lex SOAP API is not suitable for ISA automation.**  
**CELLAR SPARQL endpoint is the correct choice** - it's already implemented, requires no registration, and provides all needed functionality. Focus efforts on optimizing the existing CELLAR connector rather than implementing a new EUR-Lex SOAP client.
