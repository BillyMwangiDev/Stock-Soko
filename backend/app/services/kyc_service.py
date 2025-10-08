from ..schemas.kyc import KycSubmission, KycStatus


def submit_kyc(sub: KycSubmission) -> KycStatus:
	# Mocked provider: auto-pending
	return KycStatus(status="pending", message="KYC submitted to provider (sandbox/mock)")
