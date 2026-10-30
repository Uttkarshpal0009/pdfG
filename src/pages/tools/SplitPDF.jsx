
import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import {
  Scissors,
  UploadCloud,
  FileText,
  Download,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function SplitPDF() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRange, setPageRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFile = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      setFile(selectedFile);
      setPageCount(pdf.getPageCount());
      setPageRange(`1-${pdf.getPageCount()}`);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Unable to read this PDF file.");
    }

    event.target.value = "";
  };

  const parsePageRanges = (range, totalPages) => {
    const pageNumbers = new Set();

    const parts = range.split(",");

    for (const part of parts) {
      const trimmed = part.trim();

      if (!trimmed) continue;

      if (trimmed.includes("-")) {
        const [startText, endText] = trimmed.split("-");

        const start = Number(startText);
        const end = Number(endText);

        if (
          !Number.isInteger(start) ||
          !Number.isInteger(end) ||
          start < 1 ||
          end > totalPages ||
          start > end
        ) {
          throw new Error("Invalid page range.");
        }

        for (let page = start; page <= end; page++) {
          pageNumbers.add(page - 1);
        }
      } else {
        const page = Number(trimmed);

        if (
          !Number.isInteger(page) ||
          page < 1 ||
          page > totalPages
        ) {
          throw new Error("Invalid page number.");
        }

        pageNumbers.add(page - 1);
      }
    }

    return [...pageNumbers].sort((a, b) => a - b);
  };

  const splitPDF = async () => {
    if (!file) {
      setMessage("Please upload a PDF first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const bytes = await file.arrayBuffer();
      const sourcePDF = await PDFDocument.load(bytes);

      const selectedPages = parsePageRanges(pageRange, pageCount);

      if (selectedPages.length === 0) {
        throw new Error("Please enter valid page numbers.");
      }

      const outputPDF = await PDFDocument.create();

      const copiedPages = await outputPDF.copyPages(
        sourcePDF,
        selectedPages
      );

      copiedPages.forEach((page) => outputPDF.addPage(page));

      const outputBytes = await outputPDF.save();

      const blob = new Blob([outputBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "pdfG-split.pdf";
      link.click();

      URL.revokeObjectURL(url);

      setMessage("Selected pages extracted successfully!");
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "Unable to split this PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-orange-500"
        >
          <ArrowLeft size={17} />
          Home
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
            <Scissors size={30} />
          </div>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Split <span className="text-orange-500">PDF</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
            Extract selected pages from your PDF into a new document.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-4 shadow-2xl sm:p-8">
          {/* Upload */}
          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#0c0c0c] px-5 py-8 text-center transition hover:border-orange-500/70">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <UploadCloud size={32} />
            </div>

            <h2 className="text-xl font-bold">
              Upload your PDF
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Click to browse your device
            </p>

            <span className="mt-5 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-orange-400">
              Choose PDF
            </span>

            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-6 rounded-xl border border-white/10 bg-[#0c0c0c] p-4">
              <div className="flex items-center gap-3">
                <FileText className="shrink-0 text-orange-500" />

                <div className="min-w-0">
                  <p className="break-all text-sm font-medium">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {pageCount} pages ·{" "}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Page range */}
          <div className="mt-6">
            <label
              htmlFor="pageRange"
              className="mb-3 block text-sm font-semibold"
            >
              Pages to extract
            </label>

            <input
              id="pageRange"
              type="text"
              value={pageRange}
              onChange={(event) => setPageRange(event.target.value)}
              placeholder="Example: 1-3, 5, 7-9"
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500"
            />

            <p className="mt-3 text-xs leading-6 text-gray-500">
              Enter page numbers or ranges separated by commas.
              {pageCount > 0 && ` This PDF has ${pageCount} pages.`}
            </p>
          </div>

          {/* Action */}
          <button
            onClick={splitPDF}
            disabled={loading || !file}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 text-sm font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Splitting PDF...
              </>
            ) : (
              <>
                <Download size={18} />
                Split PDF
              </>
            )}
          </button>

          {message && (
            <p className="mt-4 text-center text-sm text-orange-400">
              {message}
            </p>
          )}

          <p className="mt-5 text-center text-xs text-gray-500">
            🔒 Your file stays on your device during processing.
          </p>
        </div>
      </div>
    </main>
  );
}
