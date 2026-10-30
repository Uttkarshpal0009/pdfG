import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  ArrowLeft,
  FileUp,
  LoaderCircle,
  Download,
  X,
  Hash,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function PageNumbers() {
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [numberedPdf, setNumberedPdf] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const positions = [
    { label: "Top Left", value: "top-left" },
    { label: "Top Center", value: "top-center" },
    { label: "Top Right", value: "top-right" },
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Bottom Center", value: "bottom-center" },
    { label: "Bottom Right", value: "bottom-right" },
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
    setNumberedPdf(null);
    setError("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  const handleAddNumbers = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (startNumber < 1) {
      setError("Starting number must be 1 or greater.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fileBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);

      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNumber = String(startNumber + index);
        const textWidth = font.widthOfTextAtSize(pageNumber, fontSize);

        const margin = 30;
        let x = margin;
        let y = margin;

        if (position.includes("right")) {
          x = width - textWidth - margin;
        } else if (position.includes("center")) {
          x = (width - textWidth) / 2;
        }

        if (position.includes("top")) {
          y = height - fontSize - margin;
        }

        page.drawText(pageNumber, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const newPreviewUrl = URL.createObjectURL(blob);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setNumberedPdf(blob);
      setPreviewUrl(newPreviewUrl);
    } catch (err) {
      console.error(err);
      setError("Unable to add page numbers. The PDF may be encrypted or damaged.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!numberedPdf) return;

    const downloadUrl = URL.createObjectURL(numberedPdf);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `numbered-${file.name}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setNumberedPdf(null);
    setError("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  return (
    <div className="min-h-screen bg-pdfg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-pdfg-orange"
        >
          <ArrowLeft size={18} />
          Back to tools
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pdfg-orange/10 text-pdfg-orange">
            <Hash size={32} />
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Add Page Numbers
          </h1>

          <p className="mt-3 text-gray-400">
            Add page numbers to your PDF and preview before downloading.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-pdfg-card p-6 sm:p-8">
          {!file ? (
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/20 text-center transition hover:border-pdfg-orange">
              <FileUp size={44} className="mb-4 text-pdfg-orange" />

              <h2 className="text-xl font-semibold">
                Select your PDF file
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Click here to upload a PDF
              </p>

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  onClick={handleRemoveFile}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  title="Remove file"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
                {/* Settings */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Page number position
                  </label>

                  <select
                    value={position}
                    onChange={(event) => {
                      setPosition(event.target.value);
                      setNumberedPdf(null);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#222] px-4 py-3 text-white outline-none focus:border-pdfg-orange"
                  >
                    {positions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <label className="mb-2 mt-5 block text-sm font-semibold">
                    Starting number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={(event) => {
                      setStartNumber(Number(event.target.value));
                      setNumberedPdf(null);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#222] px-4 py-3 text-white outline-none focus:border-pdfg-orange"
                  />

                  <label className="mb-2 mt-5 block text-sm font-semibold">
                    Font size: {fontSize}px
                  </label>

                  <input
                    type="range"
                    min="8"
                    max="30"
                    value={fontSize}
                    onChange={(event) => {
                      setFontSize(Number(event.target.value));
                      setNumberedPdf(null);
                    }}
                    className="w-full accent-pdfg-orange"
                  />

                  <button
                    onClick={handleAddNumbers}
                    disabled={loading}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-pdfg-orange px-5 py-4 font-semibold text-black transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={20} className="animate-spin" />
                        Adding Numbers...
                      </>
                    ) : (
                      <>
                        <Hash size={20} />
                        Add Page Numbers
                      </>
                    )}
                  </button>

                  {numberedPdf && (
                    <button
                      onClick={handleDownload}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-pdfg-orange px-5 py-4 font-semibold text-pdfg-orange transition hover:bg-pdfg-orange/10"
                    >
                      <Download size={20} />
                      Download PDF
                    </button>
                  )}
                </div>

                {/* Preview */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold">Preview</h2>

                    <span className="rounded-full bg-pdfg-orange/10 px-3 py-1 text-xs font-medium text-pdfg-orange">
                      {positions.find((item) => item.value === position)?.label}
                    </span>
                  </div>

                  <div className="flex min-h-[450px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#222] p-4">
                    {previewUrl ? (
                      <iframe
                        src={previewUrl}
                        title="Numbered PDF preview"
                        className="h-[600px] w-full rounded-lg bg-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">
                        Preview will appear after adding page numbers.
                      </p>
                    )}
                  </div>

                  <p className="mt-3 text-center text-sm text-gray-500">
                    Page numbers are added to all pages of your PDF.
                  </p>
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Your PDF is processed in the browser.
        </p>
      </div>
    </div>
  );
}