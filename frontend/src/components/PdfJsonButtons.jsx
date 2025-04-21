
import React from "react";
import { FaFilePdf, FaFileExport } from "react-icons/fa";

export function PdfJsonButtons({ onPdf, onJson }) {
  return (
    <div className="button-row">
      <button onClick={onPdf}><FaFilePdf /> Download PDF</button>
      <button onClick={onJson}><FaFileExport /> Save as JSON</button>
    </div>
  );
}
