# auth.py
import os
from jose import jwt
from fastapi import Request, HTTPException
from dotenv import load_dotenv

load_dotenv()

# CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_JWT_PUBLIC_KEY").replace("\\n", "\n")
# if not CLERK_PEM_PUBLIC_KEY:
#     raise Exception("Missing CLERK_JWT_PUBLIC_KEY")

# Loads public key from file
def get_clerk_public_key():
    try:
        with open("clerk_public_key.pem", "r") as f:
            return f.read()
    except FileNotFoundError:
        raise Exception("Missing clerk_public_key.pem file in backend directory.")

def verify_clerk_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]

    public_key = get_clerk_public_key()

    try:
        decoded = jwt.decode(token, public_key, algorithms=["RS256"], options={"verify_aud": False})
        return decoded["sub"]  # Clerk user ID
    except Exception as e:
        print("Token verification failed:", e)
        raise HTTPException(status_code=403, detail="Invalid token")
