# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
import google.generativeai as genai

from prompt_template import build_prompt
from pdf_utils import create_pdf

# Load environment variables (e.g. GOOGLE_API_KEY)
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.0-flash-lite")


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    summary = data.get("discharge_summary", "").strip()
    if not summary:
        return jsonify({"error": "Missing discharge_summary"}), 400

    try:
        prompt = build_prompt(summary)
        response = model.generate_content(prompt)
        result = response.text.strip()
        # Strip markdown fences if present
        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(result)
        return jsonify(parsed)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate_pdf", methods=["POST"])
def generate_pdf():
    data = request.get_json()
    summary = data.get("discharge_summary", "").strip()
    if not summary:
        return jsonify({"error": "Missing discharge_summary"}), 400

    try:
        prompt = build_prompt(summary)
        response = model.generate_content(prompt)
        result = response.text.strip()
        # Strip markdown fences if present
        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(result)

        # Build PDF content
        pdf_text = (
            f"Case Note:\n{parsed['case_note']}\n\n"
            f"Care Plan:\nGoals:\n" + "\n".join(parsed['care_plan']['goals']) + "\n\n" +
            f"Gaps:\n" + "\n".join(parsed['care_plan']['gaps']) + "\n\n" +
            f"Interventions:\n" + "\n".join(parsed['care_plan']['interventions']) + "\n\n" +
            f"Action Items:\n" + "\n".join(parsed['action_items'])
        )

        pdf_base64 = create_pdf(pdf_text)
        return jsonify({"pdf_base64": pdf_base64})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
