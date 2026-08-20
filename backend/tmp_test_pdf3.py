import urllib.request, json
url='http://127.0.0.1:8000/api/login'
data=json.dumps({'email':'admin@example.com','password':'admin123'}).encode()
req=urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
resp=urllib.request.urlopen(req)
body=json.loads(resp.read().decode())
token=body['access_token']
print('LOGIN OK')
pdf_req=urllib.request.Request('http://127.0.0.1:8000/api/ai/report/pdf', headers={'Authorization':f'Bearer {token}'})
pdf_resp=urllib.request.urlopen(pdf_req)
print('PDF', pdf_resp.getcode(), pdf_resp.headers.get('Content-Type'), pdf_resp.headers.get('Content-Disposition'))
content = pdf_resp.read()
print('LEN', len(content), 'START', content[:8])

