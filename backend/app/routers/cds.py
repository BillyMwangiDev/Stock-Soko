from fastapi import APIRouter, Response
from ..schemas.cds import CdsFormData
from ..services.cds_pdf_service import render_cds_form_pdf

router = APIRouter(prefix="/cds", tags=["cds"]) 


@router.post("/form.pdf")

def cds_form_pdf(data: CdsFormData) -> Response:
	pdf_bytes = render_cds_form_pdf(data)
	return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=cds_form.pdf"})
