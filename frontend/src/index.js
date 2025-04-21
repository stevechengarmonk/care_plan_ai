// Entry point for the React application// This file connects the root React component (App) to the HTML DOMimport React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
