from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from ..schemas.cds import CdsFormData


def render_cds_form_pdf(data: CdsFormData) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "CDS Account Opening Form (MVP)")
    y -= 30
    c.setFont("Helvetica", 11)

    def line(label: str, value: str):
        nonlocal y
        c.drawString(50, y, f"{label}: {value}")
        y -= 18

    line("Full Name", data.full_name)
    line("Date of Birth", data.dob)
    line("Nationality", data.nationality)
    line("ID/Passport", data.national_id_or_passport)
    line("Phone", data.phone)
    line("Email", data.email)
    line("Residential Address", data.residential_address)
    line("Occupation", data.occupation)
    line("Employer", data.employer or "-")
    line("Source of Funds", data.source_of_funds)
    line("Investment Objective", data.investment_objective)
    line("Bank Name", data.bank_name or "-")
    line("Bank Account", data.bank_account or "-")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()
