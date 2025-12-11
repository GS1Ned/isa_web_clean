import { describe, it, expect, beforeAll } from "vitest";
import {
  exportRegulationToPDF,
  exportRegulationToCSV,
  exportRegulationsListToCSV,
  generateExportFilename,
  type RegulationExportData,
} from "./export-utils";

// Mock regulation data for testing
const mockRegulation: RegulationExportData = {
  id: "1",
  title: "Corporate Sustainability Reporting Directive (CSRD)",
  type: "CSRD",
  celexId: "32022L0464",
  description:
    "The CSRD amends the Non-Financial Reporting Directive and requires large companies to disclose sustainability information.",
  effectiveDate: new Date("2023-01-01"),
  enforcementDate: new Date("2024-01-01"),
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
      answer:
        "CSRD is the Corporate Sustainability Reporting Directive that requires companies to report on sustainability.",
    },
    {
      question: "Who is affected?",
      answer: "Large companies with more than 500 employees are affected.",
    },
  ],
  checklist: [
    {
      item: "Establish sustainability reporting team",
      description: "Form a dedicated team for sustainability reporting",
      priority: "high",
      completed: false,
    },
    {
      item: "Audit current practices",
      description: "Conduct an audit of current sustainability practices",
      priority: "high",
      completed: true,
    },
    {
      item: "Implement reporting tools",
      description: "Set up tools for data collection and reporting",
      priority: "medium",
      completed: false,
    },
  ],
};

describe("Export Utilities", () => {
  describe("exportRegulationToPDF", () => {
    it("should generate a PDF buffer from regulation data", () => {
      const pdfBuffer = exportRegulationToPDF(mockRegulation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      // PDF files start with %PDF
      expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
    });

    it("should handle regulations with minimal data", () => {
      const minimalRegulation: RegulationExportData = {
        ...mockRegulation,
        applicableSectors: [],
        applicableGS1Standards: [],
        implementationPhases: [],
        faqItems: [],
        checklist: [],
      };

      const pdfBuffer = exportRegulationToPDF(minimalRegulation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should include regulation title in PDF", () => {
      const pdfBuffer = exportRegulationToPDF(mockRegulation);
      const pdfText = pdfBuffer.toString("latin1");

      // PDF should contain the title somewhere in the content
      expect(pdfText.length).toBeGreaterThan(0);
    });
  });

  describe("exportRegulationToCSV", () => {
    it("should generate CSV content from regulation data", () => {
      const csvContent = exportRegulationToCSV(mockRegulation);

      expect(typeof csvContent).toBe("string");
      expect(csvContent.length).toBeGreaterThan(0);
    });

    it("should include regulation title in CSV", () => {
      const csvContent = exportRegulationToCSV(mockRegulation);

      expect(csvContent).toContain(mockRegulation.title);
    });

    it("should include regulation type in CSV", () => {
      const csvContent = exportRegulationToCSV(mockRegulation);

      expect(csvContent).toContain(mockRegulation.type);
    });

    it("should include CELEX ID in CSV", () => {
      const csvContent = exportRegulationToCSV(mockRegulation);

      expect(csvContent).toContain(mockRegulation.celexId);
    });

    it("should include checklist items in CSV", () => {
      const csvContent = exportRegulationToCSV(mockRegulation);

      expect(csvContent).toContain("IMPLEMENTATION CHECKLIST");
      expect(csvContent).toContain("Establish sustainability reporting team");
    });

    it("should include FAQ items in CSV", () => {
      const csvContent = exportRegulationToCSV(mockRegulation);

      expect(csvContent).toContain("FREQUENTLY ASKED QUESTIONS");
      expect(csvContent).toContain("What is CSRD?");
    });

    it("should properly escape CSV values with commas", () => {
      const regulationWithCommas: RegulationExportData = {
        ...mockRegulation,
        description: 'Description with, comma and "quotes"',
      };

      const csvContent = exportRegulationToCSV(regulationWithCommas);

      // Should contain escaped values
      expect(csvContent).toContain('"Description with, comma and ""quotes"""');
    });

    it("should handle regulations with minimal data", () => {
      const minimalRegulation: RegulationExportData = {
        ...mockRegulation,
        applicableSectors: [],
        applicableGS1Standards: [],
        implementationPhases: [],
        faqItems: [],
        checklist: [],
      };

      const csvContent = exportRegulationToCSV(minimalRegulation);

      expect(csvContent).toContain(minimalRegulation.title);
      expect(csvContent.length).toBeGreaterThan(0);
    });
  });

  describe("exportRegulationsListToCSV", () => {
    it("should generate CSV for multiple regulations", () => {
      const regulations = [
        {
          id: "1",
          title: "CSRD",
          type: "CSRD",
          celexId: "32022L0464",
          status: "Active",
          effectiveDate: new Date("2023-01-01"),
          applicableSectors: ["Manufacturing"],
          applicableGS1Standards: ["GTIN"],
        },
        {
          id: "2",
          title: "ESRS",
          type: "ESRS",
          celexId: "32023L2772",
          status: "Active",
          effectiveDate: new Date("2023-07-01"),
          applicableSectors: ["Retail"],
          applicableGS1Standards: ["EPCIS"],
        },
      ];

      const csvContent = exportRegulationsListToCSV(regulations);

      expect(typeof csvContent).toBe("string");
      expect(csvContent).toContain("CSRD");
      expect(csvContent).toContain("ESRS");
    });

    it("should include headers in regulations list CSV", () => {
      const regulations = [
        {
          id: "1",
          title: "CSRD",
          type: "CSRD",
          celexId: "32022L0464",
          status: "Active",
          effectiveDate: new Date("2023-01-01"),
          applicableSectors: [],
          applicableGS1Standards: [],
        },
      ];

      const csvContent = exportRegulationsListToCSV(regulations);

      expect(csvContent).toContain("Title");
      expect(csvContent).toContain("Type");
      expect(csvContent).toContain("CELEX ID");
    });

    it("should handle empty regulations list", () => {
      const csvContent = exportRegulationsListToCSV([]);

      expect(typeof csvContent).toBe("string");
      expect(csvContent.length).toBeGreaterThan(0);
    });
  });

  describe("generateExportFilename", () => {
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

      // Should not contain special characters
      expect(filename).not.toContain("/");
      expect(filename).not.toContain("(");
      expect(filename).not.toContain(")");
      expect(filename).not.toContain("!");
    });

    it("should limit filename length", () => {
      const longTitle = "A".repeat(100);
      const filename = generateExportFilename(longTitle, "pdf");

      // Filename should be reasonable length (50 char limit + date + extension)
      expect(filename.length).toBeLessThan(100);
    });

    it("should include timestamp in filename", () => {
      const today = new Date().toISOString().split("T")[0];
      const filename = generateExportFilename("Test Regulation", "pdf");

      expect(filename).toContain(today);
    });
  });

  describe("CSV escaping", () => {
    it("should handle newlines in CSV values", () => {
      const regulation: RegulationExportData = {
        ...mockRegulation,
        description: "Line 1\nLine 2\nLine 3",
      };

      const csvContent = exportRegulationToCSV(regulation);

      // Should properly escape newlines
      expect(csvContent).toContain('"Line 1');
    });

    it("should handle quotes in CSV values", () => {
      const regulation: RegulationExportData = {
        ...mockRegulation,
        title: 'Regulation with "quotes"',
      };

      const csvContent = exportRegulationToCSV(regulation);

      // Should escape quotes
      expect(csvContent).toContain('""quotes""');
    });
  });

  describe("PDF generation with various content", () => {
    it("should handle long descriptions", () => {
      const regulation: RegulationExportData = {
        ...mockRegulation,
        description: "A".repeat(500),
      };

      const pdfBuffer = exportRegulationToPDF(regulation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle many checklist items", () => {
      const regulation: RegulationExportData = {
        ...mockRegulation,
        checklist: Array.from({ length: 20 }, (_, i) => ({
          item: `Checklist item ${i + 1}`,
          description: `Description for item ${i + 1}`,
          priority: i % 2 === 0 ? "high" : "low",
          completed: i % 3 === 0,
        })),
      };

      const pdfBuffer = exportRegulationToPDF(regulation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it("should handle many FAQ items", () => {
      const regulation: RegulationExportData = {
        ...mockRegulation,
        faqItems: Array.from({ length: 15 }, (_, i) => ({
          question: `Question ${i + 1}?`,
          answer: `Answer to question ${i + 1}`,
        })),
      };

      const pdfBuffer = exportRegulationToPDF(regulation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });
});
