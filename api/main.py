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
import zipfile
import pandas as pd
from io import BytesIO, StringIO
import mimetypes
from PIL import Image
import io
import pyarrow.parquet as pq
import openpyxl
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
    scores: dict[str, int]  
    status: str  


def ai_verify_data(decrypted_data: bytes) -> tuple[dict[str, int], str]:
    try:
        scores = {"quality": 0, "completeness": 0, "consistency": 0, "relevance": 0}
        text_data = []
        image_data = []

        # Check if data is a ZIP archive
        if zipfile.is_zipfile(BytesIO(decrypted_data)):
            with zipfile.ZipFile(BytesIO(decrypted_data), 'r') as zf:
                file_list = zf.namelist()
                for file_name in file_list:
                    file_bytes = zf.read(file_name)
                    file_type, _ = mimetypes.guess_type(file_name)
                    process_file(file_name, file_bytes, file_type, text_data, image_data)
        else:
            # Single file
            file_name = "dataset"  # Placeholder
            file_type, _ = mimetypes.guess_type(file_name)
            process_file(file_name, decrypted_data, file_type, text_data, image_data)

        # Score text/tabular data with BERT
        text_scores = {"quality": 0, "completeness": 0, "consistency": 0, "relevance": 0}
        if text_data:
            text_scores = score_text_data(text_data)

        # Score images with ResNet-50
        image_scores = {"quality": 0, "completeness": 0, "consistency": 0, "relevance": 0}
        if image_data:
            image_scores = score_image_data(image_data)

        # Combine scores
        if text_data and image_data:
            for key in scores:
                scores[key] = int(0.6 * text_scores[key] + 0.4 * image_scores[key])
        elif text_data:
            scores = text_scores
        elif image_data:
            scores = image_scores

        status = "VERIFIED" if scores["quality"] >= 50 else "FAILED"
        return scores, status

    except Exception as e:
        print(f"Scoring error: {e}")
        return {"quality": 0, "completeness": 0, "consistency": 0, "relevance": 0}, "FAILED"
    

def process_file(file_name: str, file_bytes: bytes, file_type: str, text_data: list, image_data: list):
    """Classify and parse file based on type."""
    if not file_type:
        file_type = "unknown"

    if file_type.startswith('image/'):
        image_data.append(file_bytes)
    elif file_type in ['application/json', 'text/csv', 'application/octet-stream', 'text/plain']:
        # Handle JSON, CSV, Parquet, Excel, Text
        try:
            if file_type == 'application/json':
                data = json.loads(file_bytes.decode('utf-8'))
                text_data.extend(extract_text_from_dict(data))
            elif file_type == 'text/csv':
                df = pd.read_csv(BytesIO(file_bytes))
                text_data.extend(df.select_dtypes(include=['object']).values.flatten().astype(str))
            elif file_name.endswith('.parquet'):
                df = pq.read_table(BytesIO(file_bytes)).to_pandas()
                text_data.extend(df.select_dtypes(include=['object']).values.flatten().astype(str))
            elif file_name.endswith('.xlsx'):
                df = pd.read_excel(BytesIO(file_bytes), engine='openpyxl')
                text_data.extend(df.select_dtypes(include=['object']).values.flatten().astype(str))
            elif file_type == 'text/plain':
                text_data.append(file_bytes.decode('utf-8'))
        except Exception as e:
            print(f"Error parsing {file_name}: {e}")


def extract_text_from_dict(data, max_depth=3, current_depth=0):
    """Recursively extract strings from nested JSON."""
    texts = []
    if current_depth > max_depth:
        return texts
    if isinstance(data, str):
        texts.append(data)
    elif isinstance(data, (list, tuple)):
        for item in data:
            texts.extend(extract_text_from_dict(item, max_depth, current_depth + 1))
    elif isinstance(data, dict):
        for value in data.values():
            texts.extend(extract_text_from_dict(value, max_depth, current_depth + 1))
    return texts


def score_text_data(texts: list) -> dict[str, int]:
    try:
        perplexities = []
        sentiments = []
        for text in texts[:5]:  # Limit for speed
            inputs = bert_tokenizer(text, return_tensors='pt', truncation=True, max_length=512).to(device)
            with torch.no_grad():
                outputs = bert_model(**inputs, labels=inputs['input_ids'])
                loss = outputs.loss
                perplexity = torch.exp(loss).item()
                perplexities.append(perplexity)
                # Proxy for relevance: Use BERT for sentiment (hacky but fast)
                sentiment = len(text.split()) / max(1, perplexity)  # Word count vs complexity
                sentiments.append(sentiment)

        # Compute metrics
        avg_perplexity = np.mean(perplexities) if perplexities else float('inf')
        quality = max(0, min(100, 100 - (avg_perplexity * 2)))  # Low perplexity = high quality
        completeness = 100 if len(texts) >= 5 else len(texts) * 20  # Arbitrary: Full if ≥5 samples
        consistency = max(0, min(100, 100 - np.std(perplexities) * 10))  # Low variance = consistent
        relevance = int(np.mean(sentiments) * 20) if sentiments else 50  # Normalize sentiment proxy

        return {
            "quality": int(quality),
            "completeness": int(completeness),
            "consistency": int(consistency),
            "relevance": max(0, min(100, relevance))
        }
    except Exception as e:
        print(f"Text scoring error: {e}")
        return {"quality": 0, "completeness": 0, "consistency": 0, "relevance": 0}


def score_image_data(images: list) -> dict[str, int]:
    try:
        confidences = []
        for img_bytes in images[:3]:  # Limit for speed
            img = Image.open(BytesIO(img_bytes)).convert('RGB')
            input_tensor = resnet_transform(img).unsqueeze(0).to(device)
            with torch.no_grad():
                outputs = resnet(input_tensor)
                probs = torch.nn.functional.softmax(outputs[0], dim=0)
                top5_conf = probs.topk(5)[0].sum().item() / 5
                confidences.append(top5_conf)

        avg_conf = np.mean(confidences) if confidences else 0
        quality = int(avg_conf * 100)  # High confidence = high quality
        completeness = 100 if len(images) >= 3 else len(images) * 33  # Full if ≥3 images
        consistency = max(0, min(100, 100 - np.std(confidences) * 50))  # Low variance = consistent
        relevance = quality  # Proxy: Assume high-confidence images are relevant

        return {
            "quality": quality,
            "completeness": completeness,
            "consistency": consistency,
            "relevance": relevance
        }
    except Exception as e:
        print(f"Image scoring error: {e}")
        return {"quality": 0, "completeness": 0, "consistency": 0, "relevance": 0}



# Health check endpoint
@app.post("/verify", response_model=VerifyResponse)
async def verify_dataset(request: VerifyRequest):
    try:
        ipfs_url = f"https://ipfs.io/ipfs/{request.ipfsCid}"
        response = requests.get(ipfs_url)
        response.raise_for_status()
        encrypted_data = response.content

        try:
            key_iv = base64.b64decode(request.tempDecryptionKey)
            key, iv = key_iv[:32], key_iv[32:48]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid decryption key: {str(e)}")

        backend = default_backend()
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
        decryptor = cipher.decryptor()
        padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
        decrypted_data = padded_data.rstrip(b"\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f" * 16)

        scores, status = ai_verify_data(decrypted_data)
        return VerifyResponse(scores=scores, status=status)

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"IPFS fetch failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
