import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import SignatureCanvas from "react-signature-canvas";
import {
  ArrowLeft,
  FileUp,
  LoaderCircle,
  Download,
  X,
  PenLine,
  Eraser,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SignPDF() {
  const signatureRef = useRef(null);

  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const [signedPdf, setSignedPdf] = useState(null);

  const [tool, setTool] = useState("pen");
  const [penSize, setPenSize] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
    setSignedPdf(null);
    setSignature(null);
    setError("");
  };

  // Clear complete signature canvas
  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignature(null);
    setSignedPdf(null);
    setError("");
  };

  // Save signature as image
  const handleSaveSignature = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setError("Please draw your signature first.");
      return;
    }

    const signatureData = signatureRef.current.toDataURL("image/png");

    setSignature(signatureData);
    setError("");
  };

  // Add signature to PDF
  const handleSignPDF = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (!signature) {
      setError("Please draw and save your signature first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fileBytes = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();

      const signatureImage = await pdfDoc.embedPng(signature);

      pages.forEach((page) => {
        const { width } = page.getSize();

        const signatureWidth = 150;

        const signatureHeight =
          (signatureImage.height / signatureImage.width) *
          signatureWidth;

        page.drawImage(signatureImage, {
          x: width - signatureWidth - 40,
          y: 40,
          width: signatureWidth,
          height: signatureHeight,
        });
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      setSignedPdf(blob);
    } catch (err) {
      console.error(err);
      setError("Unable to sign this PDF. It may be encrypted or damaged.");
    } finally {
      setLoading(false);
    }
  };

  // Download signed PDF
  const handleDownload = () => {
    if (!signedPdf) return;

    const downloadUrl = URL.createObjectURL(signedPdf);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `signed-${file.name}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setSignature(null);
    setSignedPdf(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-pdfg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-pdfg-orange"
        >
          <ArrowLeft size={18} />
          Back to tools
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pdfg-orange/10 text-pdfg-orange">
            <PenLine size={32} />
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Sign PDF
          </h1>

          <p className="mt-3 text-gray-400">
            Draw your signature with the pen and eraser tools.
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
              {/* Uploaded PDF */}
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

              {/* Drawing tools */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setTool("pen")}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 transition ${
                    tool === "pen"
                      ? "border-pdfg-orange bg-pdfg-orange/10 text-pdfg-orange"
                      : "border-white/10 text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <PenLine size={18} />
                  Pen
                </button>

                <button
                  onClick={() => setTool("eraser")}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 transition ${
                    tool === "eraser"
                      ? "border-pdfg-orange bg-pdfg-orange/10 text-pdfg-orange"
                      : "border-white/10 text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <Eraser size={18} />
                  Eraser
                </button>

                <button
                  onClick={handleClearSignature}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-gray-300 transition hover:bg-white/5"
                >
                  <Trash2 size={18} />
                  Clear
                </button>
              </div>

              {/* Pen size */}
              <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {tool === "pen" ? "Pen Size" : "Eraser Size"}
                  </label>

                  <span className="text-sm text-pdfg-orange">
                    {penSize}px
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="20"
                  value={penSize}
                  onChange={(event) =>
                    setPenSize(Number(event.target.value))
                  }
                  className="w-full accent-pdfg-orange"
                />
              </div>

              {/* Signature canvas */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
                <SignatureCanvas
                  ref={signatureRef}
                  penColor={tool === "pen" ? "black" : "white"}
                  minWidth={tool === "pen" ? 1 : penSize}
                  maxWidth={tool === "pen" ? penSize : penSize}
                  canvasProps={{
                    width: 900,
                    height: 260,
                    className: "w-full",
                  }}
                />
              </div>

              <p className="mt-2 text-sm text-gray-400">
                Select Pen to draw or Eraser to erase parts of your signature.
              </p>

              {/* Save signature */}
              <button
                onClick={handleSaveSignature}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-pdfg-orange px-5 py-4 font-semibold text-black transition hover:bg-orange-500"
              >
                <PenLine size={20} />
                Save Signature
              </button>

              {/* Saved signature */}
              {signature && (
                <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-sm font-medium text-green-400">
                    Signature saved successfully!
                  </p>

                  <img
                    src={signature}
                    alt="Saved signature"
                    className="mt-3 max-h-24 rounded bg-white p-2"
                  />
                </div>
              )}

              {/* Sign PDF */}
              <button
                onClick={handleSignPDF}
                disabled={loading || !signature}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-pdfg-orange px-5 py-4 font-semibold text-black transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" />
                    Signing PDF...
                  </>
                ) : (
                  <>
                    <PenLine size={20} />
                    Sign PDF
                  </>
                )}
              </button>

              {/* Download */}
              {signedPdf && (
                <button
                  onClick={handleDownload}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-pdfg-orange px-5 py-4 font-semibold text-pdfg-orange transition hover:bg-pdfg-orange/10"
                >
                  <Download size={20} />
                  Download Signed PDF
                </button>
              )}
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