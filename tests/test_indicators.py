def test_indicators_endpoint(client):
	res = client.post('/markets/indicators', json={"symbol":"NSE:KCB"})
	assert res.status_code == 200
	data = res.json()
	assert data["symbol"] == "NSE:KCB"
	# values can be None for short series, but keys must exist
	assert "rsi" in data and "macd" in data and "macd_signal" in data and "macd_hist" in data
