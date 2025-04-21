# PDF generation utility (Unicode-safe)
from fpdf import FPDF
import base64
import tempfile


# Main function to build a single-column PDF from the GenAI output
def create_pdf(content):
    pdf = FPDF()
    pdf.add_page()
    pdf.add_font("DejaVu", "", "/app/DejaVuSans.ttf", uni=True)
    pdf.set_font("DejaVu", "", 12)
    for line in content.splitlines():
        pdf.multi_cell(0, 10, line)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf.output(tmp.name)
        tmp.seek(0)
        return base64.b64encode(tmp.read()).decode("utf-8")
