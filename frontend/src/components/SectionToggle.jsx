
import React from "react";

export function SectionToggle({ view, setView }) {
  return (
    <div className="button-row">
      <button onClick={() => setView("caseNote")}>Case Note</button>
      <button onClick={() => setView("carePlan")}>Care Plan</button>
      <button onClick={() => setView("actionItems")}>Action Items</button>
      <button onClick={() => setView("raw")}>Original GenAI output</button>
    </div>
  );
}
