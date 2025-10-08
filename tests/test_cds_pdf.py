def test_cds_pdf_generation(client):
	payload = {
		"full_name": "Test User",
		"dob": "1990-01-01",
		"nationality": "Kenyan",
		"national_id_or_passport": "A1234567",
		"phone": "+254700000000",
		"email": "test@example.com",
		"residential_address": "Nairobi, Kenya",
		"occupation": "Engineer",
		"employer": "Company",
		"source_of_funds": "Salary",
		"investment_objective": "Growth",
		"bank_name": "Bank",
		"bank_account": "12345678"
	}
	res = client.post("/cds/form.pdf", json=payload)
	assert res.status_code == 200
	assert res.headers.get("content-type").startswith("application/pdf")
	assert len(res.content) > 100  # basic sanity check
