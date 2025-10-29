from typing import Dict, Any, List
import os
import uuid
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.orm import Session
from PIL import Image
from ..schemas.kyc import KycSubmission, KycStatus
from ..database.models import User, UserProfile
from ..config import KYC_UPLOAD_DIR, MAX_UPLOAD_SIZE_MB
from ..utils.logging import get_logger

logger = get_logger("kyc_service")


def submit_kyc(sub: KycSubmission) -> KycStatus:
    # Mocked provider: auto-pending
    return KycStatus(
        status="pending", message="KYC submitted to provider (sandbox/mock)"
    )


async def upload_kyc_document(
    file: UploadFile, user_id: str, document_type: str, db: Session
) -> Dict[str, Any]:
    """Upload and validate KYC document"""
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
        if file.content_type not in allowed_types:
            raise ValueError(f"Invalid file type. Allowed: {', '.join(allowed_types)}")

        # Read file content
        content = await file.read()
        file_size_mb = len(content) / (1024 * 1024)

        # Validate file size
        if file_size_mb > MAX_UPLOAD_SIZE_MB:
            raise ValueError(f"File too large. Maximum size: {MAX_UPLOAD_SIZE_MB}MB")

        # Validate image if it's an image file
        if file.content_type.startswith("image/"):
            try:
                from io import BytesIO

                img = Image.open(BytesIO(content))
                img.verify()  # Verify it's a valid image
            except Exception as e:
                raise ValueError(f"Invalid image file: {str(e)}")

        # Create user-specific directory
        upload_dir = os.path.join(KYC_UPLOAD_DIR, user_id)
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{document_type}_{uuid.uuid4().hex}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)

        # Save file
        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(f"KYC document uploaded: {file_path} ({file_size_mb:.2f}MB)")

        # Update user profile KYC status
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile:
            # Update KYC data with document info
            kyc_data = profile.kyc_data or {}
            if document_type not in kyc_data:
                kyc_data[document_type] = []

            kyc_data[document_type].append(
                {
                    "filename": unique_filename,
                    "path": file_path,
                    "uploaded_at": datetime.utcnow().isoformat(),
                    "size_mb": round(file_size_mb, 2),
                }
            )

            profile.kyc_data = kyc_data

            # Update KYC status if enough documents uploaded
            if "national_id" in kyc_data and "proof_of_residence" in kyc_data:
                profile.kyc_status = "submitted"

            db.commit()

        return {
            "status": "success",
            "message": "Document uploaded successfully",
            "document_type": document_type,
            "filename": unique_filename,
            "file_size_mb": round(file_size_mb, 2),
            "uploaded_at": datetime.utcnow().isoformat(),
        }

    except ValueError as e:
        logger.warning(f"Document validation failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Document upload failed: {e}")
        raise


def get_kyc_status(user_id: str, db: Session) -> Dict[str, Any]:
    """Get KYC status and uploaded documents for user"""
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

        if not profile:
            return {
                "kyc_status": "not_started",
                "documents": {},
                "message": "No KYC data found",
            }

        kyc_data = profile.kyc_data or {}

        # Count uploaded documents
        document_types = ["national_id", "proof_of_residence", "passport", "signature"]
        uploaded_docs = {}

        for doc_type in document_types:
            if doc_type in kyc_data:
                uploaded_docs[doc_type] = {
                    "count": len(kyc_data[doc_type]),
                    "latest": kyc_data[doc_type][-1] if kyc_data[doc_type] else None,
                }

        return {
            "kyc_status": profile.kyc_status,
            "documents": uploaded_docs,
            "total_documents": sum(len(docs) for docs in kyc_data.values()),
            "updated_at": (
                profile.updated_at.isoformat() if profile.updated_at else None
            ),
        }

    except Exception as e:
        logger.error(f"Failed to get KYC status: {e}")
        raise


def get_kyc_documents(user_id: str, db: Session) -> List[Dict[str, Any]]:
    """Get list of all uploaded KYC documents"""
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

        if not profile or not profile.kyc_data:
            return []

        documents = []
        kyc_data = profile.kyc_data

        for doc_type, doc_list in kyc_data.items():
            for doc in doc_list:
                documents.append(
                    {
                        "type": doc_type,
                        "filename": doc.get("filename"),
                        "size_mb": doc.get("size_mb"),
                        "uploaded_at": doc.get("uploaded_at"),
                    }
                )

        # Sort by upload date (newest first)
        documents.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)

        return documents

    except Exception as e:
        logger.error(f"Failed to get KYC documents: {e}")
        raise
