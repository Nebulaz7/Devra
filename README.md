# Hackathon MVP Battle Plan
## Decentralized Dataset Marketplace with AI Verification

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [High-Level Application Flow](#high-level-application-flow)
3. [Core Architecture](#core-architecture)
4. [Task 0: API Contract](#task-0-api-contract-critical)
5. [Phase 1: Foundation & Setup](#phase-1-foundation--setup)
6. [Phase 2: Core Feature Implementation](#phase-2-core-feature-implementation)
7. [Phase 3: Integration & MVP Polish](#phase-3-integration--mvp-polish)
8. [Team Responsibilities](#team-responsibilities)

---

## Project Overview

Building a decentralized marketplace where:
- **Data owners** can encrypt and list datasets as NFTs
- **AI models** verify data quality before minting
- **Buyers** can purchase NFTs and receive decryption keys
- All data stored on **IPFS via Crust Network**
- Smart contracts on **Polkadot EVM-compatible parachain**

**Key Success Factor**: Parallel execution with clear API contracts between teams.

---

## High-Level Application Flow

```
┌─────────────────────────────────────────────────────────┐
│                     DATA OWNER                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  1.  Triggers AI Verification         │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  2. Encrypts & Uploads Dataset       │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  3. Stores Encrypted File on IPFS    │
        │     (via Crust Network)              │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │     [AI Model API]                   │
        │  4. Analyzes Data & Returns Score    │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  5. Calls Smart Contract to Mint NFT │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  6. Updates NFT Metadata with        │
        │     AI Score                         │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  7. NFT is Minted & Listed           │
        └──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                        BUYER                            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  8. Browses Marketplace &            │
        │     Purchases NFT                    │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  9. Receives Decryption Key          │
        └──────────────────────────────────────┘
```

---

## Core Architecture

### Technology Stack
- **Blockchain**: Solidity smart contracts on Polkadot EVM parachain (Moonbeam/Moonbase Alpha testnet)
- **Storage**: IPFS via Crust Network
- **Frontend**: React/Next.js with ethers.js or viem
- **Backend**: Node.js/Express
- **AI/ML**: Containerized model with Flask/FastAPI API

---

## Task 0: API Contract (CRITICAL)

**Duration**: First Hour  
**Participants**: All Team Leads

Before any development begins, define the complete data structures and API endpoints. This is the foundation for parallel work.

### Dataset Object Structure

```javascript
{
  nftId: uint256,
  name: string,
  description: string,
  ipfsCid: string,              // For encrypted data
  owner: address,
  price: uint256,
  aiQualityScore: uint8,        // 0-100
  verificationStatus: enum      // PENDING, VERIFIED, FAILED
}
```

### Backend API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/list` | Submit new dataset for listing | `{ name, description, price, file }` | `{ success, nftId, ipfsCid }` |
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

1. **Setup Environment**
   - Install Node.js, Hardhat
   - Configure Hardhat project with basic setup

2. **Write Contract Shell**
   - Create `DatasetNFT.sol` contract
   - Use OpenZeppelin ERC721 template
   - Define dataset metadata struct

3. **Get Testnet Funds**
   - Create wallet with Polkadot{.js} or MetaMask
   - Connect to Moonbase Alpha testnet
   - Use faucet to obtain test tokens

### Frontend Team

1. **Setup Environment**
   - Create new React/Next.js app
   - Install ethers.js or viem for wallet interaction

2. **Build UI Mockups**
   - Marketplace gallery page
   - Sell/List dataset page
   - Dataset detail page
   - Focus on layout structure

3. **Wallet Connection**
   - Implement "Connect Wallet" button
   - Display user's wallet address

### AI/ML Team

1. **Containerize Model**
   - Wrap AI model in Docker container
   - Create simple API endpoint (Flask/FastAPI)
   - Return placeholder score initially

2. **Test Local API**
   - Verify request/response flow
   - Document exact input/output format

### Backend Team

1. **Setup Environment**
   - Create Node.js/Express server
   - Define placeholder routes for all endpoints

2. **Decentralized Storage Setup**
   - Set up Crust Network account
   - Obtain API keys for IPFS W3Auth Gateway
   - Test basic upload/retrieve operations

---

## Phase 2: Core Feature Implementation

**Goal**: Build core logic for each component independently

### Blockchain Team

1. **Implement NFT Logic**
   - Write `mintDataset()` function
   - Implement `listForSale()` and `buyDataset()` functions
   - Create function for backend to update `aiQualityScore`

2. **Deploy & Test**
   - Write unit tests with Hardhat
   - Deploy contract to testnet
   - Manual testing via Hardhat console

3. **Document ABI**
   - Share contract address and ABI
   - Distribute to Frontend and Backend teams

### Frontend Team

1. **Implement Listing Form**
   - Build seller input form (name, description, price)
   - Add file upload logic
   - Wire to backend API

2. **Build Marketplace View**
   - Fetch data from `GET /datasets`
   - Display datasets in grid/list format
   - Create dataset detail page

### AI/ML Team

1. **Refine AI Model**
   - Fine-tune for hackathon demo
   - Process sample datasets
   - Return meaningful quality scores

2. **Finalize API**
   - Implement `POST /verify` endpoint
   - Receive IPFS CID
   - Fetch data, analyze, return score

### Backend Team

1. **Implement Upload Logic**
   - Create `POST /list` endpoint
   - Accept file from frontend
   - Encrypt and upload to Crust/IPFS
   - Return IPFS CID

2. **Implement AI Trigger**
   - After IPFS upload, call AI's `POST /verify`
   - Pass IPFS CID and temporary decryption key

3. **Implement Blockchain Interaction**
   - After receiving IPFS CID, call `mintDataset()`
   - After AI returns score, call `updateVerificationStatus()`

---

## Phase 3: Integration & MVP Polish

**Goal**: Connect all components and create smooth end-to-end flow

### Blockchain Team

1. **Support & Debug**
   - Assist Frontend/Backend with contract interactions
   - Verify transactions on testnet block explorer
   - Fix any smart contract issues

### Frontend Team

1. **Connect to Backend**
   - Wire "List Dataset" form to `POST /list`
   - Ensure marketplace displays backend data correctly

2. **Connect to Blockchain**
   - Integrate ethers.js/viem for `buyDataset()` calls
   - Handle transaction signing via MetaMask

3. **Polish UI/UX**
   - Add loading spinners
   - Success/error notifications
   - Responsive design touches

### AI/ML Team

1. **Support & Debug**
   - Work with Backend on API integration
   - Monitor AI server logs
   - Optimize response times

### Backend Team

1. **Finalize Integrations**
   - Complete full sequence: Frontend → Backend → IPFS → AI → Blockchain
   - Ensure all handoffs work smoothly

2. **Error Handling**
   - Implement robust error handling
   - Handle AI model failures
   - Handle blockchain transaction reverts
   - Provide meaningful error messages to frontend

---

## Team Responsibilities

### Blockchain Team
- Smart contract development and deployment
- Testing and verification on testnet
- Documentation of contract interfaces

### Frontend Team
- User interface and experience
- Wallet integration
- API consumption and state management

### AI/ML Team
- Dataset quality verification
- API endpoint for verification service
- Model optimization and containerization

### Backend Team
- API development and orchestration
- IPFS/Crust integration
- Bridge between frontend, AI, and blockchain

---

## Success Metrics

- [ ] User can upload and list a dataset
- [ ] Dataset is stored on IPFS
- [ ] AI model verifies and scores the dataset
- [ ] NFT is minted with AI score
- [ ] Buyer can purchase NFT
- [ ] Buyer receives decryption key

---

## Critical Notes

⚠️ **Communication is Key**: All teams must stay in sync. Use a shared channel (Discord/Slack) for real-time updates.

⚠️ **Task 0 is Mandatory**: Do not skip the API contract definition. This prevents integration hell later.

⚠️ **Test Early, Test Often**: Each team should test their component independently before integration.

---

## Resources & Links

- **Moonbeam Testnet**: https://docs.moonbeam.network/builders/get-started/networks/moonbase/
- **Crust Network**: https://wiki.crust.network/
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/
- **Hardhat Documentation**: https://hardhat.org/docs

---

*Good luck! Build fast, ship faster.* 🚀
