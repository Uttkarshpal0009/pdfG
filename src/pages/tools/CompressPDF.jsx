
import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import {
  Archive,
  UploadCloud,
  FileText,
  Download,
  ArrowLeft,
  Loader2,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function CompressPDF() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setMessage("");
    }

    event.target.value = "";
  };

  const compressPDF = async () => {
    if (!file) {
      setMessage("Please upload a PDF first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Compressing PDF...");
      setResult(null);

      const bytes = await file.arrayBuffer();

      const qualitySettings = {
        low: {
          scale: 1.2,
          jpegQuality: 0.45,
        },
        medium: {
          scale: 1.5,
          jpegQuality: 0.65,
        },
        high: {
          scale: 2,
          jpegQuality: 0.82,
        },
      };

      const settings = qualitySettings[quality];

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(bytes),
      });

      const sourcePDF = await loadingTask.promise;
      const outputPDF = await PDFDocument.create();

      for (let pageNumber = 1; pageNumber <= sourcePDF.numPages; pageNumber++) {
        const page = await sourcePDF.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: settings.scale,
        });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const imageData = canvas.toDataURL(
          "image/jpeg",
          settings.jpegQuality
        );

        const imageBytes = await fetch(imageData).then((response) =>
          response.arrayBuffer()
        );

        const embeddedImage = await outputPDF.embedJpg(imageBytes);

        const outputPage = outputPDF.addPage([
          viewport.width / settings.scale,
          viewport.height / settings.scale,
        ]);

        outputPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: viewport.width / settings.scale,
          height: viewport.height / settings.scale,
        });

        canvas.width = 0;
        canvas.height = 0;
      }

      const compressedBytes = await outputPDF.save();

      const blob = new Blob([compressedBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setResult({
        url,
        size: blob.size,
        originalSize: file.size,
      });

      const difference = file.size - blob.size;
      const percentage = (difference / file.size) * 100;

      setMessage(
        percentage > 0
          ? `Compression completed! File size reduced by ${percentage.toFixed(1)}%.`
          : "Compression completed. The new file may be larger than the original."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to compress this PDF. Please try another file."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result.url;
    link.download = "pdfG-compressed.pdf";
    link.click();
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
            <Archive size={30} />
          </div>

          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Compress <span className="text-orange-500">PDF</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
            Reduce the size of your PDF files for easier sharing and storage.
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

          {/* Selected file */}
          {file && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0c0c0c] p-4">
              <FileText className="shrink-0 text-orange-500" />

              <div className="min-w-0">
                <p className="break-all text-sm font-medium">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Original size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {/* Compression level */}
          <div className="mt-6">
            <label
              htmlFor="quality"
              className="mb-3 block text-sm font-semibold"
            >
              Compression level
            </label>

            <select
              id="quality"
              value={quality}
              onChange={(event) => {
                setQuality(event.target.value);
                setResult(null);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-4 text-sm text-white outline-none transition focus:border-orange-500"
            >
              <option value="low">
                Strong compression — smaller file, lower quality
              </option>
              <option value="medium">
                Recommended — balanced size and quality
              </option>
              <option value="high">
                High quality — larger file, better image quality
              </option>
            </select>
          </div>

          {/* Action */}
          <button
            onClick={compressPDF}
            disabled={loading || !file}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 text-sm font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Compressing PDF...
              </>
            ) : (
              <>
                <Archive size={18} />
                Compress PDF
              </>
            )}
          </button>

          {/* Result */}
          {message && (
            <p className="mt-4 text-center text-sm text-orange-400">
              {message}
            </p>
          )}

          {result && (
            <div className="mt-6 rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Original size</p>
                  <p className="mt-2 font-bold">
                    {(result.originalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Compressed size</p>
                  <p className="mt-2 font-bold text-orange-400">
                    {(result.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={downloadPDF}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 text-sm font-bold text-black transition hover:bg-orange-400"
              >
                <Download size={18} />
                Download Compressed PDF
              </button>
            </div>
          )}

          <p className="mt-5 text-center text-xs leading-5 text-gray-500">
            🔒 Your file stays on your device during processing.
          </p>
        </div>
      </div>
    </main>
  );
}
