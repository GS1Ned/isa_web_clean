import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import { advisoryReports, advisoryReportVersions } from "../../drizzle/schema";
import type { EsrsDecisionArtifact } from "../esrs-decision-artifacts";

const mockDecisionArtifacts: EsrsDecisionArtifact[] = [
  {
    artifactVersion: "1.0",
    artifactType: "gap_analysis",
    capability: "ESRS_MAPPING",
    generatedAt: "2026-03-04T12:00:00.000Z",
    subject: {
      sector: "Retail",
      companySize: "large",
      targetRegulations: ["CSRD"],
    },
    confidence: {
      level: "medium",
      score: 0.67,
      basis: "Coverage analysis across mapped requirements.",
      reviewRecommended: true,
    },
    evidence: {
      codePaths: ["server/routers/gap-analyzer.ts"],
      dataSources: ["gs1_esrs_mappings"],
      evidenceRefs: [
        {
          sourceChunkId: 1001,
          evidenceKey: "ke:1001:hash",
          citationLabel: "CSRD — Article 19a",
          sourceLocator:
            "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464",
        },
      ],
    },
    summary: {
      totalRequirements: 12,
      coveragePercentage: 58,
      criticalGapCount: 2,
      highGapCount: 3,
      remediationPathCount: 1,
      criticalGapIds: ["gap-1"],
    },
  },
];

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("advisoryReports router", () => {
  describe("list", () => {
    it("returns empty array when no reports exist", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.advisoryReports.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("supports filtering by report type", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.advisoryReports.list({
        reportType: "COMPLIANCE_ASSESSMENT",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("supports filtering by review status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.advisoryReports.list({
        reviewStatus: "DRAFT",
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("stats", () => {
    it("returns advisory report statistics", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.advisoryReports.stats();

      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("byReviewStatus");
      expect(result).toHaveProperty("byPublicationStatus");
      expect(result).toHaveProperty("stale");
      expect(typeof result.total).toBe("number");
      expect(Array.isArray(result.byReviewStatus)).toBe(true);
      expect(Array.isArray(result.byPublicationStatus)).toBe(true);
      expect(typeof (result as any).stale?.count).toBe("number");
    });
  });

  describe("create (admin only) - Decision 4 enforcement", () => {
    it("allows admin to create advisory report", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const reportData = {
        title: "Test Compliance Assessment",
        reportType: "COMPLIANCE_ASSESSMENT" as const,
        content: "# Test Report\n\nThis is a test compliance assessment report.",
        executiveSummary: "Test summary for compliance assessment",
        decisionArtifacts: mockDecisionArtifacts,
        version: "1.0.0",
      };

      const result = await caller.advisoryReports.create(reportData);

      expect(result).toBeDefined();

      // Clean up
      const db = await getDb();
      if (db && result.insertId) {
        await db.delete(advisoryReports).where({ id: Number(result.insertId) } as any);
      }
    });

    it("rejects non-admin user from creating report", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const reportData = {
        title: "Unauthorized Report",
        reportType: "COMPLIANCE_ASSESSMENT" as const,
        content: "Should fail",
        version: "1.0.0",
      };

      await expect(caller.advisoryReports.create(reportData)).rejects.toThrow(
        "Admin access required"
      );
    });

    it("enforces Decision 4: defaults to INTERNAL_ONLY publication status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const reportData = {
        title: "Decision 4 Test Report",
        reportType: "STANDARDS_MAPPING" as const,
        content: "Testing Decision 4 enforcement",
        version: "1.0.0",
      };

      const result = await caller.advisoryReports.create(reportData);

      expect(result).toBeDefined();

      // Verify INTERNAL_ONLY status was applied
      const db = await getDb();
      if (db && result.insertId) {
        const created = await db
          .select()
          .from(advisoryReports)
          .where({ id: Number(result.insertId) } as any)
          .limit(1);

        expect(created[0]?.publicationStatus).toBe("INTERNAL_ONLY");
        expect(created[0]?.reviewStatus).toBe("DRAFT");
        expect(created[0]?.laneStatus).toBe("LANE_C");

        // Clean up
        await db.delete(advisoryReports).where({ id: Number(result.insertId) } as any);
      }
    });

    it("sets generatedBy to admin user name", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const reportData = {
        title: "Generated By Test",
        reportType: "GAP_ANALYSIS" as const,
        content: "Testing generatedBy field",
        version: "1.0.0",
      };

      const result = await caller.advisoryReports.create(reportData);

      const db = await getDb();
      if (db && result.insertId) {
        const created = await db
          .select()
          .from(advisoryReports)
          .where({ id: Number(result.insertId) } as any)
          .limit(1);

        expect(created[0]?.generatedBy).toBe("Admin User");

        // Clean up
        await db.delete(advisoryReports).where({ id: Number(result.insertId) } as any);
      }
    });

    it("persists decision artifacts when provided", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.advisoryReports.create({
        title: "Decision Artifact Persistence Test",
        reportType: "GAP_ANALYSIS" as const,
        content: "Testing persisted decision artifacts",
        version: "1.0.0",
        decisionArtifacts: mockDecisionArtifacts,
      });

      const db = await getDb();
      if (db && result.insertId) {
        const created = await db
          .select()
          .from(advisoryReports)
          .where({ id: Number(result.insertId) } as any)
          .limit(1);

        const persistedArtifacts = created[0]?.decisionArtifacts as EsrsDecisionArtifact[] | undefined;

        expect(Array.isArray(persistedArtifacts)).toBe(true);
        expect(persistedArtifacts?.[0]?.artifactType).toBe("gap_analysis");
        expect(persistedArtifacts?.[0]?.evidence?.evidenceRefs?.[0]?.evidenceKey).toBe(
          "ke:1001:hash"
        );

        await db.delete(advisoryReports).where({ id: Number(result.insertId) } as any);
      }
    });
  });

  describe("update (admin only)", () => {
    it("allows admin to update report content", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create test report
      const createResult = await caller.advisoryReports.create({
        title: "Update Test Report",
        reportType: "IMPLEMENTATION_GUIDE" as const,
        content: "Original content",
        version: "1.0.0",
      });

      const reportId = Number(createResult.insertId);

      // Update it
      const updateResult = await caller.advisoryReports.update({
        id: reportId,
        content: "Updated content",
        title: "Updated Title",
        decisionArtifacts: mockDecisionArtifacts,
      });

      expect(updateResult).toBeDefined();

      // Verify update
      const db = await getDb();
      if (db) {
        const updated = await db
          .select()
          .from(advisoryReports)
          .where({ id: reportId } as any)
          .limit(1);

        expect(updated[0]?.content).toBe("Updated content");
        expect(updated[0]?.title).toBe("Updated Title");
        expect((updated[0]?.decisionArtifacts as EsrsDecisionArtifact[] | undefined)?.[0]?.artifactType).toBe("gap_analysis");
        expect(
          (updated[0]?.decisionArtifacts as EsrsDecisionArtifact[] | undefined)?.[0]?.evidence
            ?.evidenceRefs?.[0]?.citationLabel
        ).toContain("Article 19a");

        // Clean up
        await db.delete(advisoryReports).where({ id: reportId } as any);
      }
    });

    it("rejects non-admin from updating report", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.advisoryReports.update({
          id: 999,
          content: "Should fail",
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("updateReviewStatus (admin only)", () => {
    it("allows admin to update review status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create test report
      const createResult = await caller.advisoryReports.create({
        title: "Review Status Test",
        reportType: "SECTOR_ADVISORY" as const,
        content: "Testing review status updates",
        version: "1.0.0",
      });

      const reportId = Number(createResult.insertId);

      // Update review status
      const updateResult = await caller.advisoryReports.updateReviewStatus({
        id: reportId,
        reviewStatus: "UNDER_REVIEW",
        reviewNotes: "Initial review in progress",
      });

      expect(updateResult).toBeDefined();

      // Verify update
      const db = await getDb();
      if (db) {
        const updated = await db
          .select()
          .from(advisoryReports)
          .where({ id: reportId } as any)
          .limit(1);

        expect(updated[0]?.reviewStatus).toBe("UNDER_REVIEW");
        expect(updated[0]?.reviewedBy).toBe("Admin User");

        // Clean up
        await db.delete(advisoryReports).where({ id: reportId } as any);
      }
    });

    it("rejects non-admin from updating review status", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.advisoryReports.updateReviewStatus({
          id: 999,
          reviewStatus: "APPROVED",
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("createVersion (admin only)", () => {
    it("allows admin to create report version", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create base report
      const createResult = await caller.advisoryReports.create({
        title: "Versioning Test Report",
        reportType: "REGULATION_IMPACT" as const,
        content: "Version 1.0.0 content",
        version: "1.0.0",
        decisionArtifacts: mockDecisionArtifacts,
      });

      const reportId = Number(createResult.insertId);

      // Create version
      const versionResult = await caller.advisoryReports.createVersion({
        reportId,
        version: "1.1.0",
        content: "Version 1.1.0 content",
        changeLog: "Updated with new regulations",
      });

      expect(versionResult).toBeDefined();

      // Clean up
      const db = await getDb();
      if (db) {
        const versions = await db
          .select()
          .from(advisoryReportVersions)
          .where({ reportId } as any);

        expect(versions).toHaveLength(1);
        expect((versions[0]?.decisionArtifacts as EsrsDecisionArtifact[] | undefined)?.[0]?.artifactType).toBe("gap_analysis");
        expect(
          (versions[0]?.decisionArtifacts as EsrsDecisionArtifact[] | undefined)?.[0]?.evidence
            ?.evidenceRefs?.[0]?.sourceChunkId
        ).toBe(1001);

        await db.delete(advisoryReportVersions).where({ reportId } as any);
        await db.delete(advisoryReports).where({ id: reportId } as any);
      }
    });

    it("allows explicit version decision artifacts to override the source report snapshot", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const createResult = await caller.advisoryReports.create({
        title: "Version Override Test Report",
        reportType: "REGULATION_IMPACT" as const,
        content: "Version 1.0.0 content",
        version: "1.0.0",
        decisionArtifacts: mockDecisionArtifacts,
      });

      const reportId = Number(createResult.insertId);
      const overrideArtifacts: EsrsDecisionArtifact[] = [
        {
          ...mockDecisionArtifacts[0],
          artifactType: "roadmap",
          summary: {
            phaseCount: 3,
            criticalPhaseCount: 1,
            quickWinCount: 1,
            mappingCount: 8,
            topPhaseIds: ["phase-1"],
          },
          subject: {
            sector: "Retail",
            companySize: "large",
            esrsRequirements: ["ESRS E1"],
          },
        } as EsrsDecisionArtifact,
      ];

      await caller.advisoryReports.createVersion({
        reportId,
        version: "1.1.0",
        content: "Version 1.1.0 content",
        decisionArtifacts: overrideArtifacts,
      });

      const db = await getDb();
      if (db) {
        const versions = await db
          .select()
          .from(advisoryReportVersions)
          .where({ reportId } as any);

        expect((versions[0]?.decisionArtifacts as EsrsDecisionArtifact[] | undefined)?.[0]?.artifactType).toBe("roadmap");
        expect(
          (versions[0]?.decisionArtifacts as EsrsDecisionArtifact[] | undefined)?.[0]?.evidence
            ?.evidenceRefs?.[0]?.sourceChunkId
        ).toBe(1001);

        await db.delete(advisoryReportVersions).where({ reportId } as any);
        await db.delete(advisoryReports).where({ id: reportId } as any);
      }
    });

    it("rejects version creation when the source report does not exist", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.advisoryReports.createVersion({
          reportId: 999999,
          version: "1.1.0",
          content: "Missing source report",
        }),
      ).rejects.toThrow("Report not found");
    });

    it("rejects non-admin from creating version", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.advisoryReports.createVersion({
          reportId: 999,
          version: "2.0.0",
          content: "Should fail",
        })
      ).rejects.toThrow("Admin access required");
    });
  });
});
