import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getRegulations } from "./db";
import { serverLogger } from "./_core/logger-wiring";

import {
  exportRegulationToPDF,
  exportRegulationToCSV,
  exportRegulationsListToCSV,
  generateExportFilename,
} from "./export-utils";

/**
 * Export router for PDF and CSV exports of regulations
 */
export const exportRouter = router({
  // Export regulation details to PDF
  regulationToPDF: publicProcedure
    .input(z.object({ regulationId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Get regulation from database
        const regulations = await getRegulations();
        const regulation = regulations.find(
          r => String(r.id) === input.regulationId
        );

        if (!regulation) {
          throw new Error("Regulation not found");
        }

        // Create export data with available fields
        const exportData = {
          id: String(regulation.id),
          title: regulation.title,
          type: regulation.regulationType,
          celexId: regulation.celexId || "",
          description: regulation.description || "",
          effectiveDate: regulation.effectiveDate ? new Date(regulation.effectiveDate) : new Date(),
          enforcementDate: null,
          status: "Active",
          applicableSectors: [],
          applicableGS1Standards: [],
          implementationPhases: [],
          relatedRegulations: [],
          faqItems: [],
          checklist: [],
        };

        // Generate PDF
        const pdfBuffer = exportRegulationToPDF(exportData);
        const filename = generateExportFilename(regulation.title, "pdf");

        return {
          success: true,
          filename,
          buffer: pdfBuffer.toString("base64"),
          mimeType: "application/pdf",
        };
      } catch (error) {
        serverLogger.error("[Export] PDF generation failed:", error);
        return { success: false, error: "Failed to generate PDF" };
      }
    }),

  // Export regulation details to CSV
  regulationToCSV: publicProcedure
    .input(z.object({ regulationId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Get regulation from database
        const regulations = await getRegulations();
        const regulation = regulations.find(
          r => String(r.id) === input.regulationId
        );

        if (!regulation) {
          throw new Error("Regulation not found");
        }

        // Create export data with available fields
        const exportData = {
          id: String(regulation.id),
          title: regulation.title,
          type: regulation.regulationType,
          celexId: regulation.celexId || "",
          description: regulation.description || "",
          effectiveDate: regulation.effectiveDate ? new Date(regulation.effectiveDate) : new Date(),
          enforcementDate: null,
          status: "Active",
          applicableSectors: [],
          applicableGS1Standards: [],
          implementationPhases: [],
          relatedRegulations: [],
          faqItems: [],
          checklist: [],
        };

        // Generate CSV
        const csvContent = exportRegulationToCSV(exportData);
        const filename = generateExportFilename(regulation.title, "csv");

        return {
          success: true,
          filename,
          content: csvContent,
          mimeType: "text/csv",
        };
      } catch (error) {
        serverLogger.error("[Export] CSV generation failed:", error);
        return { success: false, error: "Failed to generate CSV" };
      }
    }),

  // Export multiple regulations to CSV
  regulationsListToCSV: publicProcedure
    .input(z.object({ regulationIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        // Get regulations from database
        const allRegulations = await getRegulations();
        const regulations = allRegulations.filter(r =>
          input.regulationIds.includes(String(r.id))
        );

        if (regulations.length === 0) {
          throw new Error("No valid regulations found");
        }

        // Prepare data for export
        const regulationsWithStandards = regulations.map(reg => ({
          id: String(reg.id),
          title: reg.title,
          type: reg.regulationType,
          celexId: reg.celexId || "",
          status: "Active",
          effectiveDate: reg.effectiveDate ? new Date(reg.effectiveDate) : new Date(),
          applicableSectors: [],
          applicableGS1Standards: [],
        }));

        // Generate CSV
        const csvContent = exportRegulationsListToCSV(regulationsWithStandards);

        return {
          success: true,
          filename: `regulations-export-${new Date().toISOString().split("T")[0]}.csv`,
          content: csvContent,
          mimeType: "text/csv",
        };
      } catch (error) {
        serverLogger.error("[Export] CSV list generation failed:", error);
        return { success: false, error: "Failed to generate CSV" };
      }
    }),
});
