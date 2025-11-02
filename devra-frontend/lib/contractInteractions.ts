import { ethers } from "ethers";
import { getContractWithSigner } from "@/hooks/useContract";

export interface DatasetInfo {
  ipfsCid: string;
  aiScore: number;
  status: number;
  name: string;
  description: string;
  createdAt: bigint;
  originalCreator: string;
}

export interface ListingInfo {
  seller: string;
  price: bigint;
  currencyToken: string;
  isActive: boolean;
  listedAt: bigint;
}

// Mint a new dataset
export async function mintDataset(
  owner: string,
  ipfsCid: string,
  name: string,
  description: string
) {
  const contract = await getContractWithSigner();
  const tx = await contract.mintDataset(owner, ipfsCid, name, description);
  const receipt = await tx.wait();

  // Extract tokenId from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "DatasetMinted";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = contract.interface.parseLog(event);
    return Number(parsed?.args[0]); // tokenId
  }

  return null;
}

// Get dataset info
export async function getDatasetInfo(tokenId: number): Promise<DatasetInfo> {
  const contract = await getContractWithSigner();
  const info = await contract.getDatasetInfo(tokenId);

  return {
    ipfsCid: info.ipfsCid,
    aiScore: Number(info.aiScore),
    status: Number(info.status),
    name: info.name,
    description: info.description,
    createdAt: info.createdAt,
    originalCreator: info.originalCreator,
  };
}

// List dataset for sale
export async function listForSale(tokenId: number, priceInEther: string) {
  const contract = await getContractWithSigner();
  const priceInWei = ethers.parseEther(priceInEther);
  const tx = await contract.listForSale(
    tokenId,
    priceInWei,
    ethers.ZeroAddress // For native token
  );
  await tx.wait();
}

// Buy dataset
export async function buyDataset(tokenId: number, priceInEther: string) {
  const contract = await getContractWithSigner();
  const priceInWei = ethers.parseEther(priceInEther);
  const tx = await contract.buyDataset(tokenId, { value: priceInWei });
  await tx.wait();
}

// Get listing info
export async function getListingInfo(tokenId: number): Promise<ListingInfo> {
  const contract = await getContractWithSigner();
  const info = await contract.getListingInfo(tokenId);

  return {
    seller: info.seller,
    price: info.price,
    currencyToken: info.currencyToken,
    isActive: info.isActive,
    listedAt: info.listedAt,
  };
}

// Cancel listing
export async function cancelListing(tokenId: number) {
  const contract = await getContractWithSigner();
  const tx = await contract.cancelListing(tokenId);
  await tx.wait();
}

// Get tokens owned by address
export async function getTokensByOwner(owner: string): Promise<number[]> {
  const contract = await getContractWithSigner();
  const tokens = await contract.getTokensByOwner(owner);
  return tokens.map((t: bigint) => Number(t));
}

// Get total supply
export async function getTotalSupply(): Promise<number> {
  const contract = await getContractWithSigner();
  const supply = await contract.getTotalSupply();
  return Number(supply);
}
