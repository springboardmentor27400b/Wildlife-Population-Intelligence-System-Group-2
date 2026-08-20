import urllib.request, json, traceback, sys
url='http://127.0.0.1:8000/api/login'
data=json.dumps({'email':'admin@example.com','password':'admin123'}).encode()
req=urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
resp=urllib.request.urlopen(req)
body=json.loads(resp.read().decode())
token=body['access_token']
try:
    pdf_req=urllib.request.Request('http://127.0.0.1:8000/api/ai/report/pdf', headers={'Authorization':f'Bearer {token}'})
    pdf_resp=urllib.request.urlopen(pdf_req)
    print('OK', pdf_resp.getcode(), pdf_resp.headers.get('Content-Disposition'))
except urllib.error.HTTPError as e:
    print('HTTPERROR', e.code, e.reason)
    try:
        print(e.read().decode())
    except Exception as exc:
        print('could not read body', exc)
except Exception:
    traceback.print_exc()

