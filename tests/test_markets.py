def test_markets_list(client):
	res = client.get("/markets")
	assert res.status_code == 200
	data = res.json()
	assert "instruments" in data
	assert len(data["instruments"]) >= 1


def test_quote_and_recommendation(client):
	res = client.post("/markets/quote", json={"symbol": "NSE:KCB"})
	assert res.status_code == 200
	quote = res.json()
	assert "sparkline" in quote and len(quote["sparkline"]) > 5

	rec = client.post("/markets/recommendation", json={"symbol": "NSE:KCB"})
	assert rec.status_code == 200
	payload = rec.json()
	assert payload["symbol"] == "NSE:KCB"
	assert payload["recommendation"] in {"buy", "sell", "hold"}
