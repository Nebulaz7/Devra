import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { Dataset } from '@prisma/client';

@Injectable()
export class MintDatasetService {
  private readonly logger = new Logger(MintDatasetService.name);
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

    if (!rpcUrl || !contractAddress) {
      throw new Error('RPC_URL or CONTRACT_ADDRESS not configured');
    }

    const abi = [
      'function mint(address to, string tokenURI) public returns (uint256)',
      'function safeMint(address to, string tokenURI) public returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    ];

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  /**
   * Prepares mint transaction data for the frontend wallet to sign
   * @param dataset - Prisma Dataset record
   * @param owner - User wallet address
   */
  prepareMint(dataset: Dataset, owner: string) {

    const cleanedOwner = (owner ?? '').trim();

    if (!cleanedOwner) {
      this.logger.error('Owner address is empty or undefined');
      throw new Error('Owner address is required');
    }

    if (!ethers.isAddress(cleanedOwner)) {
      this.logger.error(
        `Invalid Ethereum address format: "${String(cleanedOwner)}"`
      );
      throw new Error(`Invalid owner address format: ${String(cleanedOwner)}`);
    }

    // Get plain CID from dataset
    const cid = dataset.cid;

    if (!cid) {
      throw new Error('CID not found for this dataset');
    }

    const tokenURI = `ipfs://${cid}`;

    const mintData = this.contract.interface.encodeFunctionData('mint', [
      cleanedOwner,
      tokenURI,
    ]);

    this.logger.log(
      `🎨 Mint prepared for ${cleanedOwner} with tokenURI: ${tokenURI}`
    );

    return {
      tx: {
        to: this.contract.target as string,
        data: mintData,
        value: '0x0',
      },
      tokenURI,
    };
  }

  /**
   * Returns the tokenURI from a Dataset
   */
  getTokenURI(dataset: Dataset): string {
    const cid = dataset.cid;

    if (!cid) {
      throw new Error('CID not found for this dataset');
    }

    return `ipfs://${cid}`;
  }
}