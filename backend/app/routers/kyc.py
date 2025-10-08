from fastapi import APIRouter
from ..schemas.kyc import KycSubmission, KycStatus
from ..services.kyc_service import submit_kyc

router = APIRouter(prefix="/kyc", tags=["kyc"])


@router.post("/submit", response_model=KycStatus)
def submit(sub: KycSubmission) -> KycStatus:
    return submit_kyc(sub)
