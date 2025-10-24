from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import requests
import ipfshttpclient  # For IPFS access; assumes local node at /ip4/127.0.0.1/tcp/5001
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import base64
import json
import random  
import torch
import torchvision.models as models
from transformers import BertTokenizer, BertForMaskedLM
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50
from transformers import BertTokenizer, BertForMaskedLM
import pandas as pd
from PIL import Image
import io
import numpy as np


app = FastAPI(title="AI Dataset Verifier", version="0.1.0")

print("Loading models...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# BERT for text (Masked LM for perplexity-based quality)
bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertForMaskedLM.from_pretrained('bert-base-uncased').to(device)
bert_model.eval()  # Inference mode

# ResNet-50 for images (pre-trained ImageNet classifier)
resnet = resnet50(pretrained=True).to(device)
resnet.eval()
resnet_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

print("Models loaded!")

class VerifyRequest(BaseModel):
    ipfsCid: str
    tempDecryptionKey: str  

class VerifyResponse(BaseModel):
    score: int  
    status: str  

def ai_verify_data(data: bytes) -> tuple[int, str]:
    size = len(data)
    base_score = min(100, max(0, (size / 1024) * 10))  
    score = int(base_score + random.uniform(-10, 20))  
    score = max(0, min(100, score))
    
    status = "VERIFIED" if score >= 50 else "FAILED"
    return score, status

@app.post("/verify", response_model=VerifyResponse)
async def verify_dataset(request: VerifyRequest):
    try:
        ipfs_url = f"https://ipfs.io/ipfs/{request.ipfsCid}"
        response = requests.get(ipfs_url)
        response.raise_for_status()
        encrypted_data = response.content
        
        try:
            key_b64 = request.tempDecryptionKey  
            key_iv = base64.b64decode(key_b64)
            key = key_iv[:32]  
            iv = key_iv[32:48]  
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid decryption key: {str(e)}")
        
        backend = default_backend()
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
        decryptor = cipher.decryptor()
    
        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        unpadder = padded_data.rstrip(b"\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f" * 16)  # Simple unpad
        decrypted_data = unpadder.rstrip(b"\x10" * 16) 
        

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