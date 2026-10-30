import { useState } from "react";
import { Link } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  ArrowLeft,
  Download,
  FileText,
  FileUp,
  LoaderCircle,
  X,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PDFToWord() {
  const [file, setFile] = useState(null);
  const [wordBlob, setWordBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const convertPDFToWord = async (selectedFile) => {
    if (!selectedFile || !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a valid PDF file.");
      return;
    }

    setLoading(true);
    setError("");
    setFile(selectedFile);
    setWordBlob(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      const paragraphs = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .filter((item) => "str" in item)
          .map((item) => item.str)
          .join(" ")
          .trim();

        if (pageText) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: pageText,
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          );
        }

        // Add a page separator between PDF pages.
        if (pageNumber < pdf.numPages) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "",
                }),
              ],
              pageBreakBefore: true,
            })
          );
        }
      }

      if (paragraphs.length === 0) {
        throw new Error("No readable text found in this PDF.");
      }

      const document = new Document({
        sections: [
          {
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(document);
      setWordBlob(blob);
    } catch (err) {
      console.error(err);
      setError(
        "Could not convert this PDF. It may be scanned or contain no selectable text."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadWord = () => {
    if (!wordBlob || !file) return;

    const url = URL.createObjectURL(wordBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${file.name.replace(/\.pdf$/i, "")}.docx`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const resetTool = () => {
    setFile(null);
    setWordBlob(null);
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
            PDF to Word
          </h1>

          <p className="mt-3 text-gray-400">
            Extract text from a PDF and convert it into an editable Word document.
          </p>
        </div>

        {/* Upload */}
        <section className="rounded-2xl border border-white/10 bg-pdfg-card p-6">
          {!file ? (
            <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-8 text-center transition hover:border-pdfg-orange">
              <FileUp size={42} className="mb-4 text-pdfg-orange" />

              <h2 className="text-xl font-semibold">
                Select a PDF file
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Upload a PDF with selectable text.
              </p>

              <span className="mt-5 rounded-lg bg-pdfg-orange px-5 py-3 font-semibold text-black transition hover:bg-orange-500">
                Choose PDF
              </span>

              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];

                  if (selectedFile) {
                    convertPDFToWord(selectedFile);
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
                      PDF document
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
                onClick={() => convertPDFToWord(file)}
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
                    Convert to Word
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

        {/* Result */}
        {wordBlob && !loading && (
          <section className="mt-10 rounded-2xl border border-white/10 bg-pdfg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <FileText size={28} />
            </div>

            <h2 className="text-2xl font-bold">
              Word document ready
            </h2>

            <p className="mt-2 text-gray-400">
              Your converted document is ready to download.
            </p>

            <button
              onClick={downloadWord}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-pdfg-orange px-5 py-3 font-semibold text-black transition hover:bg-orange-500"
            >
              <Download size={18} />
              Download Word file
            </button>
          </section>
        )}
      </main>
    </div>
  );
}