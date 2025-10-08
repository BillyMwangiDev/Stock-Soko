from base64 import b32encode

def test_register_and_login(client):
	# register
	r = client.post('/auth/register', json={"email":"user@example.com","password":"Passw0rd!","full_name":"User"})
	assert r.status_code == 200
	assert r.json()["email"] == "user@example.com"
	# login
	l = client.post('/auth/login', data={"username":"user@example.com","password":"Passw0rd!"}, headers={"content-type":"application/x-www-form-urlencoded"})
	assert l.status_code == 200
	assert l.json()["access_token"]


def test_2fa_setup_enable(client):
	l = client.post('/auth/login', data={"username":"user@example.com","password":"Passw0rd!"}, headers={"content-type":"application/x-www-form-urlencoded"})
	token = l.json()["access_token"]
	s = client.post('/auth/2fa/setup', headers={"authorization": f"Bearer {token}"})
	assert s.status_code == 200
	secret = s.json()["secret"]
	# compute current TOTP code from secret
	import pyotp
	code = pyotp.TOTP(secret).now()
	e = client.post('/auth/2fa/enable', json={"code": code}, headers={"authorization": f"Bearer {token}"})
	assert e.status_code == 200
