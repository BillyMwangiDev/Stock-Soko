from typing import Any, Dict, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.models import User
from ..routers.auth import current_user_email
from ..schemas.kyc import KycStatus, KycSubmission
from ..services.kyc_service import (get_kyc_documents, get_kyc_status,
                                    submit_kyc, upload_kyc_document)
from ..utils.logging import get_logger

logger = get_logger("kyc_router")

router = APIRouter(prefix="/kyc", tags=["kyc"])


@router.post("/submit", response_model=KycStatus)
def submit(sub: KycSubmission) -> KycStatus:
    return submit_kyc(sub)


# ===============================================
# NEW ENDPOINTS - KYC Document Upload
# ===============================================


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(
        ...,
        description="Document type: national_id, proof_of_residence, passport, signature",
    ),
    email: str = Depends(current_user_email),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Upload KYC document (ID, proof of residence, etc.)"""
    try:
        # Validate document type
        valid_types = ["national_id", "proof_of_residence", "passport", "signature"]
        if document_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid document type. Allowed: {', '.join(valid_types)}",
            )

        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Upload document
        result = await upload_kyc_document(file, user.id, document_type, db)
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/status")
async def get_status(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get KYC verification status"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return get_kyc_status(user.id, db)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get KYC status: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@router.get("/documents")
async def list_documents(
    email: str = Depends(current_user_email), db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get list of uploaded KYC documents"""
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        documents = get_kyc_documents(user.id, db)

        return {"documents": documents, "count": len(documents)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get documents: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve documents: {str(e)}"
        )
