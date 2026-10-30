import { useState, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import {
  ArrowLeft,
  RotateCw,
  FileUp,
  LoaderCircle,
  Download,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getDocument } from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";

export default function RotatePDF() {
  const [file, setFile] = useState(null);
  const [rotation, setRotation] = useState(90);
  const [previewUrl, setPreviewUrl] = useState("");
  const [rotatedPdf, setRotatedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Render PDF page and update live preview
  useEffect(() => {
    let cancelled = false;

    const renderPreview = async () => {
      if (!file) return;

      try {
        const fileBytes = await file.arrayBuffer();

        const pdf = await getDocument({
          data: fileBytes,
        }).promise;

        const page = await pdf.getPage(1);

        const viewport = page.getViewport({
          scale: 1.3,
          rotation: rotation,
        });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        if (!cancelled) {
          const imageUrl = canvas.toDataURL("image/png");
          setPreviewUrl(imageUrl);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Unable to preview this PDF.");
        }
      }
    };

    renderPreview();

    return () => {
      cancelled = true;
    };
  }, [file, rotation]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
    setRotatedPdf(null);
    setPreviewUrl("");
    setError("");
  };

  const handleRotate = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fileBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);

      pdfDoc.getPages().forEach((page) => {
        const currentRotation = page.getRotation().angle;

        page.setRotation(
          degrees((currentRotation + rotation) % 360)
        );
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      setRotatedPdf(blob);
    } catch (err) {
      console.error(err);
      setError("Unable to rotate this PDF. It may be encrypted or damaged.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedPdf) return;

    const downloadUrl = URL.createObjectURL(rotatedPdf);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `rotated-${file.name}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl("");
    setRotatedPdf(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-pdfg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pdfg-orange"
        >
          <ArrowLeft size={18} />
          Back to tools
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pdfg-orange/10 text-pdfg-orange">
            <RotateCw size={32} />
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Rotate PDF
          </h1>

          <p className="mt-3 text-gray-400">
            Rotate your PDF pages and preview the changes before downloading.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-pdfg-card p-6 sm:p-8">
          {!file ? (
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/20 text-center transition hover:border-pdfg-orange">
              <FileUp size={44} className="mb-4 text-pdfg-orange" />

              <h2 className="text-xl font-semibold">
                Upload your PDF
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Click to select a PDF file
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
                  className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                  title="Remove file"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
                {/* Controls */}
                <div>
                  <h2 className="mb-3 font-semibold">
                    Choose rotation
                  </h2>

                  <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                    {[90, 180, 270].map((angle) => (
                      <button
                        key={angle}
                        onClick={() => {
                          setRotation(angle);
                          setRotatedPdf(null);
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-4 transition lg:justify-start ${
                          rotation === angle
                            ? "border-pdfg-orange bg-pdfg-orange/10 text-pdfg-orange"
                            : "border-white/10 bg-black/20 text-gray-300 hover:border-white/30"
                        }`}
                      >
                        <RotateCw
                          size={20}
                          style={{ transform: `rotate(${angle}deg)` }}
                        />

                        <span className="font-semibold">
                          {angle}°
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-sm text-gray-400">
                    Rotation: {rotation}° clockwise
                  </p>

                  <button
                    onClick={handleRotate}
                    disabled={loading}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pdfg-orange px-5 py-4 font-semibold text-black transition hover:bg-orange-500 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={20} className="animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <RotateCw size={20} />
                        Apply Rotation
                      </>
                    )}
                  </button>

                  {rotatedPdf && (
                    <button
                      onClick={handleDownload}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-pdfg-orange px-5 py-4 font-semibold text-pdfg-orange transition hover:bg-pdfg-orange/10"
                    >
                      <Download size={20} />
                      Download PDF
                    </button>
                  )}
                </div>

                {/* Live preview */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold">Live Preview</h2>

                    <span className="rounded-full bg-pdfg-orange/10 px-3 py-1 text-xs font-medium text-pdfg-orange">
                      {rotation}° Rotation
                    </span>
                  </div>

                  <div className="flex min-h-[450px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#222] p-4">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={`PDF preview rotated ${rotation} degrees`}
                        className="max-h-[600px] max-w-full object-contain shadow-2xl"
                      />
                    ) : (
                      <LoaderCircle
                        size={32}
                        className="animate-spin text-pdfg-orange"
                      />
                    )}
                  </div>

                  <p className="mt-3 text-center text-sm text-gray-500">
                    Preview shows the first page. Rotation applies to all pages.
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
          PDF processing happens in your browser.
        </p>
      </div>
    </div>
  );
}