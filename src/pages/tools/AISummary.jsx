import { useState } from "react";
import { FileText, Upload, Loader2, Sparkles } from "lucide-react";

export default function AISummary() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setExtractedText("");

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setExtractedText("");

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        throw new Error(
          "API URL is missing. Add VITE_API_URL to pdfg/.env and restart Vite."
        );
      }

      const response = await fetch(`${API_URL}/api/summarize`, {
  method: "POST",
  body: formData,
});

      const responseText = await response.text();

      if (!responseText) {
        throw new Error(
          `Backend returned an empty response (HTTP ${response.status}). Check Render logs.`
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Backend returned invalid JSON (HTTP ${response.status}). Check Render logs.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Request failed (HTTP ${response.status}).`
        );
      }

      if (!data.text) {
        throw new Error("No text was extracted from this PDF.");
      }

      setExtractedText(data.text);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pdfg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
            <Sparkles size={16} />
            AI-powered PDF tool
          </div>

          <h1 className="text-4xl font-bold md:text-5xl">
            AI PDF <span className="text-pdfg-orange">Summary</span>
          </h1>

          <p className="mt-4 text-gray-400">
            Upload your PDF and extract its text for summarization.
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
              Click to browse · Maximum file size: 10 MB
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
              <FileText className="text-pdfg-orange" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pdfg-orange px-6 py-4 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Extracting text...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Extract PDF Text
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Extracted Text */}
        {extractedText && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-pdfg-card p-6 md:p-8">
            <h2 className="mb-4 text-xl font-bold text-pdfg-orange">
              Extracted PDF Text
            </h2>

            <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/30 p-5 text-sm leading-7 text-gray-300">
              {extractedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}