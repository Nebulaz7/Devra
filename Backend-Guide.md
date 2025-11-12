# 🚀 Devra Backend Integration Guide

Complete guide for integrating the Devra backend with the frontend and smart contract.

---

## 📋 Table of Contents

1. [Backend Overview](#backend-overview)
2. [Environment Setup](#environment-setup)
3. [Backend Architecture](#backend-architecture)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Smart Contract Integration](#smart-contract-integration)
7. [Deployment Guide](#deployment-guide)

---

## 🎯 Backend Overview

The Devra backend is built with **NestJS** and provides:

- ✅ **Dataset Upload & Encryption** (AES-256-CBC)
- ✅ **IPFS Storage** via Crust Network
- ✅ **AI Validation** integration
- ✅ **Deduplication** via SHA-256 hashing
- ✅ **Metadata Management**
- ✅ **Dataset Decryption** for verified owners

---

## 🔧 Environment Setup

### **1. Prerequisites**

```bash
# Required versions
Node.js >= 18.x
npm >= 9.x
PostgreSQL >= 14.x (or your preferred DB)
```

### **2. Clone & Install**

```bash
# Clone the repository
git clone https://github.com/cridiv/Devra.git
cd Devra/devra-backend

# Install dependencies
npm install

# Install additional required packages
npm install @nestjs/platform-express axios crypto multer dotenv
npm install @prisma/client prisma
npm install class-validator class-transformer
npm install @nestjs/config
```

### **3. Environment Variables**

Create a `.env` file in `devra-backend/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/devra?schema=public"

# Crust IPFS Configuration
CRUST_AUTH_HEADER="your-crust-auth-header"
CRUST_IPFS_GATEWAY="https://gw.crustfiles.app"
CRUST_PIN_ENDPOINT="https://pin.crustcode.com/psa"

# AI Validation API
AI_API_URL="http://localhost:8000"
AI_API_KEY="your-ai-api-key"

# Encryption
ENCRYPTION_ALGORITHM="aes-256-cbc"
ENCRYPTION_KEY_LENGTH=32

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Smart Contract
WESTEND_RPC_URL="https://westend-asset-hub-eth-rpc.polkadot.io"
DATASET_NFT_ADDRESS="0x25e485Fc5492Ce1c65cFd438De6D64eB62335CD7"
```

### **4. Database Setup**

```bash
# Initialize Prisma
npx prisma init

# Create database schema
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

## 🏗️ Backend Architecture

```
devra-backend/
├── src/
│   ├── dataset/
│   │   ├── dataset.controller.ts    # Upload, decrypt endpoints
│   │   ├── dataset.service.ts       # Core dataset logic
│   │   └── dataset.entity.ts        # Dataset model
│   ├── encryption/
│   │   └── encryption.service.ts    # AES-256 encryption
│   ├── ipfs/
│   │   └── ipfs.service.ts          # Crust IPFS integration
│   ├── validation/
│   │   └── validation.service.ts    # AI validation
│   ├── deduplication/
│   │   └── deduplication.service.ts # SHA-256 hashing
│   └── main.ts
├── prisma/
│   └── schema.prisma                # Database schema
├── tmp/                             # Temporary encrypted files
├── .env
└── package.json
```

---

## 📡 API Endpoints

### **1. Upload Dataset**

**Endpoint:** `POST /api/datasets/upload`

**Request:**

```typescript
// FormData
{
  file: File,                    // Dataset file
  name: string,                  // Dataset name
  description: string,           // Dataset description
  categories: string[],          // ["Medicine", "AI", ...]
  walletAddress: string          // Uploader's wallet
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cid": "QmXYZ...", // IPFS CID (encrypted)
    "hash": "sha256...", // File hash for deduplication
    "encryptionKey": "base64...", // AES key (store securely!)
    "encryptionIv": "base64...", // AES IV
    "aiScore": 95, // AI quality score
    "filename": "dataset.zip",
    "size": 1024000,
    "timestamp": "2025-11-12T23:50:45Z"
  }
}
```

### **2. Verify Dataset Ownership**

**Endpoint:** `POST /api/datasets/verify-ownership`

**Request:**

```json
{
  "tokenId": 1,
  "walletAddress": "0x..."
}
```

**Response:**

```json
{
  "success": true,
  "ownsNFT": true,
  "owner": "0x..."
}
```

### **3. Decrypt Dataset**

**Endpoint:** `POST /api/datasets/decrypt`

**Request:**

```json
{
  "tokenId": 1,
  "walletAddress": "0x..."
}
```

**Response:**

```json
{
  "success": true,
  "decryptedCid": "QmABC...", // Real IPFS CID (decrypted)
  "downloadUrl": "https://ipfs.io/ipfs/QmABC..."
}
```

### **4. Get AI Score**

**Endpoint:** `POST /api/datasets/validate`

**Request:**

```json
{
  "cid": "QmXYZ...",
  "decryptionKey": "base64...",
  "decryptionIv": "base64..."
}
```

**Response:**

```json
{
  "success": true,
  "score": 95,
  "category": "Medicine",
  "quality": "High",
  "details": {
    "dataIntegrity": true,
    "completeness": 98,
    "format": "valid"
  }
}
```

---

## 🎨 Frontend Integration

### **1. Create API Client**

````typescript name=devra-frontend/lib/api/datasets.ts
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface UploadDatasetRequest {
  file: File;
  name: string;
  description: string;
  categories: string[];
  walletAddress: string;
}

export interface UploadDatasetResponse {
  success: boolean;
  data: {
    cid: string;
    hash: string;
    encryptionKey: string;
    encryptionIv: string;
    aiScore: number;
    filename: string;
    size: number;
    timestamp: string;
  };
}

export interface DecryptDatasetResponse {
  success: boolean;
  decryptedCid: string;
  downloadUrl: string;
}

// Upload dataset to backend
export async function uploadDataset(
  data: UploadDatasetRequest
): Promise<UploadDatasetResponse> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('categories', JSON.stringify(data.categories));
  formData.append('walletAddress', data.walletAddress);

  const response = await axios.post(
    `${API_BASE_URL}/datasets/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

// Verify ownership
export async function verifyOwnership(
  tokenId: number,
  walletAddress: string
): Promise<{ success: boolean; ownsNFT: boolean }> {
  const response = await axios.post(`${API_BASE_URL}/datasets/verify-ownership`, {
    tokenId,
    walletAddress,
  });

  return response.data;
}

// Decrypt dataset (owner only)
export async function decryptDataset(
  tokenId: number,
  walletAddress: string
): Promise<DecryptDatasetResponse> {
  const response = await axios.post(`${API_BASE_URL}/datasets/decrypt`, {
    tokenId,
    walletAddress,
  });

  return response.data;
}

// Get AI validation score
export async function getAIScore(
  cid: string,
  decryptionKey: string,
  decryptionIv: string
): Promise<{ success: boolean; score: number }> {
  const response = await axios.post(`${API_BASE_URL}/datasets/validate`, {
    cid,
    decryptionKey,
    decryptionIv,
  });

  return response.data;
}
```
````

### **2. Update Mint Modal**

````typescript name=devra-frontend/app/datasets/components/MintDatasetModal.tsx
```typescript
// Add to your existing mint modal

import { uploadDataset } from '@/lib/api/datasets';
import { useMintDataset } from '@/lib/contracts/useDataset';

const handleStartProcess = async () => {
  if (!formData.file || !formData.name || !formData.description || formData.categories.length === 0) {
    toast.error("Please complete all fields");
    return;
  }

  setFormStep("processing");
  
  try {
    // Step 1: Upload to backend (encrypts + uploads to IPFS)
    toast.loading("Uploading and encrypting dataset...", { id: "upload" });
    
    const uploadResponse = await uploadDataset({
      file: formData.file,
      name: formData.name,
      description: formData.description,
      categories: formData.categories,
      walletAddress: address!, // From useAccount()
    });

    toast.success("Dataset uploaded to IPFS!", { id: "upload" });

    // Step 2: Get AI score
    setAiScore(uploadResponse.data.aiScore);

    // Step 3: Mint NFT with encrypted CID
    toast.loading("Minting NFT on blockchain...", { id: "mint" });
    
    await mint(uploadResponse.data.cid); // Encrypted CID stored on-chain

    toast.success("NFT minted successfully!", { id: "mint" });

    // Step 4: Store encryption keys in your database (IMPORTANT!)
    // These keys are needed to decrypt the dataset later
    await fetch("/api/store-encryption-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId: mintedTokenId, // From mint transaction
        encryptionKey: uploadResponse.data.encryptionKey,
        encryptionIv: uploadResponse.data.encryptionIv,
        walletAddress: address,
      }),
    });

    setFormStep("success");
    onSuccess();
  } catch (error: any) {
    console.error("Mint error:", error);
    toast.error(error.message || "Minting failed");
    setFormStep("details");
  }
};
```;
````

### **3. Update Download Functionality**

````typescript name=devra-frontend/app/marketplace/[tokenId]/page.tsx
```typescript
import { decryptDataset, verifyOwnership } from '@/lib/api/datasets';

const handleDownload = async () => {
  if (!tokenId || !address) return;

  setIsDownloading(true);
  
  try {
    // Step 1: Verify ownership
    toast.loading("Verifying ownership...", { id: "download" });
    
    const { ownsNFT } = await verifyOwnership(tokenId, address);
    
    if (!ownsNFT) {
      toast.error("You must own this NFT to download!", { id: "download" });
      return;
    }

    // Step 2: Decrypt dataset
    toast.loading("Decrypting dataset...", { id: "download" });
    
    const { decryptedCid, downloadUrl } = await decryptDataset(tokenId, address);

    // Step 3: Open download link
    window.open(downloadUrl, "_blank");
    
    toast.success("Download started!", { id: "download" });
  } catch (error: any) {
    console.error("Download error:", error);
    toast.error(error.message || "Download failed", { id: "download" });
  } finally {
    setIsDownloading(false);
  }
};
```;
````

---

## 🔗 Smart Contract Integration

### **1. Update Contract to Store Metadata**

Your contract already stores the CID hash. Now you need to:

1. **Store encrypted CID** (bytes32 hash) on-chain ✅ (Already done)
2. **Store encryption keys** in your backend database (off-chain)
3. **Verify ownership** before allowing download

### **2. Backend Ownership Verification**

````typescript name=devra-backend/src/dataset/dataset.service.ts
```typescript
import { ethers } from 'ethers';

async verifyOwnership(tokenId: number, walletAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.WESTEND_RPC_URL
    );

    const contract = new ethers.Contract(
      process.env.DATASET_NFT_ADDRESS,
      [
        'function ownerOf(uint256 tokenId) view returns (address)',
      ],
      provider
    );

    const owner = await contract.ownerOf(tokenId);
    
    return owner.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Ownership verification error:', error);
    return false;
  }
}
```;
````

### **3. Database Schema for Encryption Keys**

````prisma name=devra-backend/prisma/schema.prisma
```prisma
model Dataset {
  id              Int      @id @default(autoincrement())
  tokenId         Int?     @unique
  filename        String
  hash            String   @unique
  cid             String   // Encrypted CID (stored on IPFS)
  encryptionKey   String   // AES key (base64)
  encryptionIv    String   // AES IV (base64)
  size            Int
  uploader        String   // Wallet address
  aiScore         Int?
  category        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```
````

---

## 🚀 Complete Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEVRA INTEGRATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. USER UPLOADS DATASET
   ├─ Frontend: User fills mint form
   ├─ Frontend: Calls uploadDataset() API
   └─ Backend: Receives file + metadata

2. BACKEND PROCESSING
   ├─ Hash file (SHA-256) for deduplication
   ├─ Check if hash exists in DB
   ├─ Encrypt file with AES-256-CBC
   ├─ Upload encrypted file to IPFS (Crust)
   ├─ Get encrypted CID
   ├─ Send to AI validation API
   ├─ Get AI score
   └─ Return { cid, encryptionKey, encryptionIv, aiScore }

3. FRONTEND MINTING
   ├─ Receive encrypted CID from backend
   ├─ Call contract.mint(encryptedCID)
   ├─ Wait for transaction confirmation
   ├─ Get tokenId from event
   └─ Store encryption keys in backend DB

4. PURCHASE & DOWNLOAD
   ├─ User purchases NFT on marketplace
   ├─ Contract transfers NFT + payment
   ├─ User clicks "Download Dataset"
   ├─ Frontend calls verifyOwnership()
   ├─ Backend checks contract.ownerOf(tokenId)
   ├─ If verified, backend decrypts CID
   ├─ Frontend opens IPFS download link
   └─ User downloads decrypted dataset
```

---

## 📝 Environment Variables Reference

| Variable              | Description           | Example                                         |
| --------------------- | --------------------- | ----------------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection | `postgresql://...`                              |
| `CRUST_AUTH_HEADER`   | Crust API auth        | `Bearer xxx`                                    |
| `CRUST_IPFS_GATEWAY`  | IPFS gateway URL      | `https://gw.crustfiles.app`                     |
| `AI_API_URL`          | AI validation API     | `http://localhost:8000`                         |
| `FRONTEND_URL`        | Frontend URL (CORS)   | `http://localhost:3000`                         |
| `WESTEND_RPC_URL`     | Blockchain RPC        | `https://westend-asset-hub-eth-rpc.polkadot.io` |
| `DATASET_NFT_ADDRESS` | Contract address      | `0x25e485...`                                   |

---

## 🧪 Testing the Integration

### **1. Start Backend**

```bash
cd devra-backend
npm run start:dev
```

### **2. Start Frontend**

```bash
cd devra-frontend
npm run dev
```

### **3. Test Upload Flow**

1. Go to `/datasets`
2. Click "Upload Dataset"
3. Fill form and upload file
4. Wait for:
   - File upload ✅
   - Encryption ✅
   - IPFS storage ✅
   - AI validation ✅
   - NFT minting ✅

### **4. Test Download Flow**

1. Go to `/marketplace`
2. Purchase a dataset NFT
3. Go to detail page
4. Click "Download Dataset"
5. Verify:
   - Ownership check ✅
   - Decryption ✅
   - IPFS download ✅

---

## 🔒 Security Considerations

1. ✅ **Encryption keys stored securely** in backend database
2. ✅ **Only owners can decrypt** datasets
3. ✅ **Encrypted CID** stored on-chain (not readable)
4. ✅ **Ownership verification** before decryption
5. ✅ **Deduplication** prevents spam
6. ✅ **AI validation** ensures quality

---

## 🚀 Deployment

### **Backend (Railway/Render/Heroku)**

```bash
# 1. Set environment variables
# 2. Deploy
railway up
# or
git push heroku main
```

### **Frontend (Vercel)**

```bash
# 1. Add environment variables
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api

# 2. Deploy
vercel --prod
```

---

## 📚 Additional Resources

- **NestJS Docs:** https://docs.nestjs.com
- **Crust Network:** https://docs.crust.network
- **IPFS Docs:** https://docs.ipfs.tech
- **Prisma Docs:** https://www.prisma.io/docs

---

## ❓ Troubleshooting

### **Issue: "Cannot connect to backend"**

```bash
# Check backend is running
curl http://localhost:3001/health

# Check CORS settings
# Add FRONTEND_URL to .env
```

### **Issue: "Encryption failed"**

```bash
# Check encryption key length
# Should be 32 bytes for AES-256
```

### **Issue: "IPFS upload failed"**

```bash
# Check Crust credentials
# Verify CRUST_AUTH_HEADER in .env
```

---

**Your backend integration is complete!** 🎉

This guide covers everything from setup to deployment. Follow the flow and your Devra platform will be fully functional with encrypted dataset management! 🚀
