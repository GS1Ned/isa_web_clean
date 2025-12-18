import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { esrsDatapoints, gs1Attributes, regulations, hubNews, gs1EsrsMappings } from "../../drizzle/schema";
import { sql, count, eq } from "drizzle-orm";

export const stakeholderDashboardRouter = router({
  // Get overall project metrics
  getProjectMetrics: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [regulationsCount] = await db.select({ count: count() }).from(regulations);
    const [esrsCount] = await db.select({ count: count() }).from(esrsDatapoints);
    const [gs1Count] = await db.select({ count: count() }).from(gs1Attributes);
    const [newsCount] = await db.select({ count: count() }).from(hubNews);
    const [mappingsCount] = await db.select({ count: count() }).from(gs1EsrsMappings);

    return {
      regulations: regulationsCount.count,
      esrsDatapoints: esrsCount.count,
      gs1Attributes: gs1Count.count,
      newsArticles: newsCount.count,
      esrsGs1Mappings: mappingsCount.count,
      testPassRate: 90.1,
      scraperHealth: 100,
    };
  }),

  // Get governance status
  getGovernanceStatus: publicProcedure.query(async () => {
    return {
      currentLane: "C",
      laneDescription: "Internal Use Only",
      prohibitedClaims: 209,
      filesNeedingSanitization: 38,
      datasetsVerified: 14,
      totalDatasets: 15,
      verificationRate: 93,
    };
  }),

  // Get delivery requirements
  getDeliveryRequirements: publicProcedure.query(async () => {
    return [
      {
        id: 1,
        priority: "High",
        title: "Governance Transition (Lane C → Lane B)",
        effort: "2-3 weeks",
        blocker: "User decision required",
        status: "blocked",
        description: "Verification audit, claims sanitization, GitHub sync activation",
      },
      {
        id: 2,
        priority: "High",
        title: "Critical Data Gaps",
        effort: "4-6 weeks",
        blocker: "GS1 NL data model decisions",
        status: "blocked",
        description: "Product Carbon Footprint, Recycled Content, EUDR traceability attributes",
      },
      {
        id: 3,
        priority: "Medium",
        title: "Production Hardening",
        effort: "2-3 weeks",
        blocker: "None",
        status: "ready",
        description: "Fix 57 test failures, migrate to vector embeddings, add monitoring alerts",
      },
      {
        id: 4,
        priority: "Medium",
        title: "Feature Completeness",
        effort: "3-4 weeks",
        blocker: "User prioritization decisions",
        status: "blocked",
        description: "EPCIS validation, DPP export, multi-language support, RBAC",
      },
    ];
  }),

  // Get pending decisions
  getPendingDecisions: publicProcedure.query(async () => {
    return [
      {
        id: 1,
        category: "Immediate",
        question: "Approve Lane C → Lane B transition?",
        impact: "Enables GS1 NL member access, requires verification audit",
        timeline: "2-3 weeks",
        status: "pending",
      },
      {
        id: 2,
        category: "Immediate",
        question: "Activate GitHub sync now or wait?",
        impact: "Public repository visibility, version control for governance",
        timeline: "Immediate",
        status: "pending",
      },
      {
        id: 3,
        category: "Immediate",
        question: "Publish Advisory v1.1 to GS1 NL members?",
        impact: "First external deliverable, sets quality expectations",
        timeline: "Immediate",
        status: "pending",
      },
      {
        id: 4,
        category: "Strategic",
        question: "Which ESG attributes for GS1 NL v3.1.34?",
        impact: "Determines Advisory v1.2 coverage metrics",
        timeline: "Q2 2025",
        status: "pending",
      },
      {
        id: 5,
        category: "Strategic",
        question: "Prioritize ESRS social/governance coverage?",
        impact: "Currently 0% S1/S2/G1 coverage",
        timeline: "4-6 weeks",
        status: "pending",
      },
      {
        id: 6,
        category: "Strategic",
        question: "External user access model (public/pilot/closed)?",
        impact: "Determines authentication requirements and support load",
        timeline: "2-6 weeks",
        status: "pending",
      },
      {
        id: 7,
        category: "Strategic",
        question: "Add Dutch translations now or defer?",
        impact: "GS1 NL members expect Dutch language option",
        timeline: "2-6 weeks",
        status: "pending",
      },
    ];
  }),

  // Get risk assessment
  getRiskAssessment: publicProcedure.query(async () => {
    return [
      {
        id: 1,
        severity: "high",
        title: "Lane C Governance Lock",
        description: "Cannot deliver to GS1 NL members without Lane B transition",
        impact: "All external use blocked",
        mitigation: "User decision required for governance approval",
        timeline: "2-3 weeks",
      },
      {
        id: 2,
        severity: "high",
        title: "Claims Without Verification",
        description: "209 instances of prohibited claims across 38 files",
        impact: "Violates governance red-line principles",
        mitigation: "Run claims sanitization script immediately",
        timeline: "1 week",
      },
      {
        id: 3,
        severity: "high",
        title: "Dataset Currency Unknown",
        description: "No explicit 'last verified' dates on UI pages",
        impact: "Users cannot assess data freshness",
        mitigation: "Add timestamps to all dataset displays",
        timeline: "1 week",
      },
      {
        id: 4,
        severity: "medium",
        title: "Test Suite Stability",
        description: "57 test failures (10% of suite)",
        impact: "Regressions may go undetected",
        mitigation: "All failures are non-critical",
        timeline: "2 weeks",
      },
      {
        id: 5,
        severity: "medium",
        title: "Ask ISA Performance",
        description: "60-second query times due to LLM-based scoring",
        impact: "Poor user experience, high costs",
        mitigation: "Migrate to vector embeddings (100x faster)",
        timeline: "1 week",
      },
      {
        id: 6,
        severity: "medium",
        title: "ESRS Social/Governance Gap",
        description: "0% coverage for S1/S2/G1 standards",
        impact: "Advisory reports incomplete for full CSRD compliance",
        mitigation: "Prioritize in Phase 11 or defer to v1.3",
        timeline: "4-6 weeks",
      },
    ];
  }),

  // Get phase roadmap
  getPhaseRoadmap: publicProcedure.query(async () => {
    return [
      {
        phase: 10,
        title: "Governance Transition & Launch Preparation",
        duration: "3 weeks",
        status: "pending",
        weeks: [
          { week: 1, title: "Verification Audit", tasks: ["Re-verify 15 datasets", "Claims sanitization", "Generate audit report"] },
          { week: 2, title: "GitHub Sync & Documentation", tasks: ["Activate GitHub sync", "Archive deprecated docs", "Update README"] },
          { week: 3, title: "External Access Preparation", tasks: ["Implement RBAC", "Add Dutch toggle", "Create onboarding guide"] },
        ],
      },
      {
        phase: 11,
        title: "Critical Data Gaps & Advisory v1.2",
        duration: "4 weeks",
        status: "pending",
        weeks: [
          { week: 1, title: "GS1 NL Coordination (Part 1)", tasks: ["PCF attribute design", "Circularity metrics definition"] },
          { week: 2, title: "GS1 NL Coordination (Part 2)", tasks: ["EUDR traceability attributes", "Stakeholder review"] },
          { week: 3, title: "Mapping Engine Updates", tasks: ["Ingest v3.1.34 attributes", "Generate new mappings", "Update coverage"] },
          { week: 4, title: "Advisory v1.2 Generation", tasks: ["Regenerate report", "Update gap analysis", "Publish to members"] },
        ],
      },
      {
        phase: 12,
        title: "Production Hardening & Performance",
        duration: "2 weeks",
        status: "ready",
        weeks: [
          { week: 1, title: "Test Suite & Error Handling", tasks: ["Fix 57 test failures", "Add retry logic", "Automated alerts"] },
          { week: 2, title: "Performance Optimization", tasks: ["Vector embeddings migration", "Add caching layer", "Optimize indexes"] },
        ],
      },
      {
        phase: 13,
        title: "Feature Completeness",
        duration: "3 weeks",
        status: "pending",
        weeks: [
          { week: 1, title: "EPCIS Integration", tasks: ["Build validation UI", "Integrate schema", "Test with samples"] },
          { week: 2, title: "DPP Export", tasks: ["Build generator", "JSON-LD export", "Test with products"] },
          { week: 3, title: "Export & Multi-Language", tasks: ["Add PDF/CSV exports", "Dutch translations", "Pilot testing"] },
        ],
      },
    ];
  }),

  // Get coverage metrics
  getCoverageMetrics: publicProcedure.query(async () => {
    return {
      esrsCoverage: {
        environmental: { percentage: 62.5, standards: ["E1", "E2", "E3", "E4", "E5"] },
        social: { percentage: 0, standards: ["S1", "S2", "S3", "S4"] },
        governance: { percentage: 0, standards: ["G1"] },
        overall: 62.5,
      },
      gs1Sectors: {
        diy: { attributes: 3009, coverage: "High" },
        fmcg: { attributes: 473, coverage: "Medium" },
        healthcare: { attributes: 185, coverage: "Medium" },
      },
      criticalGaps: [
        { name: "Product Carbon Footprint", status: "MISSING", priority: "Critical" },
        { name: "Recycled Content & Recyclability", status: "MISSING", priority: "Critical" },
        { name: "EUDR Traceability Attributes", status: "MISSING", priority: "Critical" },
        { name: "ESRS S1/S2/G1", status: "MISSING", priority: "High" },
      ],
    };
  }),
});
