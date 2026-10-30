import { useRef, useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  Download,
  Pen,
  Eraser,
  Type,
  Undo2,
  Trash2,
} from "lucide-react";

export default function EditPDF() {
  const [file, setFile] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [tool, setTool] = useState("pen");
  const [penColor, setPenColor] = useState("#ff7900");
  const [penSize, setPenSize] = useState(4);
  const [textColor, setTextColor] = useState("#111111");
  const [textSize, setTextSize] = useState(24);
  const [textInput, setTextInput] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const historyRef = useRef([]);

  // Load PDF
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    try {
      const bytes = await selectedFile.arrayBuffer();

      setFile(selectedFile);
      setPdfBytes(bytes);
      setError("");
      historyRef.current = [];

      // Clear previous annotation canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch {
      setError("Unable to load this PDF.");
    }
  };

  // Set annotation canvas size to match displayed PDF area
  useEffect(() => {
    if (!pdfBytes || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, [pdfBytes]);

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    historyRef.current.push(canvas.toDataURL());
  };

  // Pen drawing
  const startDrawing = (event) => {
    if (!file || tool !== "pen" && tool !== "eraser") return;

    saveHistory();
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const position = getPosition(event);

    context.beginPath();
    context.moveTo(position.x, position.y);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const position = getPosition(event);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = penSize;

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = penColor;
    }

    context.lineTo(position.x, position.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.closePath();
    context.globalCompositeOperation = "source-over";
  };

  // Add text on the annotation canvas
  const addText = (event) => {
    if (!textInput.trim()) {
      setError("Enter some text first.");
      return;
    }

    saveHistory();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const position = getPosition(event);

    context.font = `${textSize}px Arial`;
    context.fillStyle = textColor;
    context.fillText(textInput, position.x, position.y);

    setError("");
  };

  // Undo last canvas change
  const undo = () => {
    const previous = historyRef.current.pop();

    if (!previous) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = new Image();

    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
    };

    image.src = previous;
  };

  // Clear annotation canvas
  const clearCanvas = () => {
    saveHistory();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Export edited PDF
  const downloadPDF = async () => {
    if (!pdfBytes || !canvasRef.current) return;

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      const canvas = canvasRef.current;
      const pngBytes = await fetch(canvas.toDataURL("image/png"))
        .then((response) => response.arrayBuffer());

      const image = await pdfDoc.embedPng(pngBytes);

      const page = pages[0];
      const { width, height } = page.getSize();

      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      });

      const editedPdf = await pdfDoc.save();

      const blob = new Blob([editedPdf], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `edited-${file.name}`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Failed to export the edited PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-pdfg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">
            Edit <span className="text-pdfg-orange">PDF</span>
          </h1>

          <p className="mt-3 text-gray-400">
            Upload your PDF and add text or drawings.
          </p>
        </div>

        {/* Upload */}
        {!file && (
          <label className="mx-auto flex max-w-2xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-pdfg-card p-12 text-center hover:border-pdfg-orange">
            <Upload size={42} className="mb-4 text-pdfg-orange" />

            <h2 className="text-xl font-semibold">
              Upload your PDF
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Select a PDF file from your device
            </p>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {file && (
          <>
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-pdfg-card p-4">
              <button
                onClick={() => setTool("pen")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  tool === "pen"
                    ? "bg-pdfg-orange text-black"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <Pen size={18} /> Pen
              </button>

              <button
                onClick={() => setTool("eraser")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  tool === "eraser"
                    ? "bg-pdfg-orange text-black"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <Eraser size={18} /> Eraser
              </button>

              <button
                onClick={() => setTool("text")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  tool === "text"
                    ? "bg-pdfg-orange text-black"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <Type size={18} /> Text
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Pen color</span>
                <input
                  type="color"
                  value={penColor}
                  onChange={(event) => setPenColor(event.target.value)}
                  className="h-9 w-9 cursor-pointer rounded"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-400">
                Size
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={penSize}
                  onChange={(event) => setPenSize(Number(event.target.value))}
                />
                <span>{penSize}px</span>
              </label>

              <button
                onClick={undo}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <Undo2 size={18} /> Undo
              </button>

              <button
                onClick={clearCanvas}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 hover:bg-white/10"
              >
                <Trash2 size={18} /> Clear
              </button>

              <button
                onClick={downloadPDF}
                className="ml-auto flex items-center gap-2 rounded-lg bg-pdfg-orange px-5 py-2 font-semibold text-black hover:bg-orange-400"
              >
                <Download size={18} /> Download
              </button>
            </div>

            {/* Text controls */}
            {tool === "text" && (
              <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-pdfg-card p-4">
                <input
                  type="text"
                  value={textInput}
                  onChange={(event) => setTextInput(event.target.value)}
                  placeholder="Enter text to add to PDF"
                  className="min-w-[220px] flex-1 rounded-lg bg-black/30 px-4 py-3 outline-none focus:ring-1 focus:ring-pdfg-orange"
                />

                <label className="flex items-center gap-2 text-sm text-gray-400">
                  Text size
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={textSize}
                    onChange={(event) => setTextSize(Number(event.target.value))}
                  />
                  {textSize}px
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-400">
                  Text color
                  <input
                    type="color"
                    value={textColor}
                    onChange={(event) => setTextColor(event.target.value)}
                    className="h-9 w-9"
                  />
                </label>

                <p className="w-full text-sm text-gray-400">
                  Click on the PDF page to place your text.
                </p>
              </div>
            )}

            {error && (
              <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-red-400">
                {error}
              </p>
            )}

            {/* PDF Workspace */}
            <div className="rounded-xl border border-white/10 bg-pdfg-card p-4">
              <div
                ref={containerRef}
                className="relative mx-auto aspect-[0.707] max-w-3xl overflow-hidden bg-white"
              >
                <iframe
                  title="PDF Preview"
                  src={`${URL.createObjectURL(file)}#toolbar=0&navpanes=0`}
                  className="absolute inset-0 h-full w-full"
                />

                <canvas
                  ref={canvasRef}
                  onPointerDown={(event) => {
                    if (tool === "text") {
                      addText(event);
                    } else {
                      startDrawing(event);
                    }
                  }}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  className={`absolute inset-0 h-full w-full ${
                    tool === "text" ? "cursor-text" : "cursor-crosshair"
                  }`}
                  style={{ touchAction: "none" }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}