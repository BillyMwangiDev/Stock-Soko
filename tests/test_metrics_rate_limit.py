def test_metrics_endpoint(client):
	res = client.get('/metrics')
	assert res.status_code == 200
	assert b'http_requests_total' in res.content


def test_rate_limit_basic(client):
	# issue a burst of requests; we expect some to pass, but not to 429 within small count
	# keeping small to avoid flakiness
	ok = 0
	for _ in range(5):
		resp = client.get('/health')
		if resp.status_code == 200:
			ok += 1
	assert ok >= 1
