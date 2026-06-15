import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface ExportPdfButtonProps {
  /** The id of the DOM element to capture */
  targetId: string;
  /** File name for the downloaded PDF (without extension) */
  fileName?: string;
}

// Button that exports survey data as a PDF document.
export default function ExportPdfButton({
  targetId,
  fileName = "analytics-report",
}: ExportPdfButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    const element = document.getElementById(targetId);
    if (!element) {
      setError("Could not find the content to export.");
      return;
    }

    setExporting(true);
    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#F7FAFC",
        filter: (node) =>
          !(
            node instanceof HTMLElement &&
            node.getAttribute("data-export-hidden") === "true"
          ),
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load generated image"));
      });

      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;
      const sourceCtx = sourceCanvas.getContext("2d");
      if (!sourceCtx) {
        throw new Error("Could not prepare canvas for export.");
      }
      sourceCtx.drawImage(img, 0, 0);

      // Use mm units for standard A4 with safe margins.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginMm = 10;
      const contentWidthMm = pageWidth - marginMm * 2;
      const contentHeightMm = pageHeight - marginMm * 2;
      const pxPerMm = sourceCanvas.width / contentWidthMm;
      const sliceHeightPx = Math.floor(contentHeightMm * pxPerMm);
      const overlapPx = 6;

      if (sliceHeightPx <= 0) {
        throw new Error("Export dimensions are invalid.");
      }

      let offsetPx = 0;
      let pageIndex = 0;

      while (offsetPx < sourceCanvas.height) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        // Add a subtle border so every page is clearly framed.
        pdf.setDrawColor(207, 219, 232);
        pdf.setLineWidth(0.5);
        pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);

        const isFirstPage = pageIndex === 0;
        const sourceY = isFirstPage
          ? offsetPx
          : Math.max(0, offsetPx - overlapPx);
        const pageSlicePx = Math.min(
          sliceHeightPx + (isFirstPage ? 0 : overlapPx),
          sourceCanvas.height - sourceY,
        );

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = sourceCanvas.width;
        pageCanvas.height = pageSlicePx;
        const pageCtx = pageCanvas.getContext("2d");
        if (!pageCtx) {
          throw new Error("Could not prepare page canvas for export.");
        }

        pageCtx.drawImage(
          sourceCanvas,
          0,
          sourceY,
          sourceCanvas.width,
          pageSlicePx,
          0,
          0,
          sourceCanvas.width,
          pageSlicePx,
        );

        const pageDataUrl = pageCanvas.toDataURL("image/png");
        const renderedHeightMm =
          (pageSlicePx * contentWidthMm) / sourceCanvas.width;
        pdf.addImage(
          pageDataUrl,
          "PNG",
          marginMm,
          marginMm,
          contentWidthMm,
          renderedHeightMm,
          undefined,
          "FAST",
        );

        offsetPx += sliceHeightPx;
        pageIndex += 1;
      }

      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PDF export failed:", err);
      setError(`Export failed: ${msg}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 px-6 py-2 bg-[#2B8CED] hover:bg-[#1A76D2] disabled:opacity-60 text-white rounded-lg font-bold text-sm transition-all shadow-md group"
      >
        {exporting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Exporting…</span>
          </>
        ) : (
          <>
            <Download
              size={20}
              className="group-hover:-translate-y-0.5 transition-transform"
            />
            <span>Export</span>
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
