import { describe, it, expect, beforeEach } from "vitest";
import {
  exportRegulationToPDFBranded,
  exportRegulationToCSVBranded,
  generateExportFilename,
  DEFAULT_BRANDING,
  type BrandingConfig,
  type RegulationExportData,
} from "./export-utils-branded";
import {
  getCachedExport,
  cacheExport,
  invalidateCache,
  invalidateAllCaches,
  getCacheStats,
  cleanupExpiredCache,
} from "./export-scheduler";
import { vi } from "vitest";

// Mock S3 storage to avoid network timeouts in tests
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "mock-key", url: "https://mock-s3.example.com/file" }),
  storageGet: vi.fn().mockResolvedValue({ key: "mock-key", url: "https://mock-s3.example.com/file" }),
}));

// Mock regulation data
const mockRegulation: RegulationExportData = {
  id: "1",
  title: "Corporate Sustainability Reporting Directive (CSRD)",
  type: "CSRD",
  celexId: "32022L0464",
  description:
    "The CSRD requires large EU companies to report on their sustainability performance and impacts.",
  effectiveDate: new Date("2024-01-01"),
  enforcementDate: new Date("2025-01-01"),
  status: "Active",
  applicableSectors: ["Manufacturing", "Retail", "Finance"],
  applicableGS1Standards: ["GTIN", "EPCIS", "Digital Product Passport"],
  implementationPhases: [
    {
      phase: "Phase 1",
      deadline: "2024-01-01",
      description: "Initial compliance requirements",
    },
    {
      phase: "Phase 2",
      deadline: "2025-01-01",
      description: "Full implementation",
    },
  ],
  relatedRegulations: ["ESRS", "DPP"],
  faqItems: [
    {
      question: "What is CSRD?",
      answer: "CSRD is the Corporate Sustainability Reporting Directive.",
    },
  ],
  checklist: [
    {
      item: "Establish sustainability reporting team",
      description: "Form a dedicated team",
      priority: "high",
      completed: false,
    },
  ],
};

// Custom branding configuration
const customBranding: BrandingConfig = {
  companyName: "GS1 Global",
  primaryColor: "#003366",
  secondaryColor: "#0099CC",
  footerText: "© 2025 GS1 Global - Confidential",
  headerText: "GS1 Compliance Report",
  includeWatermark: true,
  watermarkText: "DRAFT",
};

describe("Export Enhancements", () => {
  describe("Branded PDF Export", () => {
    it("should generate branded PDF with default branding", () => {
      const pdfBuffer = exportRegulationToPDFBranded(mockRegulation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
    });

    it("should generate branded PDF with custom branding", () => {
      const pdfBuffer = exportRegulationToPDFBranded(
        mockRegulation,
        customBranding
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should include company name in branded PDF", () => {
      const pdfBuffer = exportRegulationToPDFBranded(
        mockRegulation,
        customBranding
      );
      const pdfText = pdfBuffer.toString("latin1");

      // PDF should be valid
      expect(pdfText.length).toBeGreaterThan(0);
    });

    it("should handle watermark in branded PDF", () => {
      const brandingWithWatermark: BrandingConfig = {
        ...customBranding,
        includeWatermark: true,
        watermarkText: "CONFIDENTIAL",
      };

      const pdfBuffer = exportRegulationToPDFBranded(
        mockRegulation,
        brandingWithWatermark
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle multiple pages with footer", () => {
      const regulationWithManyFAQs: RegulationExportData = {
        ...mockRegulation,
        faqItems: Array.from({ length: 20 }, (_, i) => ({
          question: `Question ${i + 1}?`,
          answer: `Answer to question ${i + 1}. This is a detailed answer.`,
        })),
      };

      const pdfBuffer = exportRegulationToPDFBranded(
        regulationWithManyFAQs,
        customBranding
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("Branded CSV Export", () => {
    it("should generate branded CSV with default branding", () => {
      const csvContent = exportRegulationToCSVBranded(mockRegulation);

      expect(typeof csvContent).toBe("string");
      expect(csvContent.length).toBeGreaterThan(0);
    });

    it("should generate branded CSV with custom branding", () => {
      const csvContent = exportRegulationToCSVBranded(
        mockRegulation,
        customBranding
      );

      expect(typeof csvContent).toBe("string");
      expect(csvContent).toContain("GS1 Global");
      expect(csvContent).toContain("GS1 Compliance Report");
    });

    it("should include company name in header", () => {
      const csvContent = exportRegulationToCSVBranded(
        mockRegulation,
        customBranding
      );

      expect(csvContent).toContain("GS1 Global");
    });

    it("should include footer text in CSV", () => {
      const csvContent = exportRegulationToCSVBranded(
        mockRegulation,
        customBranding
      );

      expect(csvContent).toContain("© 2025 GS1 Global - Confidential");
    });

    it("should properly escape CSV values", () => {
      const regulationWithQuotes: RegulationExportData = {
        ...mockRegulation,
        description: 'Description with "quotes" and, commas',
      };

      const csvContent = exportRegulationToCSVBranded(
        regulationWithQuotes,
        customBranding
      );

      expect(csvContent).toContain('""quotes""');
    });

    it("should include all sections in CSV", () => {
      const csvContent = exportRegulationToCSVBranded(
        mockRegulation,
        customBranding
      );

      expect(csvContent).toContain("REGULATION DETAILS");
      expect(csvContent).toContain("DESCRIPTION");
      expect(csvContent).toContain("APPLICABLE SECTORS");
      expect(csvContent).toContain("APPLICABLE GS1 STANDARDS");
      expect(csvContent).toContain("IMPLEMENTATION TIMELINE");
      expect(csvContent).toContain("IMPLEMENTATION CHECKLIST");
      expect(csvContent).toContain("FREQUENTLY ASKED QUESTIONS");
    });
  });

  describe("Export Caching", () => {
    beforeEach(() => {
      invalidateAllCaches();
    });

    it("should cache export successfully", async () => {
      const pdfBuffer = exportRegulationToPDFBranded(mockRegulation);
      const filename = generateExportFilename(mockRegulation.title, "pdf");

      const cacheEntry = await cacheExport("1", "pdf", pdfBuffer, filename);

      expect(cacheEntry).not.toBeNull();
      expect(cacheEntry?.regulationId).toBe("1");
      expect(cacheEntry?.format).toBe("pdf");
    });

    it("should retrieve cached export", async () => {
      const pdfBuffer = exportRegulationToPDFBranded(mockRegulation);
      const filename = generateExportFilename(mockRegulation.title, "pdf");

      await cacheExport("1", "pdf", pdfBuffer, filename);
      const cached = await getCachedExport("1", "pdf");

      expect(cached).not.toBeNull();
      expect(cached?.url).toBeDefined();
    });

    it("should return null for non-cached export", async () => {
      const cached = await getCachedExport("999", "pdf");

      expect(cached).toBeNull();
    });

    it("should invalidate cache for regulation", async () => {
      const pdfBuffer = exportRegulationToPDFBranded(mockRegulation);
      const filename = generateExportFilename(mockRegulation.title, "pdf");

      await cacheExport("1", "pdf", pdfBuffer, filename);
      invalidateCache("1");

      const cached = await getCachedExport("1", "pdf");
      expect(cached).toBeNull();
    });

    it("should get cache statistics", async () => {
      const pdfBuffer = exportRegulationToPDFBranded(mockRegulation);
      const filename = generateExportFilename(mockRegulation.title, "pdf");

      await cacheExport("1", "pdf", pdfBuffer, filename);
      const stats = getCacheStats();

      expect(stats.totalCached).toBeGreaterThan(0);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.entries.length).toBeGreaterThan(0);
    });

    it("should cleanup expired cache entries", async () => {
      const pdfBuffer = exportRegulationToPDFBranded(mockRegulation);
      const filename = generateExportFilename(mockRegulation.title, "pdf");

      await cacheExport("1", "pdf", pdfBuffer, filename);

      // Cleanup should not remove fresh entries
      const cleaned = cleanupExpiredCache();
      expect(cleaned).toBe(0);
    });
  });

  describe("Export Filename Generation", () => {
    it("should generate valid PDF filename", () => {
      const filename = generateExportFilename(
        "Corporate Sustainability Reporting Directive",
        "pdf"
      );

      expect(filename).toMatch(/\.pdf$/);
      expect(filename).toContain("regulation-");
      expect(filename).toContain(new Date().toISOString().split("T")[0]);
    });

    it("should generate valid CSV filename", () => {
      const filename = generateExportFilename(
        "Corporate Sustainability Reporting Directive",
        "csv"
      );

      expect(filename).toMatch(/\.csv$/);
      expect(filename).toContain("regulation-");
    });

    it("should sanitize special characters in filename", () => {
      const filename = generateExportFilename("CSRD/DPP (2024) - Test!", "pdf");

      expect(filename).not.toContain("/");
      expect(filename).not.toContain("(");
      expect(filename).not.toContain(")");
      expect(filename).not.toContain("!");
    });

    it("should limit filename length", () => {
      const longTitle = "A".repeat(100);
      const filename = generateExportFilename(longTitle, "pdf");

      expect(filename.length).toBeLessThan(100);
    });
  });

  describe("Branding Configuration", () => {
    it("should use default branding when not provided", () => {
      const pdfBuffer = exportRegulationToPDFBranded(mockRegulation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should support custom primary color", () => {
      const customColor: BrandingConfig = {
        ...DEFAULT_BRANDING,
        primaryColor: "#FF0000",
      };

      const pdfBuffer = exportRegulationToPDFBranded(
        mockRegulation,
        customColor
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
    });

    it("should support custom secondary color", () => {
      const customColor: BrandingConfig = {
        ...DEFAULT_BRANDING,
        secondaryColor: "#00FF00",
      };

      const pdfBuffer = exportRegulationToPDFBranded(
        mockRegulation,
        customColor
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
    });

    it("should support custom footer text", () => {
      const customFooter: BrandingConfig = {
        ...DEFAULT_BRANDING,
        footerText: "Custom Footer Text",
      };

      const csvContent = exportRegulationToCSVBranded(
        mockRegulation,
        customFooter
      );

      expect(csvContent).toContain("Custom Footer Text");
    });

    it("should support custom header text", () => {
      const customHeader: BrandingConfig = {
        ...DEFAULT_BRANDING,
        headerText: "Custom Header",
      };

      const csvContent = exportRegulationToCSVBranded(
        mockRegulation,
        customHeader
      );

      expect(csvContent).toContain("Custom Header");
    });
  });

  describe("White-label Distribution", () => {
    it("should generate white-label PDF with company branding", () => {
      const whitelabelBranding: BrandingConfig = {
        companyName: "Partner Company Inc.",
        primaryColor: "#1a1a1a",
        secondaryColor: "#666666",
        footerText: "© 2025 Partner Company Inc. All Rights Reserved",
        headerText: "Partner Compliance Report",
      };

      const pdfBuffer = exportRegulationToPDFBranded(
        mockRegulation,
        whitelabelBranding
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should generate white-label CSV with company branding", () => {
      const whitelabelBranding: BrandingConfig = {
        companyName: "Partner Company Inc.",
        footerText: "© 2025 Partner Company Inc.",
        headerText: "Partner Compliance Report",
      };

      const csvContent = exportRegulationToCSVBranded(
        mockRegulation,
        whitelabelBranding
      );

      expect(csvContent).toContain("Partner Company Inc.");
      expect(csvContent).toContain("Partner Compliance Report");
    });

    it("should support multiple white-label configurations", () => {
      const configs = [
        {
          companyName: "Company A",
          primaryColor: "#0066CC",
        },
        {
          companyName: "Company B",
          primaryColor: "#CC0000",
        },
        {
          companyName: "Company C",
          primaryColor: "#00CC00",
        },
      ];

      configs.forEach(config => {
        const branding: BrandingConfig = {
          ...DEFAULT_BRANDING,
          ...config,
        };

        const pdfBuffer = exportRegulationToPDFBranded(
          mockRegulation,
          branding
        );
        const csvContent = exportRegulationToCSVBranded(
          mockRegulation,
          branding
        );

        expect(pdfBuffer).toBeInstanceOf(Buffer);
        expect(csvContent).toContain(config.companyName);
      });
    });
  });
});
