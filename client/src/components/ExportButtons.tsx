import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sheet } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExportButtonsProps {
  regulationId: string;
  regulationTitle: string;
  variant?: "default" | "outline" | "ghost";
}

/**
 * Export buttons component for downloading regulation details as PDF or CSV
 */
export function ExportButtons({
  regulationId,
  regulationTitle,
  variant = "outline",
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  // PDF export mutation
  const pdfExport = trpc.export.regulationToPDF.useMutation({
    onSuccess: data => {
      if (data.success && data.buffer) {
        // Convert base64 to blob and download
        const binaryString = atob(data.buffer);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = data.filename || "regulation.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`Exported PDF: ${regulationTitle}`);
      }
      setIsExporting(false);
    },
    onError: error => {
      toast.error(`Failed to export PDF: ${String(error)}`);
      setIsExporting(false);
    },
  });

  // CSV export mutation
  const csvExport = trpc.export.regulationToCSV.useMutation({
    onSuccess: data => {
      if (data.success && data.content) {
        // Create blob and download
        const blob = new Blob([data.content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = data.filename || "regulation.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`Exported CSV: ${regulationTitle}`);
      }
      setIsExporting(false);
    },
    onError: error => {
      toast.error(`Failed to export CSV: ${String(error)}`);
      setIsExporting(false);
    },
  });

  const handlePDFExport = async () => {
    setIsExporting(true);
    await pdfExport.mutateAsync({ regulationId });
  };

  const handleCSVExport = async () => {
    setIsExporting(true);
    await csvExport.mutateAsync({ regulationId });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={variant}
        size="sm"
        onClick={handlePDFExport}
        disabled={isExporting || pdfExport.isPending}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        {pdfExport.isPending ? "Exporting..." : "Export PDF"}
      </Button>
      <Button
        variant={variant}
        size="sm"
        onClick={handleCSVExport}
        disabled={isExporting || csvExport.isPending}
        className="gap-2"
      >
        <Sheet className="h-4 w-4" />
        {csvExport.isPending ? "Exporting..." : "Export CSV"}
      </Button>
    </div>
  );
}

/**
 * Bulk export component for exporting multiple regulations
 */
interface BulkExportButtonsProps {
  regulationIds: string[];
  disabled?: boolean;
}

export function BulkExportButtons({
  regulationIds,
  disabled = false,
}: BulkExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const csvExport = trpc.export.regulationsListToCSV.useMutation({
    onSuccess: data => {
      if (data.success && data.content) {
        const blob = new Blob([data.content], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = data.filename || "regulations.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`Exported CSV: ${regulationIds.length} regulations`);
      }
      setIsExporting(false);
    },
    onError: error => {
      toast.error(`Failed to export regulations: ${String(error)}`);
      setIsExporting(false);
    },
  });

  const handleBulkExport = async () => {
    if (regulationIds.length === 0) {
      toast.warning("Please select at least one regulation to export");
      return;
    }

    setIsExporting(true);
    await csvExport.mutateAsync({ regulationIds });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBulkExport}
      disabled={
        disabled ||
        isExporting ||
        csvExport.isPending ||
        regulationIds.length === 0
      }
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {csvExport.isPending
        ? "Exporting..."
        : `Export ${regulationIds.length} Regulations`}
    </Button>
  );
}
