# Hackathon MVP Dev Plan
## Decentralized Dataset Marketplace with AI Verification

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [High-Level Application Flow](#high-level-application-flow)
3. [Core Architecture](#core-architecture)
4. [Task 0: API Contract (CRITICAL)](#task-0-api-contract-critical)
5. [Phase 1: Foundation & Setup](#phase-1-foundation--setup)
6. [Phase 2: Core Feature Implementation](#phase-2-core-feature-implementation)
7. [Phase 3: Integration & MVP Polish](#phase-3-integration--mvp-polish)
8. [Team Responsibilities](#team-responsibilities)
9. [Success Metrics](#success-metrics)
10. [Critical Notes](#critical-notes)
11. [Resources & Links](#resources--links)

---

## Project Overview

Building a decentralized marketplace where:
- **Data owners** can encrypt and list datasets as NFTs
- **AI models** verify data quality before the NFT is finalized
- **Buyers** can purchase NFTs and receive decryption keys
- All data is stored on **IPFS via Crust Network**
- All assets are managed on **Polkadot's Asset Hub** using its native pallets, eliminating the need for custom smart contracts

**Key Success Factor**: Parallel execution with clear API contracts between teams.

---

## High-Level Application Flow

```
┌─────────────────────────────────────────────────────────┐
│                       DATA OWNER                        │
└─────────────────────────────────────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 1. Uploads Dataset to UI │
                └──────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 2. Triggers AI Verification via Backend │
                └──────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │     [AI Model API]       │
                │ 3. Analyzes & Returns Score │
                └──────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 4. Backend Encrypts Dataset │
                └──────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 5. Stores Encrypted File on IPFS │
                │    (via Crust Network)   │
                └──────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 6. Interacts with Asset Hub Pallets to Mint NFT │
                └──────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 7. Updates NFT Metadata with AI Score │
                │    (using nfts.setAttribute) │
                └──────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 8. NFT is Minted & Listed │
                └──────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────┐
│                         BUYER                           │
└─────────────────────────────────────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 9. Browses Marketplace & │
                │    Purchases NFT         │
                └──────────────────────────┘
                               │
                               ▼
                ┌──────────────────────────┐
                │ 10. Receives Decryption Key │
                └──────────────────────────┘
```

---

## Core Architecture

### Technology Stack
- **Blockchain**: Polkadot Asset Hub (Westend Asset Hub for testing) using its native pallets (nfts, Utility, Assets)
- **Storage**: IPFS via Crust Network
- **Frontend**: React/Next.js with Polkadot-API (PAPI)
- **Backend**: Node.js/Express or NestJS
- **AI/ML**: Containerized model with Flask/FastAPI API

---

## Task 0: API Contract (CRITICAL)

**Duration**: First Hour  
**Participants**: All Team Leads

Before any development begins, define the complete data structures and API endpoints. This is the foundation for parallel work.

### Dataset NFT Structure (on Asset Hub)

The `nfts` pallet on Asset Hub will manage this data. The backend will be responsible for setting these attributes.

```javascript
{
  collectionId: uint,
  itemId: uint,
  attributes: {
    name: string,
    description: string,
    ipfsCid: string,          // For encrypted data
    price: uint,              // Can be in DOT or a sufficient asset like USDC
    aiQualityScore: uint8,    // 0-100
    verificationStatus: string // PENDING, VERIFIED, FAILED
  },
  owner: address
}
```

### Backend API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/list` | Submit new dataset for listing | `{ name, description, price, file }` | `{ success, collectionId, itemId, ipfsCid }` |
| GET | `/datasets` | Fetch all listed datasets | None | `{ datasets: [...] }` |
| GET | `/dataset/{id}` | Get details for specific dataset | None | `{ dataset: {...} }` |

### AI Model API Endpoint

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/verify` | Verify dataset quality | `{ ipfsCid, tempDecryptionKey }` | `{ score: uint8, status: string }` |

---

## Phase 1: Foundation & Setup

**Goal**: Get the basic skeleton of each component running

### Blockchain Team

#### 1. Setup Environment
- Install Node.js
- Set up a project with Polkadot-API (PAPI)
- This will be used to construct and send transactions (extrinsics)

#### 2. Learn Pallet Interactions
Familiarize with the key extrinsics on Asset Hub using the Polkadot-JS UI:
- `nfts.create`, `nfts.mint`, `nfts.setAttribute`, `nfts.setPrice`
- `utility.batchAll` for atomic swaps
- `assets.transfer` for payments in other tokens (e.g., USDC)

#### 3. Get Testnet Funds
- Create a wallet with Polkadot{.js} extension
- Connect to Westend Asset Hub (the testnet for Asset Hub)
- Use a faucet to get WND (Westies) for transaction fees

### Frontend Team

#### 1. Setup Environment
- Create new React/Next.js app
- Install Polkadot-API (PAPI) for wallet interaction

#### 2. Build UI Mockups
- Marketplace gallery page
- Sell/List dataset page
- Dataset detail page
- Focus on layout structure

#### 3. Wallet Connection
- Implement "Connect Wallet" button using the Polkadot{.js} extension
- Display user's wallet address

### AI/ML Team

#### 1. Containerize Model
- Wrap AI model in Docker container
- Create simple API endpoint (Flask/FastAPI)
- Return placeholder score initially

#### 2. Test Local API
- Verify request/response flow
- Document exact input/output format

### Backend Team

#### 1. Setup Environment
- Create Node.js/Express server (or NestJS for more structure)
- Define placeholder routes for all endpoints

#### 2. Decentralized Storage Setup
- Set up Crust Network account
- Obtain API keys for IPFS W3Auth Gateway
- Test basic upload/retrieve operations

---

## Phase 2: Core Feature Implementation

**Goal**: Build core logic for each component independently

### Blockchain Team

#### 1. Construct Transactions
Write scripts using Polkadot-API (PAPI) to create transactions for:
- `nfts.create` (to create a collection for a new seller)
- `nfts.mint` (to mint the dataset NFT)
- `nfts.setAttribute` (to add metadata like IPFS CID and AI score)
- `nfts.setPrice` (to list the NFT for sale)

#### 2. Develop Atomic Swap Logic
Construct a `utility.batchAll` transaction that combines:
- `assets.transfer` (for payment, e.g., USDC)
- `nfts.buyItem` (to transfer the NFT)

This ensures a buyer only pays if they receive the NFT.

#### 3. Provide Helper Functions
Create a simple library of functions for the Backend Team to call:
- `mintNft(metadata)`
- `buyNft(nftId)`
- `setNftAttribute(nftId, key, value)`

### Frontend Team

#### 1. Implement Listing Form
- Build seller input form (name, description, price)
- Add file upload logic
- Wire to backend API

#### 2. Build Marketplace View
- Fetch data from `GET /datasets`
- Display datasets in grid/list format
- Create dataset detail page

### AI/ML Team

#### 1. Refine AI Model
- Fine-tune for hackathon demo
- Process sample datasets
- Return meaningful quality scores

#### 2. Finalize API
- Implement `POST /verify` endpoint
- Receive IPFS CID
- Fetch data, analyze, return score

### Backend Team

#### 1. Setup Environment
- Initialize a NestJS project with a modular structure (dataset, encryption, ipfs, validation, deduplication)
- Configure `.env` file for Crust IPFS credentials and other secrets
- Install core dependencies:
  ```bash
  npm install @nestjs/platform-express axios crypto multer dotenv
  ```
- Set up a temporary `/tmp` directory for encrypted files

#### 2. Dataset Upload Flow
- Create `DatasetController` with `/datasets/upload` endpoint
- Accept dataset file + metadata using Multer
- Validate request inputs (ensure file and metadata are present)
- Log file details (e.g., name, size, uploader) for tracking

#### 3. Encryption Layer (Security Core)
- Implement `EncryptionService` using AES-256-CBC algorithm
- Generate a unique encryption key and IV for each dataset
- Encrypt dataset buffer and save the encrypted file temporarily in `/tmp`
- Return encryption metadata (key + iv) securely to the caller
- Keep encryption logic modular for future algorithm upgrades

#### 4. Deduplication System
- Compute a SHA-256 hash of each uploaded dataset before encryption
- Check existing records in the database for duplicate hashes
- Reject duplicate uploads to prevent spam or redundant storage
- Continue encryption + upload only if dataset is unique

#### 5. Decentralized Storage Integration
- Implement `IpfsService` to handle file uploads to Crust Network (IPFS)
- Upload the encrypted dataset through the Crust W3Auth gateway
- Retrieve and verify the IPFS CID after upload
- Store CID, file hash, filename, uploader, and timestamp in the database

#### 6. Dataset Metadata & Persistence
Create Dataset entity/model (using Prisma or TypeORM). Store dataset metadata fields:
- `filename`
- `hash`
- `cid`
- `size`
- `uploader`
- `timestamp`

Keep AES key and IV stored securely (not publicly exposed). Return a success response with the CID and relevant dataset info.

#### 7. AI Validation Integration
- Connect the backend to the AI/ML API (FastAPI container)
- Send dataset CID and temporary decryption key for analysis
- Receive validation results (e.g., quality score, status, category)
- Include the AI evaluation results in the final response or store them in the DB

---

## Phase 3: Integration & MVP Polish

**Goal**: Connect all components and create smooth end-to-end flow

### Blockchain Team

#### Support & Debug
- Assist Frontend/Backend with transaction construction and signing
- Verify transactions on the Westend Asset Hub block explorer
- Help debug any on-chain errors

### Frontend Team

#### 1. Connect to Backend
- Wire "List Dataset" form to `POST /list`
- Ensure marketplace displays backend data correctly

#### 2. Connect to Blockchain
- Integrate Polkadot-API (PAPI) to sign and send the `utility.batchAll` transaction when a user clicks "Buy"
- Handle transaction signing via the user's Polkadot{.js} wallet

#### 3. Polish UI/UX
- Add loading spinners
- Success/error notifications
- Responsive design touches

### AI/ML Team

#### Support & Debug
- Work with Backend on API integration
- Monitor AI server logs
- Optimize response times

### Backend Team

#### 1. Finalize Integrations
- Complete full sequence: Frontend → Backend → IPFS → AI → Blockchain (Asset Hub)
- Ensure all handoffs work smoothly

#### 2. Error Handling
- Implement robust error handling
- Handle AI model failures
- Handle blockchain transaction errors
- Provide meaningful error messages to frontend

---

## Team Responsibilities

### Blockchain Team
- Constructing and managing transactions with Asset Hub pallets
- Testing interactions on the testnet
- Documenting transaction structures for the backend team

### Frontend Team
- User interface and experience
- Wallet integration (Polkadot{.js})
- API consumption and state management

### AI/ML Team
- Dataset quality verification
- API endpoint for verification service
- Model optimization and containerization

### Backend Team
- API development and orchestration
- IPFS/Crust integration
- Bridge between frontend, AI, and blockchain (Asset Hub)

---

## Success Metrics

- [ ] User can upload and list a dataset
- [ ] Dataset is stored on IPFS via Crust
- [ ] AI model verifies and scores the dataset
- [ ] NFT is minted on Asset Hub with AI score as metadata
- [ ] Buyer can purchase NFT using an atomic swap (`utility.batchAll`)
- [ ] Buyer receives decryption key

---

## Critical Notes

⚠️ **Communication is Key**: All teams must stay in sync. Use a shared channel (Discord/Slack) for real-time updates.

⚠️ **Task 0 is Mandatory**: Do not skip the API contract definition. This prevents integration hell later.

⚠️ **Test Early, Test Often**: Each team should test their component independently before integration.

---

## Resources & Links

- **Polkadot Asset Hub Wiki**: https://wiki.polkadot.network/docs/learn-assets
- **NFTs Pallet Guide**: https://wiki.polkadot.network/docs/learn-nft-pallets
- **Crust Network**: https://wiki.crust.network/
- **Polkadot-API (PAPI) Docs**: https://docs.polkadot.com/develop/toolkit/api-libraries/papi/
- **Polkadot{.js} UI** (for testing): https://polkadot.js.org/apps/

---

*Good luck! Build fast, ship faster.* 🚀
