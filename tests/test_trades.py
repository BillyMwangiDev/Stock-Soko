def test_market_order_acceptance(client):
	res = client.post("/trades/orders", json={"symbol":"NSE:SCOM","side":"buy","quantity":10,"order_type":"market"})
	assert res.status_code == 200
	body = res.json()
	assert body["status"] == "accepted"


def test_reject_non_market(client):
	res = client.post("/trades/orders", json={"symbol":"NSE:SCOM","side":"sell","quantity":5,"order_type":"limit"})
	assert res.status_code == 200
	body = res.json()
	assert body["status"] == "rejected"
