
import { useState } from "react";
import { Upload, FileImage, Loader2, Download } from "lucide-react";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PDFToJPG() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(null);
    setPages([]);
    setError("");

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const convertPDF = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjs.getDocument({
        data: arrayBuffer,
      }).promise;

      const convertedPages = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: 2,
        });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create canvas context.");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.95);
        });

        if (!blob) {
          throw new Error(`Failed to convert page ${pageNumber}.`);
        }

        const url = URL.createObjectURL(blob);

        convertedPages.push({
          pageNumber,
          blob,
          url,
        });
      }

      setPages(convertedPages);
    } catch (err) {
      console.error("PDF to JPG error:", err);
      setError(err.message || "Failed to convert PDF to JPG.");
    } finally {
      setLoading(false);
    }
  };

  // Download one JPG image
  const downloadPage = (page) => {
    const link = document.createElement("a");

    link.href = page.url;
    link.download = `page-${page.pageNumber}.jpg`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Download all pages directly as JPG files (no ZIP)
  const downloadAllPages = () => {
    if (!pages.length) return;

    pages.forEach((page, index) => {
      setTimeout(() => {
        downloadPage(page);
      }, index * 300);
    });
  };

  return (
    <div className="min-h-screen bg-pdfg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
            <FileImage size={16} />
            PDF Converter
          </div>

          <h1 className="text-4xl font-bold md:text-5xl">
            PDF to <span className="text-pdfg-orange">JPG</span>
          </h1>

          <p className="mt-4 text-gray-400">
            Convert every page of your PDF into a JPG image.
          </p>
        </div>

        {/* Upload Card */}
        <div className="rounded-2xl border border-white/10 bg-pdfg-card p-6 md:p-10">
          <label
            htmlFor="pdf-upload"
            className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/20 p-6 text-center transition hover:border-pdfg-orange"
          >
            <div className="mb-4 rounded-full bg-orange-500/10 p-4 text-pdfg-orange">
              <Upload size={32} />
            </div>

            <h2 className="text-xl font-semibold">
              {file ? file.name : "Choose a PDF file"}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Click to browse and select your PDF
            </p>

            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-black/30 p-4">
              <FileImage className="text-pdfg-orange" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          <button
            onClick={convertPDF}
            disabled={!file || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pdfg-orange px-6 py-4 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Converting PDF...
              </>
            ) : (
              <>
                <FileImage size={20} />
                Convert to JPG
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Converted Pages */}
        {pages.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-pdfg-card p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-pdfg-orange">
                  Converted JPG Images
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {pages.length} pages converted successfully.
                </p>
              </div>

              <button
                onClick={downloadAllPages}
                className="flex items-center gap-2 rounded-lg bg-pdfg-orange px-4 py-3 font-semibold text-black transition hover:bg-orange-400"
              >
                <Download size={18} />
                Download all JPGs
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
                >
                  <img
                    src={page.url}
                    alt={`PDF page ${page.pageNumber}`}
                    className="h-auto w-full"
                  />

                  <div className="flex items-center justify-between gap-3 p-4">
                    <p className="text-sm font-medium">
                      Page {page.pageNumber}
                    </p>

                    <button
                      onClick={() => downloadPage(page)}
                      className="flex items-center gap-2 rounded-lg bg-pdfg-orange px-3 py-2 text-sm font-semibold text-black hover:bg-orange-400"
                    >
                      <Download size={16} />
                      JPG
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
