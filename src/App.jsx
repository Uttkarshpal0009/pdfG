
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MergePDF from "./pages/tools/MergePDF";
import SplitPDF from "./pages/tools/SplitPDF";
import CompressPDF from "./pages/tools/CompressPDF";
import PDFToJPG from "./pages/tools/PDFToJPG";
import WordToPDF from "./pages/tools/WordToPDF";
import PDFToWord from "./pages/tools/PDFToWord";
import ProtectPDF from "./pages/tools/ProtectPDF";
import RotatePDF from "./pages/tools/RotatePDF";
import PageNumbers from "./pages/tools/PageNumbers";
import SignPDF from "./pages/tools/SignPDF";
import AISummary from "./pages/tools/AISummary";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PDF Tools */}
        <Route path="/merge-pdf" element={<MergePDF />} />
        <Route path="/split-pdf" element={<SplitPDF />} />
        <Route path="/compress-pdf" element={<CompressPDF />} />
        <Route path="/pdf-to-jpg" element={<PDFToJPG />} />
        <Route path="/word-to-pdf" element={<WordToPDF />} />
        <Route path="/pdf-to-word" element={<PDFToWord />} />
        <Route path="/protect-pdf" element={<ProtectPDF />} />
        <Route path="/rotate-pdf" element={<RotatePDF />} />
        <Route path="/page-numbers" element={<PageNumbers />} />
        <Route path="/sign-pdf" element={<SignPDF />} />
        <Route path="/ai-summary" element={<AISummary />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
