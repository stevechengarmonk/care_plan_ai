
import React, { useState } from "react";

export function FeedbackForm({ onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Your feedback..."
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
      />
      <button onClick={() => onSubmit(text)}>Send Feedback</button>
    </div>
  );
}
