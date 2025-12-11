
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { exportElementToPdf } from "@/utils/export-pdf";
import { exportToCsv, type CsvRow } from "@/utils/export-csv";

export type ExportFormat = "pdf" | "print" | "csv";

export interface ExportButtonProps {
  contentRef: React.RefObject<HTMLElement>;
  filename: string;
  formats: ExportFormat[];
  csvData?: CsvRow[];
}

export function ExportButton(props: ExportButtonProps): React.JSX.Element {
  const { contentRef, filename, formats, csvData } = props;

  const handleExport = async (format: ExportFormat): Promise<void> => {
    if (format === "pdf") {
      const element = contentRef.current;
      if (!element) {
        return;
      }
      await exportElementToPdf({
        element,
        filename
      });
      return;
    }

    if (format === "print") {
      if (typeof window !== "undefined") {
        window.print();
      }
      return;
    }

    if (format === "csv") {
      if (csvData && csvData.length > 0) {
        exportToCsv({
          filename,
          rows: csvData
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.indexOf("pdf") !== -1 && (
          <DropdownMenuItem onClick={() => handleExport("pdf")}>
            Export as PDF
          </DropdownMenuItem>
        )}
        {formats.indexOf("print") !== -1 && (
          <DropdownMenuItem onClick={() => handleExport("print")}>
            Print
          </DropdownMenuItem>
        )}
        {formats.indexOf("csv") !== -1 && (
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            Export as CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

