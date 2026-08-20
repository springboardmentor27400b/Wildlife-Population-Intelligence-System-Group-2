from app.auth.jwt_handler import (
    create_access_token,
    verify_access_token,
)

data = {
    "sub": "admin@example.com",
    "role": "Administrator",
}

token = create_access_token(data)

print("Generated Token:\n")
print(token)

print("\nDecoded Payload:\n")

payload = verify_access_token(token)

print(payload)