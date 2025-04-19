import React, { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [careNote, setCareNote] = useState("");
  const [carePlan, setCarePlan] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("note");
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setCareNote(""); setCarePlan(""); setActionItems("");

    try {
      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discharge_summary: input }),
      });
      const data = await res.json();
      if (data.result) {
        const sections = data.result.split(/(?=Care Note:|Care Plan:|Action Items:)/gi);
        for (const section of sections) {
          if (section.toLowerCase().startsWith("care note")) setCareNote(section.trim());
          else if (section.toLowerCase().startsWith("care plan")) setCarePlan(section.trim());
          else if (section.toLowerCase().startsWith("action items")) setActionItems(section.trim());
        }
        setOutput(data.result);
      } else {
        setError(data.error || "Error");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch("http://localhost:5000/generate_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discharge_summary: input }),
      });
      const data = await res.json();
      if (data.pdf_base64) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${data.pdf_base64}`;
        link.download = "care_plan.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("PDF generation failed");
      }
    } catch {
      alert("Could not reach server");
    }
  };

  return (
    <div className="app-container">
      <h1>CareNote AI</h1>
      <textarea className="summary-input" rows="10"
        placeholder="Paste hospital discharge summary..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Thinking..." : "Generate Care Plan"}
      </button>
      <button onClick={handleDownloadPDF} style={{ marginLeft: "10px" }}>
        Download PDF
      </button>
      {error && <p className="error">{error}</p>}
      <div className="tabs">
        <button onClick={() => setActiveTab("note")}>Care Note</button>
        <button onClick={() => setActiveTab("plan")}>Care Plan</button>
        <button onClick={() => setActiveTab("items")}>Action Items</button>
      </div>
      <div className="tab-output">
        {activeTab === "note" && <pre>{careNote}</pre>}
        {activeTab === "plan" && <pre>{carePlan}</pre>}
        {activeTab === "items" && <pre>{actionItems}</pre>}
      </div>
    </div>
  );
}

export default App;
