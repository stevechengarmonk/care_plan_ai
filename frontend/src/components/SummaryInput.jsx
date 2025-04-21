
import React from "react";

export function SummaryInput({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={6}
      placeholder="Paste hospital discharge summary..."
      style={{ width: "100%", padding: "10px", margin: "10px 0" }}
    />
  );
}
