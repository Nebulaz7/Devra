# 📋 Frontend & Blockchain Implementation Guide for Backend Team

**Prepared by:** @Nebulaz7  
**Date:** 2025-11-12  
**Purpose:** Backend integration reference for Devra dataset marketplace

---

## 🎯 Overview

This document outlines how the frontend and smart contract are implemented, so the backend team can integrate correctly with both systems.

---

## 🔗 Smart Contract Details

### **Deployed Contract Information**

```
Contract Name: DatasetNFT (Devra)
Network: Westend Asset Hub (Testnet)
Chain ID: 420420421
Contract Address: 0x25e485Fc5492Ce1c65cFd438De6D64eB62335CD7
Token Symbol: DVR
Token Standard: ERC-721
Explorer: https://blockscout-asset-hub.parity-chains-scw.parity.io
RPC URL: https://westend-asset-hub-eth-rpc.polkadot.io
Currency: WND (12 decimals)
```

### **Contract ABI Location**

```
Repository: https://github.com/cridiv/Devra
File: devra-frontend/lib/contracts/DatasetNFT.ts
Export: DatasetNFTAbi
```

---

## 📊 Smart Contract Data Structure

### **On-Chain Dataset Struct**

```solidity
struct Data {
    bytes32 cid;        // IPFS CID hash (NOT the full CID!)
    uint8 score;        // AI quality score (0-100)
    uint96 price;       // Listing price in WND wei
    address creator;    // Original creator address
    bool listed;        // Is listed for sale
}
```

### **What Gets Stored On-Chain**

| Field     | Type      | Description                              | Source                |
| --------- | --------- | ---------------------------------------- | --------------------- |
| `cid`     | `bytes32` | **Keccak256 hash** of encrypted IPFS CID | Backend calculates    |
| `score`   | `uint8`   | AI quality score (0-100)                 | Backend AI validation |
| `price`   | `uint96`  | Price in wei (if listed)                 | User input            |
| `creator` | `address` | Wallet address                           | Frontend provides     |
| `listed`  | `bool`    | Marketplace status                       | User action           |

---

## 🔑 Important: CID Storage

### **What Frontend Sends to Contract**

```typescript
// Frontend calls:
await mint(fullCid: string)

// Example:
await mint("QmX7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T")
```

### **What Contract Stores**

```solidity
// Contract hashes it:
bytes32 cidHash = keccak256(bytes(fullCid))

// Stores only the 32-byte hash, NOT the full CID
data[tokenId].cid = cidHash
```

### **⚠️ Critical: Backend Must Store the Full CID**

```
❌ DO NOT store only the hash
✅ MUST store the full IPFS CID string in your database

Why?
- Contract only stores the hash for gas efficiency
- Full CID needed to download from IPFS
- Backend is responsible for CID → hash mapping
```

---

## 🔐 Encryption & Security Flow

### **What Backend Must Handle**

1. **Upload Phase:**

   ```
   User uploads file
   ↓
   Backend encrypts with AES-256
   ↓
   Backend uploads encrypted file to IPFS
   ↓
   Backend gets encrypted IPFS CID
   ↓
   Backend stores: { fullCid, encryptionKey, encryptionIv }
   ↓
   Backend sends fullCid to frontend
   ↓
   Frontend sends fullCid to smart contract
   ↓
   Contract hashes and stores keccak256(fullCid)
   ```

2. **Download Phase:**
   ```
   User clicks download
   ↓
   Frontend verifies ownership (contract.ownerOf())
   ↓
   Frontend requests decryption from backend
   ↓
   Backend verifies ownership again
   ↓
   Backend retrieves encryptionKey & encryptionIv
   ↓
   Backend decrypts and returns real IPFS CID
   ↓
   Frontend opens IPFS download link
   ```

---

## 📡 Smart Contract Functions

### **Functions Backend Will Interact With**

#### **1. Read Functions (No Gas)**

```typescript
// Get dataset info
function data(uint256 tokenId) view returns (
    bytes32 cid,
    uint8 score,
    uint96 price,
    address creator,
    bool listed
)

// Get NFT owner
function ownerOf(uint256 tokenId) view returns (address)

// Get total supply
function total() view returns (uint256)

// Get token name/symbol
function name() view returns (string)
function symbol() view returns (string)
```

#### **2. Write Functions (Requires Gas - Owner Only)**

```solidity
// Set AI score (ONLY contract owner can call)
function setScore(uint256 tokenId, uint8 score) external

// Contract owner address
function owner() view returns (address)
```

### **⚠️ Backend Must Call `setScore()` After AI Validation**

```typescript
// After AI validates dataset, backend must:

1. Get AI score (0-100)
2. Call contract.setScore(tokenId, aiScore)
3. This requires:
   - Backend wallet with WND tokens for gas
   - Private key stored securely in .env
   - Contract owner address = deployer address
```

**Current Contract Owner:**

```
Deployer: 0x88f713A8d2BF0CFD51f84F3E1cbcef04493547fe
This wallet controls setScore()
```

---

## 🎨 Frontend Integration Points

### **1. Mint Flow (Frontend → Backend → Contract)**

```typescript
// Frontend sends to backend:
POST /api/datasets/upload
{
  file: File,
  name: string,
  description: string,
  categories: string[],
  walletAddress: string
}

// Backend processes and returns:
{
  cid: string,              // Full encrypted IPFS CID
  hash: string,             // SHA-256 for deduplication
  encryptionKey: string,    // AES key (base64)
  encryptionIv: string,     // AES IV (base64)
  aiScore: number,          // 0-100
  filename: string,
  size: number
}

// Frontend then calls contract:
await contract.mint(cid)  // Full CID string

// Contract stores keccak256(cid) on-chain
// Backend must store full CID + encryption keys
```

### **2. Download Flow (Frontend → Backend)**

```typescript
// Frontend requests:
POST /api/datasets/decrypt
{
  tokenId: number,
  walletAddress: string
}

// Backend verifies ownership via contract:
const owner = await contract.ownerOf(tokenId)
if (owner !== walletAddress) throw "Not owner"

// Backend returns:
{
  decryptedCid: string,     // Real IPFS CID
  downloadUrl: string       // IPFS gateway URL
}
```

---

## 🗄️ Backend Database Schema Requirements

### **Minimum Required Fields**

```typescript
Dataset {
  id: number                  // Auto increment
  tokenId: number | null      // NFT token ID (set after minting)
  filename: string            // Original filename
  fullCid: string             // ⚠️ CRITICAL: Full IPFS CID
  cidHash: string             // keccak256 hash (for verification)
  encryptionKey: string       // AES-256 key (base64)
  encryptionIv: string        // AES-256 IV (base64)
  fileHash: string            // SHA-256 (deduplication)
  size: number                // File size in bytes
  uploader: string            // Wallet address
  aiScore: number | null      // AI quality score (0-100)
  categories: string[]        // ["Medicine", "AI", ...]
  name: string                // Dataset name
  description: string         // Dataset description
  createdAt: DateTime
  updatedAt: DateTime
}
```

### **⚠️ Security Notes**

```
✅ Store encryption keys in secure database
✅ Never expose encryption keys in API responses
✅ Never store decrypted CIDs on-chain
✅ Always verify ownership before decryption
❌ Never return encryption keys to frontend
```

---

## 🔄 Complete Integration Sequence

### **Phase 1: User Uploads Dataset**

```
1. User fills form in frontend (name, description, categories, file)
2. Frontend → Backend: POST /api/datasets/upload
3. Backend:
   a. Validates file
   b. Calculates SHA-256 hash (deduplication)
   c. Encrypts file with AES-256
   d. Uploads encrypted file to IPFS
   e. Gets encrypted CID
   f. Sends to AI validation API
   g. Gets AI score
   h. Stores in database: {fullCid, encryptionKey, encryptionIv, fileHash, aiScore}
   i. Returns to frontend: {cid, aiScore, ...}
4. Frontend calls: contract.mint(fullCid)
5. Contract:
   a. Hashes CID: cidHash = keccak256(fullCid)
   b. Stores: data[tokenId] = {cidHash, score: 0, ...}
   c. Emits: Minted(tokenId, owner, cidHash, fullCid)
6. Frontend gets tokenId from event
7. Frontend → Backend: POST /api/store-token-id {tokenId, fullCid}
8. Backend updates database: Dataset.tokenId = tokenId
```

### **Phase 2: Backend Sets AI Score**

```
1. Backend listens to Minted events OR polls for new datasets
2. For new dataset:
   a. Get tokenId and aiScore from database
   b. Call contract.setScore(tokenId, aiScore)
   c. Sign transaction with backend wallet
   d. Wait for confirmation
```

### **Phase 3: User Downloads Dataset**

```
1. User purchases NFT (contract automatically transfers)
2. User clicks "Download Dataset" button
3. Frontend verifies ownership locally
4. Frontend → Backend: POST /api/datasets/decrypt {tokenId, walletAddress}
5. Backend:
   a. Calls contract.ownerOf(tokenId)
   b. Verifies walletAddress === owner
   c. Retrieves from database: {encryptionKey, encryptionIv, fullCid}
   d. Decrypts fullCid OR returns IPFS URL
   e. Returns: {downloadUrl}
6. Frontend opens IPFS gateway URL
7. User downloads decrypted file
```

---

## 🔌 Contract Event Emissions

### **Events Backend Should Listen To**

```solidity
event Minted(
    uint256 indexed id,
    address indexed owner,
    bytes32 cidHash,
    string fullCid          // Full CID emitted in event!
)

event Listed(
    uint256 indexed id,
    uint256 price
)

event Sold(
    uint256 indexed id,
    address indexed buyer,
    uint256 price
)

event Unlisted(
    uint256 indexed id
)

event Transfer(
    address indexed from,
    address indexed to,
    uint256 indexed id
)
```

### **Why Backend Should Index Events**

```
✅ Track all minted datasets
✅ Sync tokenId with database
✅ Monitor purchases for analytics
✅ Update AI scores after minting
✅ Track ownership changes
```

---

## 🛠️ Backend Wallet Configuration

### **Required for `setScore()` Calls**

```env
# Backend needs its own wallet
BACKEND_WALLET_PRIVATE_KEY="0x..."
BACKEND_WALLET_ADDRESS="0x..."

# Must match contract owner
CONTRACT_OWNER_ADDRESS="0x88f713A8d2BF0CFD51f84F3E1cbcef04493547fe"

# For gas payments
# Get WND from faucet: https://faucet.polkadot.io/westend?parachain=1000
```

### **Calling setScore() Example**

```typescript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://westend-asset-hub-eth-rpc.polkadot.io"
);

const signer = new ethers.Wallet(
  process.env.BACKEND_WALLET_PRIVATE_KEY,
  provider
);

const contract = new ethers.Contract(
  "0x25e485Fc5492Ce1c65cFd438De6D64eB62335CD7",
  DatasetNFTAbi,
  signer
);

// Set AI score for token #1
const tx = await contract.setScore(1, 95);
await tx.wait();
```

---

## 📊 API Response Format Expected by Frontend

### **Upload Response**

```typescript
{
  success: true,
  data: {
    cid: string,              // Full encrypted CID
    hash: string,             // SHA-256 hash
    aiScore: number,          // 0-100
    filename: string,
    size: number,
    timestamp: string         // ISO 8601
  }
}
```

### **Decrypt Response**

```typescript
{
  success: true,
  decryptedCid: string,       // Real IPFS CID
  downloadUrl: string         // https://ipfs.io/ipfs/QmXYZ...
}
```

### **Verify Ownership Response**

```typescript
{
  success: true,
  ownsNFT: boolean,
  owner: string               // Current owner address
}
```

---

## 🔒 Security Checklist for Backend

```
✅ Store encryption keys in secure database (not exposed)
✅ Verify ownership before decryption
✅ Use HTTPS for all API endpoints
✅ Validate wallet signatures
✅ Rate limit API endpoints
✅ Never return encryption keys to frontend
✅ Hash passwords/keys using bcrypt
✅ Use environment variables for secrets
✅ Implement CORS properly
✅ Validate file types and sizes
✅ Sanitize user inputs
✅ Log all decrypt requests for audit
```

---

## 🎯 Key Takeaways for Backend Team

1. **CID Storage:**

   - Contract stores `keccak256(fullCid)` (32 bytes)
   - Backend MUST store full CID string (46-59 characters)
   - Use CID hash only for verification, not storage

2. **AI Score:**

   - Backend calculates score (0-100)
   - Backend calls `contract.setScore(tokenId, score)`
   - Requires backend wallet with gas

3. **Encryption:**

   - Backend encrypts datasets with AES-256
   - Stores encryption keys securely
   - Only provides decrypted CID to verified owners

4. **Ownership:**

   - Always verify with `contract.ownerOf(tokenId)`
   - Never trust frontend ownership claims
   - Backend is the authority for decryption

5. **Events:**
   - Listen to `Minted` event to sync tokenId
   - Full CID is emitted in event for redundancy
   - Index events for analytics

---

## 📞 Contact & Resources

**Frontend Developer:** @Nebulaz7  
**Repository:** https://github.com/cridiv/Devra  
**Contract Explorer:** https://blockscout-asset-hub.parity-chains-scw.parity.io/address/0x25e485Fc5492Ce1c65cFd438De6D64eB62335CD7  
**Network Faucet:** https://faucet.polkadot.io/westend?parachain=1000

---

**This document provides all necessary information for backend integration with the frontend and smart contract. No code changes needed from frontend side.** ✅
