from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
from prompt_template import build_prompt
from pdf_utils import create_pdf

load_dotenv()
app = Flask(__name__)
CORS(app)

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
        result = model.generate_content(prompt).text
        return jsonify({"result": result})
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
        result_text = model.generate_content(prompt).text
        encoded = create_pdf(result_text)
        return jsonify({"pdf_base64": encoded})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
