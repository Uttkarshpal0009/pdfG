
import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import {
  Files,
  UploadCloud,
  FileText,
  Trash2,
  Download,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function MergePDF() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const validFiles = selected.filter(
      (file) => file.type === "application/pdf"
    );

    setFiles((previous) => [...previous, ...validFiles]);
    setMessage("");

    event.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setMessage("Please select at least 2 PDF files.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const mergedPDF = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const sourcePDF = await PDFDocument.load(bytes);
        const pages = await mergedPDF.copyPages(
          sourcePDF,
          sourcePDF.getPageIndices()
        );

        pages.forEach((page) => mergedPDF.addPage(page));
      }

      const mergedBytes = await mergedPDF.save();
      const blob = new Blob([mergedBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "pdfG-merged.pdf";
      link.click();

      URL.revokeObjectURL(url);
      setMessage("PDF files merged successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Unable to merge PDFs. Please check your files.");
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
            <Files size={30} />
          </div>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Merge <span className="text-orange-500">PDF</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
            Combine multiple PDF files into one document. Simple, fast, and secure.
          </p>

          <p className="mt-3 text-xs text-gray-500">
            ✓ Fast processing · ✓ Secure & private · ✓ No watermarks
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141414] p-4 shadow-2xl sm:p-8">
          {/* Upload */}
          <label className="flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#0c0c0c] px-5 py-8 text-center transition hover:border-orange-500/70 hover:bg-orange-500/[0.03]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <UploadCloud size={32} />
            </div>

            <h2 className="text-xl font-bold">Drop your PDF files here</h2>

            <p className="mt-2 text-sm text-gray-400">
              or click below to browse your device
            </p>

            <span className="mt-5 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-orange-400">
              Choose PDF files
            </span>

            <span className="mt-4 text-xs text-gray-500">
              PDF files only · Multiple files supported
            </span>

            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  Selected files ({files.length})
                </h3>

                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-gray-400 transition hover:text-red-400"
                >
                  Clear all
                </button>
              </div>

              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0c0c0c] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="shrink-0 text-orange-500" />

                    <div className="min-w-0">
                      <p className="break-all text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action */}
          <button
            onClick={mergePDFs}
            disabled={loading || files.length < 2}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 text-sm font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Merging PDFs...
              </>
            ) : (
              <>
                <Download size={18} />
                Merge PDFs
              </>
            )}
          </button>

          {message && (
            <p className="mt-4 text-center text-sm text-orange-400">
              {message}
            </p>
          )}

          <p className="mt-5 text-center text-xs text-gray-500">
            🔒 Your files stay on your device during processing.
          </p>
        </div>
      </div>
    </main>
  );
}
