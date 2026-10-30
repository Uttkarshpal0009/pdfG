import { useState } from "react";
import { Link } from "react-router-dom";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  Download,
  FileText,
  FileUp,
  LoaderCircle,
  X,
} from "lucide-react";

export default function WordToPDF() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const convertWordToPDF = async (selectedFile) => {
    if (!selectedFile) return;

    const isWordFile =
      selectedFile.name.toLowerCase().endsWith(".docx");

    if (!isWordFile) {
      setError("Please upload a .docx Word document.");
      return;
    }

    setLoading(true);
    setError("");
    setFile(selectedFile);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl("");
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      // Extract text from the Word document.
      const result = await mammoth.extractRawText({
        arrayBuffer,
      });

      const text = result.value.trim();

      if (!text) {
        throw new Error("No readable text found in the document.");
      }

      // Create a PDF document.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 20;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const lineHeight = 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      const lines = pdf.splitTextToSize(text, usableWidth);

      let y = margin;

      lines.forEach((line) => {
        if (y + lineHeight > usableHeight + margin) {
          pdf.addPage();
          y = margin;
        }

        pdf.text(line, margin, y);
        y += lineHeight;
      });

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
    } catch (err) {
      console.error(err);
      setError(
        "Could not convert this Word file. Please try another .docx document."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl || !file) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${file.name.replace(/\.docx$/i, "")}.pdf`;
    link.click();
  };

  const resetTool = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    setFile(null);
    setPdfUrl("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-pdfg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="rounded-lg bg-pdfg-orange px-2 py-1 text-black">
              pdf
            </span>
            <span>G</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to tools
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pdfg-orange/10 text-pdfg-orange">
            <FileText size={32} />
          </div>

          <h1 className="text-3xl font-bold md:text-4xl">
            Word to PDF
          </h1>

          <p className="mt-3 text-gray-400">
            Convert your Word document into a downloadable PDF file.
          </p>
        </div>

        {/* Upload Card */}
        <section className="rounded-2xl border border-white/10 bg-pdfg-card p-6">
          {!file ? (
            <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-8 text-center transition hover:border-pdfg-orange">
              <FileUp size={42} className="mb-4 text-pdfg-orange" />

              <h2 className="text-xl font-semibold">
                Select a Word document
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Upload a .docx file to convert it into PDF.
              </p>

              <span className="mt-5 rounded-lg bg-pdfg-orange px-5 py-3 font-semibold text-black transition hover:bg-orange-500">
                Choose Word file
              </span>

              <input
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];

                  if (selectedFile) {
                    convertWordToPDF(selectedFile);
                  }

                  e.target.value = "";
                }}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/40 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-pdfg-orange" size={24} />

                  <div>
                    <p className="max-w-xs truncate font-medium">
                      {file.name}
                    </p>

                    <p className="text-sm text-gray-400">
                      Word document
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetTool}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                >
                  <X size={16} />
                  Remove
                </button>
              </div>

              <button
                onClick={() => convertWordToPDF(file)}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-pdfg-orange px-5 py-3 font-semibold text-black transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Convert to PDF
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </section>

        {/* PDF Preview */}
        {pdfUrl && !loading && (
          <section className="mt-10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  PDF ready
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Your converted file is ready to download.
                </p>
              </div>

              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 rounded-lg bg-pdfg-orange px-5 py-3 font-semibold text-black transition hover:bg-orange-500"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-pdfg-card">
              <iframe
                src={pdfUrl}
                title="Converted PDF preview"
                className="h-[700px] w-full bg-white"
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}