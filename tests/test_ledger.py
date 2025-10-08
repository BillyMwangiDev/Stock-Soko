def test_orders_and_positions_flow(client):
	# place order
	place = client.post("/trades/orders", json={"symbol":"NSE:SCOM","side":"buy","quantity":2,"order_type":"market"})
	assert place.status_code == 200

	# orders
	orders = client.get("/ledger/orders")
	assert orders.status_code == 200
	assert len(orders.json()["orders"]) >= 1

	# positions
	positions = client.get("/ledger/positions")
	assert positions.status_code == 200
	ps = positions.json()["positions"]
	assert any(p["symbol"] == "NSE:SCOM" for p in ps)
