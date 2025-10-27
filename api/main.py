from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import requests
import ipfshttpclient
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import base64
import json
import random
import torch
import torchvision.models as models
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
bert_tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertForMaskedLM.from_pretrained("bert-base-uncased").to(device)
bert_model.eval()  # Inference mode

# ResNet-50 for images (pre-trained ImageNet classifier)
resnet = resnet50(pretrained=True).to(device)
resnet.eval()
resnet_transform = transforms.Compose(
    [
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

print("Models loaded!")


class VerifyRequest(BaseModel):
    ipfsCid: str
    tempDecryptionKey: str


class VerifyResponse(BaseModel):
    score: int
    status: str


<<<<<<< Updated upstream
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
            raise HTTPException(
                status_code=400, detail=f"Invalid decryption key: {str(e)}"
            )

        backend = default_backend()
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
        decryptor = cipher.decryptor()

        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        unpadder = padded_data.rstrip(
            b"\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f" * 16
        )  # Simple unpad
        decrypted_data = unpadder.rstrip(b"\x10" * 16)

        score, status = ai_verify_data(decrypted_data)

        return VerifyResponse(score=score, status=status)

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"IPFS fetch failed: {str(e)}")
=======
def ai_verify_data(decrypted_data: bytes) -> tuple[int, str]:
    try:
        # Parse data (assume JSON for flexibility; swap to pd.read_csv if CSV)
        data_str = decrypted_data.decode('utf-8')
        dataset = json.loads(data_str)  # Or pd.read_json(io.StringIO(data_str)) for DF
        
        # Extract text and images
        texts = dataset.get('text', [])  # List of strings
        image_b64s = dataset.get('images', [])  # List of base64 strings (or paths—adapt if needed)
        
        # Score text with BERT (e.g., perplexity proxy for quality; lower = better)
        text_score = 0
        if texts:
            perplexities = []
            for text in texts[:5]:  # Limit to 5 samples for speed
                inputs = bert_tokenizer(text, return_tensors='pt', truncation=True, max_length=512).to(device)
                with torch.no_grad():
                    outputs = bert_model(**inputs, labels=inputs['input_ids'])
                    loss = outputs.loss
                    perplexity = torch.exp(loss).item()
                    perplexities.append(perplexity)
            avg_perplexity = np.mean(perplexities)
            # Normalize: Lower perplexity = higher score (empirical: <10 good, >50 bad)
            text_score = max(0, min(100, 100 - (avg_perplexity * 2)))  # Tune this!
        
        # Score images with ResNet (avg confidence across top-5 predictions)
        image_score = 0
        if image_b64s:
            confidences = []
            for b64_img in image_b64s[:3]:  # Limit to 3 for speed
                # Decode base64 to image
                img_bytes = base64.b64decode(b64_img)
                img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
                
                # Preprocess & infer
                input_tensor = resnet_transform(img).unsqueeze(0).to(device)
                with torch.no_grad():
                    outputs = resnet(input_tensor)
                    probs = torch.nn.functional.softmax(outputs[0], dim=0)
                    top5_conf = probs.topk(5, dim=0)[0].sum().item() / 5  # Avg top-5 prob
                    confidences.append(top5_conf)
            avg_conf = np.mean(confidences)
            image_score = int(avg_conf * 100)  # 0-100 scale
        
        # Combine scores (weighted; adjust based on dataset type)
        if texts and image_b64s:
            combined_score = int(0.6 * text_score + 0.4 * image_score)
        elif texts:
            combined_score = text_score
        elif image_b64s:
            combined_score = image_score
        else:
            combined_score = 0
        
        status = "VERIFIED" if combined_score >= 50 else "FAILED"
        return combined_score, status
    
>>>>>>> Stashed changes
    except Exception as e:
        print(f"Scoring error: {e}")
        return 0, "FAILED"



# Health check endpoint
@app.get("/")
def root():
    return {"message": "AI Verifier API is running!"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
