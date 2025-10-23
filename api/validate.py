from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import requests
import ipfshttpclient  # For IPFS access; assumes local node at /ip4/127.0.0.1/tcp/5001
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import base64
import json
import random  # Placeholder for AI scoring

app = FastAPI(title="AI Dataset Verifier", version="0.1.0")

# Pydantic models for request/response
class VerifyRequest(BaseModel):
    ipfsCid: str
    tempDecryptionKey: str  # Base64-encoded AES key

class VerifyResponse(BaseModel):
    score: int  # 0-100
    status: str  # "PENDING", "VERIFIED", "FAILED"

# Placeholder AI function (replace with real model later, e.g., scikit-learn or HuggingFace)
def ai_verify_data(data: bytes) -> tuple[int, str]:
    # Simulate: Score based on data size (e.g., >1KB = high quality) + random factor
    size = len(data)
    base_score = min(100, max(0, (size / 1024) * 10))  # Arbitrary: 1KB = 10 points
    score = int(base_score + random.uniform(-10, 20))  # Add noise
    score = max(0, min(100, score))
    
    status = "VERIFIED" if score >= 50 else "FAILED"
    return score, status

@app.post("/verify", response_model=VerifyResponse)
async def verify_dataset(request: VerifyRequest):
    try:
        # Step 1: Fetch encrypted data from IPFS (using public gateway for simplicity)
        # In prod, use Crust gateway or local node
        ipfs_url = f"https://ipfs.io/ipfs/{request.ipfsCid}"
        response = requests.get(ipfs_url)
        response.raise_for_status()
        encrypted_data = response.content
        
        # Step 2: Decrypt (assuming AES-256-CBC; key is 32 bytes)
        # Decode base64 key (in real flow, backend provides full key+IV)
        try:
            key_b64 = request.tempDecryptionKey  # Assume this is the full key for now (key + IV concatenated)
            key_iv = base64.b64decode(key_b64)
            key = key_iv[:32]  # First 32 bytes = key
            iv = key_iv[32:48]  # Next 16 bytes = IV
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid decryption key: {str(e)}")
        
        # Decrypt
        backend = default_backend()
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
        decryptor = cipher.decryptor()
        # Remove padding (PKCS7)
        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        unpadder = padded_data.rstrip(b"\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f" * 16)  # Simple unpad
        decrypted_data = unpadder.rstrip(b"\x10" * 16)  # Adjust for actual padding
        
        # Step 3: Run AI verification
        score, status = ai_verify_data(decrypted_data)
        
        return VerifyResponse(score=score, status=status)
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"IPFS fetch failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

# Health check endpoint
@app.get("/")
def root():
    return {"message": "AI Verifier API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)