# app.py — Flask API for CareNote AI MVP
from flask import Flask, request, jsonify
from flask_cors import CORS
from fpdf import FPDF
import os
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Few-shot example for better LLM guidance
FEW_SHOT = """
Example Discharge Summary:
Patient: James L.
Admit: 3/15/25 | Discharge: 3/20/25 | Procedure: Left Hip Replacement
Disposition: Home with walker
Plan: Home PT 3x/wk, f/u ortho 2 wks
Meds: Acetaminophen, Oxycodone, Enoxaparin

Expected Output:

Care Note:
Patient admitted for left hip arthroplasty, discharged home on POD5 with walker. No complications. Home PT arranged.

Care Plan:
Goals:
- Ambulate independently
- Attend ortho f/u
Gaps:
- Limited mobility
- Pain management needs
Interventions:
- Home PT 3x/wk
- Analgesics + anticoagulant

Action Items:
- ☑️ Confirm DME
- ☑️ Schedule PT
"""

# Create the prompt
def build_prompt(discharge_summary):
    return f"""
You are a healthcare care manager. Based on the discharge summary below, generate the following:

1. A clean and concise **Care Note**
2. A structured **Care Plan**, including:
   - Goals
   - Gaps
   - Interventions
3. A list of **Action Items** for the case manager

{FEW_SHOT}

Discharge Summary:
{discharge_summary}
"""

# Endpoint for generating care note + plan
@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    discharge_summary = data.get("discharge_summary", "").strip()
    if not discharge_summary:
        return jsonify({"error": "Missing discharge_summary"}), 400

    prompt = build_prompt(discharge_summary)
    try:
        response = model.generate_content(prompt)
        return jsonify({"result": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
