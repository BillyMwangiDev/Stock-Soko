from pydantic import BaseModel, EmailStr


class CdsFormData(BaseModel):
	full_name: str
	dob: str
	nationality: str
	national_id_or_passport: str
	phone: str
	email: EmailStr
	residential_address: str
	occupation: str
	employer: str | None = None
	source_of_funds: str
	investment_objective: str
	bank_name: str | None = None
	bank_account: str | None = None