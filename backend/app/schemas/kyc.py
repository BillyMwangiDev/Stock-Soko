from pydantic import BaseModel


class KycSubmission(BaseModel):
	full_name: str
	national_id_or_passport: str
	phone: str
	email: str


class KycStatus(BaseModel):
	status: str  # pending, approved, rejected
	message: str