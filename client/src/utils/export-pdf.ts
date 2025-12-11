
export interface ExportPdfOptions {
  element: HTMLElement;
  filename: string;
  marginMm?: number;
}

export async function exportElementToPdf(
  options: ExportPdfOptions
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const element = options.element;
  const filename = options.filename || "export";
  const marginMm = options.marginMm ?? 10;

  const anyWindow = window as unknown as {
    html2pdf?: (source: HTMLElement | string) => {
      from: (source: HTMLElement | string) => unknown;
      set: (config: unknown) => unknown;
      save: (name?: string) => Promise<void>;
    };
  };

  if (anyWindow.html2pdf) {
    const instance = anyWindow.html2pdf(element);
    const config = {
      margin: marginMm,
      filename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    const configured = (instance as { set: (c: unknown) => unknown }).set(
      config
    );
    await (configured as { save: (n?: string) => Promise<void> }).save(
      filename
    );
    return;
  }

  const blob = new Blob([element.innerText], {
    type: "application/pdf"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf")
    ? filename
    : filename + ".pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

