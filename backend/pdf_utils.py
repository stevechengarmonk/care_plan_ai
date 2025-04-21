
from fpdf import FPDF
import base64
import os
import json

def create_pdf(content):
    pdf = FPDF()
    pdf.add_page()
    font_path = os.path.join(os.path.dirname(__file__), "DejaVuSans.ttf")
    pdf.add_font("DejaVu", "", font_path, uni=True)
    pdf.set_font("DejaVu", "", 12)
    for line in content.splitlines():
        pdf.multi_cell(0, 10, line)
    # Output PDF as bytes in memory
    pdf_bytes = pdf.output(dest="S").encode("latin1")
    return base64.b64encode(pdf_bytes).decode()
