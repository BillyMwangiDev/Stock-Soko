def test_e2e_register_login_deposit_order_positions(client):
	# register
	r = client.post('/auth/register', json={"email":"e2e@example.com","password":"Passw0rd!"})
	assert r.status_code == 200
	# login
	l = client.post('/auth/login', data={"username":"e2e@example.com","password":"Passw0rd!"}, headers={"content-type":"application/x-www-form-urlencoded"})
	assert l.status_code == 200
	token = l.json()["access_token"]
	h = {"authorization": f"Bearer {token}"}
	# deposit (mock)
	d = client.post('/payments/mpesa/deposit', json={"phone_number":"+254700000000","amount":100.0}, headers=h)
	assert d.status_code == 200
	# order
	o = client.post('/trades/orders', json={"symbol":"NSE:SCOM","side":"buy","quantity":1,"order_type":"market"}, headers=h)
	assert o.status_code == 200
	# positions
	p = client.get('/ledger/positions', headers=h)
	assert p.status_code == 200
	assert any(pos["symbol"] == "NSE:SCOM" for pos in p.json()["positions"])
