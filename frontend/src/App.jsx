import React, { useState } from "react";
import { SummaryInput } from "./components/SummaryInput";
import { PdfJsonButtons } from "./components/PdfJsonButtons";
import { FeedbackForm } from "./components/FeedbackForm";
import "./App.css";

// API base URL, default to localhost for dev, override via REACT_APP_API_BASE_URL
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function App() {
  // ─── State ───────────────────────────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [careNote, setCareNote] = useState("");
  const [carePlan, setCarePlan] = useState({ goals: [], gaps: [], interventions: [] });
  const [actionItems, setActionItems] = useState([]);
  const [rawJson, setRawJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("caseNote");

  // ─── Event Handlers ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discharge_summary: input }),
      });
      const text = await res.text();
      const obj = JSON.parse(text);

      if (obj.error) {
        setError(obj.error);
      } else {
        setRawJson(text);
        setCareNote(obj.case_note || "");
        setCarePlan(obj.care_plan || { goals: [], gaps: [], interventions: [] });
        setActionItems(obj.action_items || []);
        setView("caseNote");
      }
    } catch (e) {
      console.error("Generate error:", e);
      setError("Network or server error");
    }

    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/generate_pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discharge_summary: input }),
      });
      const data = await res.json();
      if (data.pdf_base64) {
        const blob = new Blob(
          [Uint8Array.from(atob(data.pdf_base64), c => c.charCodeAt(0))],
          { type: "application/pdf" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "care_plan.pdf";
        a.click();
      } else {
        alert("PDF generation failed");
      }
    } catch (e) {
      console.error("PDF download error:", e);
      alert("PDF download failed");
    }
  };

  const handleDownloadJson = () => {
    const payload = { case_note: careNote, care_plan: carePlan, action_items: actionItems };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "care_plan_output.json";
    a.click();
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      <h1>📝 CareNote AI</h1>

      <SummaryInput value={input} onChange={e => setInput(e.target.value)} />

      <div className="button-row">
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "🤖 Thinking…" : "Generate Care Plan"}
        </button>
        <button onClick={() => setView("caseNote")}>Case Note</button>
        <button onClick={() => setView("carePlan")}>Care Plan</button>
        <button onClick={() => setView("actionItems")}>Action Items</button>
        <button onClick={() => setView("raw")}>Original GenAI output</button>
      </div>

      {error && <p className="error">{error}</p>}

      {view === "caseNote" && careNote && (
        <div className="output-box">
          <h2>🩺 Case Note</h2>
          <p>{careNote}</p>
        </div>
      )}

      {view === "carePlan" && (carePlan.goals.length > 0 ||
        carePlan.gaps.length > 0 ||
        carePlan.interventions.length > 0) && (
        <div className="output-box">
          <h2>📋 Care Plan</h2>
          {carePlan.goals.length > 0 && (
            <>
              <strong>Goals</strong>
              <ul>{carePlan.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
            </>
          )}
          {carePlan.gaps.length > 0 && (
            <>
              <strong>Gaps</strong>
              <ul>{carePlan.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
            </>
          )}
          {carePlan.interventions.length > 0 && (
            <>
              <strong>Interventions</strong>
              <ul>{carePlan.interventions.map((it, i) => <li key={i}>{it}</li>)}</ul>
            </>
          )}
        </div>
      )}

      {view === "actionItems" && actionItems.length > 0 && (
        <div className="output-box">
          <h2>✅ Action Items</h2>
          <ul className="action-list">
            {actionItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}

      {view === "raw" && rawJson && (
        <div className="output-box">
          <h2>Original GenAI output</h2>
          <pre className="output-text">{rawJson}</pre>
        </div>
      )}

      <PdfJsonButtons onPdf={handleDownloadPDF} onJson={handleDownloadJson} />

      <FeedbackForm onSubmit={text => {
        window.location.href =
          `mailto:careplanai.feedback@gmail.com?subject=Feedback&body=${encodeURIComponent(text)}`;
      }} />
    </div>
  );
}

export default App;
