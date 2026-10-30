
import { useState } from "react";
import { Link } from "react-router-dom";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import {
  ArrowLeft,
  Download,
  FileLock,
  FileUp,
  LoaderCircle,
  LockKeyhole,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
} from "lucide-react";

export default function ProtectPDF() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [protectedPdf, setProtectedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Select PDF
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please upload a valid PDF file.");
      return;
    }

    setFile(selectedFile);
    setProtectedPdf(null);
    setPassword("");
    setConfirmPassword("");
    setError("");

    e.target.value = "";
  };

  // Protect PDF with password
  const protectPDF = async () => {
    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setProtectedPdf(null);

    try {
      const pdfBytes = new Uint8Array(await file.arrayBuffer());

      // Encrypt the PDF in the browser
      const encryptedBytes = await encryptPDF(pdfBytes, password);

      const blob = new Blob([encryptedBytes], {
        type: "application/pdf",
      });

      setProtectedPdf(blob);
    } catch (err) {
      console.error("Protect PDF error:", err);

      setError(
        err?.message ||
          "Could not protect this PDF. Please try another PDF file."
      );
    } finally {
      setLoading(false);
    }
  };

  // Download protected PDF
  const downloadProtectedPDF = () => {
    if (!protectedPdf || !file) return;

    const url = URL.createObjectURL(protectedPdf);
    const link = document.createElement("a");

    link.href = url;
    link.download = `protected-${file.name}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // Reset tool
  const resetTool = () => {
    setFile(null);
    setPassword("");
    setConfirmPassword("");
    setProtectedPdf(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-pdfg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
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
      <main className="mx-auto max-w-3xl px-5 py-12">
        {/* Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pdfg-orange/10 text-pdfg-orange">
            <LockKeyhole size={32} />
          </div>

          <h1 className="text-3xl font-bold md:text-4xl">
            Protect PDF
          </h1>

          <p className="mt-3 text-gray-400">
            Add a password to your PDF and protect it from unauthorized access.
          </p>
        </div>

        {/* Upload Card */}
        <section className="rounded-2xl border border-white/10 bg-pdfg-card p-6">
          {!file ? (
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-8 text-center transition hover:border-pdfg-orange">
              <FileUp
                size={42}
                className="mb-4 text-pdfg-orange"
              />

              <h2 className="text-xl font-semibold">
                Select a PDF file
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Upload a PDF to add password protection.
              </p>

              <span className="mt-5 rounded-lg bg-pdfg-orange px-5 py-3 font-semibold text-black transition hover:bg-orange-500">
                Choose PDF
              </span>

              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Selected file */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/40 p-4">
                <div className="flex items-center gap-3">
                  <FileLock
                    className="text-pdfg-orange"
                    size={24}
                  />

                  <div>
                    <p className="max-w-xs truncate font-medium">
                      {file.name}
                    </p>

                    <p className="text-sm text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
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

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Set password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password (minimum 6 characters)"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 pr-12 outline-none transition focus:border-pdfg-orange"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Confirm password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter your password"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-pdfg-orange"
                />
              </div>

              {/* Protect Button */}
              <button
                onClick={protectPDF}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-pdfg-orange px-5 py-3 font-semibold text-black transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Protecting PDF...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={18} />
                    Protect PDF
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </section>

        {/* Success */}
        {protectedPdf && (
          <section className="mt-8 rounded-2xl border border-green-500/20 bg-pdfg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <ShieldCheck size={28} />
            </div>

            <h2 className="text-2xl font-bold">
              PDF protected successfully
            </h2>

            <p className="mt-2 text-gray-400">
              Your password-protected PDF is ready to download.
            </p>

            <button
              onClick={downloadProtectedPDF}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-pdfg-orange px-5 py-3 font-semibold text-black transition hover:bg-orange-500"
            >
              <Download size={18} />
              Download protected PDF
            </button>
          </section>
        )}

        {/* Info */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start gap-3">
            <LockKeyhole
              size={18}
              className="mt-0.5 shrink-0 text-pdfg-orange"
            />

            <div>
              <h3 className="text-sm font-semibold">
                Keep your password safe
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Remember your password. You may not be able to open the
                protected PDF without it. Your file is processed in your browser.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
