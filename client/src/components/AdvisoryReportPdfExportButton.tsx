import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

interface AdvisoryReportPdfExportButtonProps {
  reportId: number;
  reportTitle: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}

export function AdvisoryReportPdfExportButton({
  reportId,
  reportTitle,
  variant = "outline",
  size = "sm",
  className,
}: AdvisoryReportPdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const utils = trpc.useUtils();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const result = await utils.advisoryReports.exportHtml.fetch({
        id: reportId,
        includeMetadata: true,
        includeGovernanceNotice: true,
      });

      if (!result.html) {
        toast.error("Failed to export report");
        return;
      }

      const printWindow = window.open("", "_blank");

      if (printWindow) {
        printWindow.document.write(result.html);
        printWindow.document.close();

        const printInstructions = printWindow.document.createElement("div");
        printInstructions.style.cssText =
          "position:fixed;top:0;left:0;right:0;background:#3b82f6;color:white;padding:12px;text-align:center;font-family:sans-serif;z-index:9999;";
        printInstructions.innerHTML =
          '<strong>To save as PDF:</strong> Press Ctrl+P (or Cmd+P on Mac) and select "Save as PDF" as the destination. <button onclick="this.parentElement.remove()" style="margin-left:16px;padding:4px 12px;background:white;color:#3b82f6;border:none;border-radius:4px;cursor:pointer;">Dismiss</button>';
        printWindow.document.body.insertBefore(
          printInstructions,
          printWindow.document.body.firstChild,
        );

        toast.success("Report opened in new tab. Use Ctrl+P to save as PDF.");
        return;
      }

      const blob = new Blob([result.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${result.filename || reportTitle.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Report downloaded as HTML. Open in browser and print to PDF.");
    } catch {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  );
}
