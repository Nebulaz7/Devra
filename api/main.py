from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
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
from typing import List, Dict, Any


app = FastAPI(title="AI Dataset Verifier", version="0.1.0")

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



class Issue(BaseModel):
    file: str
    type: str                     # "missing", "duplicate", "outlier", "text", "image"
    details: str

class VerifyRequest(BaseModel):
    ipfsCid: str
    tempDecryptionKey: str


class VerifyResponse(BaseModel):
    scores: dict[str, int]  
    status: str  
    issues: List[Issue] = []


BAD_DATA_CONFIG = {
    "missing_threshold": 0.30,
    "duplicate_threshold": 0.10,
    "z_score_threshold": 3.0,
    "text_min_len": 1,
    "text_max_len": 500,
    "image_min_size": 50,      # px on smallest side
    "image_max_black": 0.95,   # fraction of black pixels
}


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

def unpad_pkcs7(data: bytes, block_size: int = 16) -> bytes:
    """Proper PKCS7 unpadding for AES-CBC."""
    if not data:
        return data
    pad_len = data[-1]
    if pad_len > block_size or pad_len == 0:
        raise ValueError("Invalid padding length")
    if data[-pad_len:] != bytes([pad_len]) * pad_len:
        raise ValueError("Invalid padding bytes")
    return data[:-pad_len]

def zero_scores() -> dict:
    return {"quality": 0, "completeness": 0, "consistency": 0, "relevance": 0}

def flag_bad_data(
    texts: List[str],
    images: List[bytes],
    dfs: List[pd.DataFrame],
    names: List[str]
) -> List[Issue]:

    issues: List[Issue] = []
    cfg = BAD_DATA_CONFIG   # dict is up there somewhere

    # ---------- Tabular ----------
    for df, fname in zip(dfs, names):
        # missing
        miss = df.isna().mean()
        bad_cols = miss[miss > cfg["missing_threshold"]].index.tolist()
        if bad_cols:
            issues.append(Issue(file=fname, type="missing",
                               details=f"Columns >{cfg['missing_threshold']*100:.0f}% NaN: {bad_cols}"))

        # duplicates
        dup_frac = df.duplicated().mean()
        if dup_frac > cfg["duplicate_threshold"]:
            issues.append(Issue(file=fname, type="duplicate",
                               details=f"{dup_frac*100:.1f}% duplicate rows"))

        # outliers (numeric)
        for col in df.select_dtypes(include="number"):
            z = np.abs((df[col] - df[col].mean()) / df[col].std())
            if (z > cfg["z_score_threshold"]).any():
                issues.append(Issue(file=fname, type="outlier",
                                   details=f"{(z>cfg['z_score_threshold']).sum()} outliers in '{col}'"))

    # ---------- Text ----------
    for txt, fname in zip(texts, names):
        if not txt.strip():
            issues.append(Issue(file=fname, type="text", details="Empty"))
            continue
        if len(txt) < cfg["text_min_len"]:
            issues.append(Issue(file=fname, type="text", details="Too short"))
        if len(txt) > cfg["text_max_len"]:
            issues.append(Issue(file=fname, type="text", details="Too long"))
        if sum(c.isalnum() or c.isspace() for c in txt) / len(txt) < 0.1:
            issues.append(Issue(file=fname, type="text", details="Gibberish"))

    # ---------- Images ----------
    for img_bytes, fname in zip(images, names):
        try:
            img = Image.open(BytesIO(img_bytes)).convert("RGB")
            w, h = img.size
            if min(w, h) < cfg["image_min_size"]:
                issues.append(Issue(file=fname, type="image", details="Too small"))
                continue
            arr = np.array(img)
            if np.mean(np.all(arr == 0, axis=-1)) > cfg["image_max_black"]:
                issues.append(Issue(file=fname, type="image", details="Mostly black"))
        except Exception as e:
            issues.append(Issue(file=fname, type="image", details=f"Corrupt: {e}"))

    return issues



def combine_scores(text_s: dict, img_s: dict, has_text: bool, has_img: bool) -> dict:
    if has_text and has_img:
        return {k: int(0.6 * text_s[k] + 0.4 * img_s[k]) for k in text_s}
    return text_s if has_text else img_s



def ai_verify_data(decrypted_data: bytes) -> tuple[dict, str, List[Issue]]:
    

    issues: List[Issue] = []

    text_data: List[str] = []          # plain strings
    image_data: List[bytes] = []       # raw image bytes
    tabular_data: List[pd.DataFrame] = []   # pandas DataFrames
    file_names: List[str] = []         # corresponding file name for each entry

    # ---- ZIP or single file ------------------------------------------------
    if zipfile.is_zipfile(BytesIO(decrypted_data)):
        with zipfile.ZipFile(BytesIO(decrypted_data), 'r') as zf:
            for name in zf.namelist():
                fbytes = zf.read(name)
                ftype, _ = mimetypes.guess_type(name)

                # ---- unsupported file type (already handled by process_file) ----
                if ftype not in [
                    'application/json', 'text/csv', 'application/octet-stream',
                    'text/plain',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'image/png', 'image/jpeg'
                ]:
                    issues.append(Issue(
                        file=name,
                        type="unsupported",
                        details="Resend in JSON/CSV/Parquet/Excel/TXT/PNG/JPEG"
                    ))
                    continue

                file_names.append(name)

                # ---- route to the correct bucket -------------------------------
                if ftype and ftype.startswith('image/'):
                    image_data.append(fbytes)
                elif ftype == 'application/json':
                    text_data.extend(extract_text_from_dict(
                        json.loads(fbytes.decode('utf-8'))
                    ))
                elif ftype == 'text/csv':
                    tabular_data.append(pd.read_csv(BytesIO(fbytes)))
                elif name.endswith('.parquet'):
                    tabular_data.append(pq.read_table(BytesIO(fbytes)).to_pandas())
                elif name.endswith('.xlsx'):
                    tabular_data.append(pd.read_excel(BytesIO(fbytes), engine='openpyxl'))
                elif ftype == 'text/plain':
                    text_data.append(fbytes.decode('utf-8'))
    else:
        # ---- single file ----------------------------------------------------
        name = "single_file"
        ftype, _ = mimetypes.guess_type(name)

        file_names.append(name)
        if ftype and ftype.startswith('image/'):
            image_data.append(decrypted_data)
        else:
            text_data.append(decrypted_data.decode('utf-8'))

    # ---------- 2. FLAG bad data (no removal) ---------------------------
    flag_issues = flag_bad_data(
        texts=text_data,
        images=image_data,
        dfs=tabular_data,
        names=file_names
    )
    issues.extend(flag_issues)

    # ---------- 3. SCORE the *original* data ----------------------------
    text_scores = (score_text_data(text_data)
                   if text_data else zero_scores())
    img_scores  = (score_image_data(image_data)
                   if image_data else zero_scores())

    final_scores = combine_scores(
        text_s=text_scores,
        img_s=img_scores,
        has_text=bool(text_data),
        has_img=bool(image_data)
    )

    status = "VERIFIED" if final_scores["quality"] >= 50 else "FAILED"

    return final_scores, status, issues
    


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


@app.post("/verify")
async def verify_file(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        scores, status, issues = ai_verify_data(file_bytes)
        return JSONResponse({
            "scores": scores,
            "status": status,
            "issues": [issue.__dict__ for issue in issues],
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
