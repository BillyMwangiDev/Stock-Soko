def test_watchlist_crud(client):
	# start empty
	res = client.get("/watchlist")
	assert res.status_code == 200
	assert res.json()["items"] == []

	# add
	res = client.post("/watchlist", json={"symbol": "NSE:KCB", "note": "banking", "target_price": 25})
	assert res.status_code == 200
	assert any(i["symbol"] == "NSE:KCB" for i in res.json()["items"])

	# delete
	res = client.delete("/watchlist/NSE:KCB")
	assert res.status_code == 200
	assert all(i["symbol"] != "NSE:KCB" for i in res.json()["items"])
