// React and utility imports
import React, { useState } from "react";
import "./App.css";

function App() {
  // ─── State ───────────────────────────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [careNote, setCareNote] = useState("");
  const [carePlan, setCarePlan] = useState({
    goals: [],
    gaps: [],
    interventions: [],
  });
  const [actionItems, setActionItems] = useState([]);
  const [rawJson, setRawJson] = useState("");      // raw backend JSON
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("caseNote");    // "caseNote" | "carePlan" | "actionItems" | "raw"

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const parseAndSet = async (respText) => {
    setRawJson(respText);
    let obj;
    try {
      obj = JSON.parse(respText);
      if (obj.result && typeof obj.result === "string") {
        obj = JSON.parse(
          obj.result.replace(/```json/g, "").replace(/```/g, "").trim()
        );
      }
    } catch (e) {
      console.error("Parse error:", e);
      setError("Invalid JSON from server");
      return;
    }
    // Handle API errors returned in JSON
    if (obj.error) {
      // error could be string or object
      const msg = (typeof obj.error === "string") ? obj.error : (obj.error.message || JSON.stringify(obj.error));
      setError(msg);
      // Clear previous outputs
      setCareNote("");
      setCarePlan({ goals: [], gaps: [], interventions: [] });
      setActionItems([]);
      return;
    }
    // Populate UI state
    setCareNote(obj.case_note || "");
    setCarePlan(
      obj.care_plan || { goals: [], gaps: [], interventions: [] }
    );
    setActionItems(obj.action_items || []);
  };

  // ─── Event Handlers ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discharge_summary: input }),
      });
      const text = await res.text();
      await parseAndSet(text);
    } catch (e) {
      console.error(e);
      setError("Network or server error");
    }
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:5000/generate_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discharge_summary: input }),
      });
      const contentType = res.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.pdf_base64) {
          const blob = new Blob([Uint8Array.from(atob(data.pdf_base64), c => c.charCodeAt(0))], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "care_plan.pdf"; a.click();
        } else {
          alert("PDF generation failed");
        }
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "care_plan.pdf"; a.click();
      }
    } catch (e) {
      console.error("PDF download error:", e);
      alert("PDF download failed");
    }
  };

  const handleDownloadJson = () => {
    const payload = {
      case_note: careNote,
      care_plan: carePlan,
      action_items: actionItems,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
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

      <textarea
        className="summary-input"
        rows={8}
        placeholder="Paste hospital discharge summary…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="button-row">
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "🤖 Thinking…" : "Generate Care Plan"}
        </button>
        <button onClick={() => setView("caseNote")} style={{ margin: "10px 0" }}> Case Note</button>
        <button onClick={() => setView("carePlan")} style={{ margin: "10px 0" }}>Care Plan</button>
        <button onClick={() => setView("actionItems")} style={{ margin: "10px 0" }}>
          Action Items
        </button>
        <button onClick={() => setView("raw")} style={{ margin: "10px 0" }}>Raw JSON</button>
      </div>

      {error && <p className="error">{error}</p>}

      {view === "caseNote" && careNote && (
        <div className="output-box">
          <h2>🩺 Case Note</h2>
          <p>{careNote}</p>
        </div>
      )}

      {view === "carePlan" && (carePlan.goals.length || carePlan.gaps.length || carePlan.interventions.length) > 0 && (
        <div className="output-box">
          <h2>📋 Care Plan</h2>

          {carePlan.goals.length > 0 && (
            <>
              <strong>Goals</strong>
              <ul>
                {carePlan.goals.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </>
          )}

          {carePlan.gaps.length > 0 && (
            <>
              <strong>Gaps</strong>
              <ul>
                {carePlan.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </>
          )}

          {carePlan.interventions.length > 0 && (
            <>
              <strong>Interventions</strong>
              <ul>
                {carePlan.interventions.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {view === "actionItems" && actionItems.length > 0 && (
        <div className="output-box">
          <h2>✅ Action Items</h2>
          <ul className="action-list">
            {actionItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {view === "raw" && rawJson && (
        <div className="output-box">
          <h2>Original GenAI output</h2>
          <pre className="output-text">{rawJson}</pre>
        </div>
      )}

      <div className="button-row">
        <button onClick={handleDownloadPDF}>📄 Download PDF</button>
        <button onClick={handleDownloadJson}>💾 Save as JSON</button>
      </div>
    </div>
  );
}

export default App;
