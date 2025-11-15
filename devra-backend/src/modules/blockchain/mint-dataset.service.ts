import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { EncryptService } from '../encryption/encrypt.service';
import { Dataset } from '@prisma/client'; // assuming you're using Prisma

@Injectable()
export class MintDatasetService {
  private readonly logger = new Logger(MintDatasetService.name);
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor(private readonly encryptService: EncryptService) {
    const rpcUrl = process.env.RPC_URL!;
    const contractAddress = process.env.CONTRACT_ADDRESS!;

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
  async prepareMint(dataset: Dataset, owner: string) {
    if (!ethers.isAddress(owner)) {
      throw new Error('Invalid owner address');
    }

    const cidEncryption = dataset.cidEncryption as {
      encryptedCidHex: string;
      keyId: string;
      ivHex: string;
      authTagHex: string;
    };

    if (!cidEncryption) {
      throw new Error('CID encryption not found for this dataset');
    }

    // Decrypt the CID from the encryption envelope
    const cid = await this.encryptService.decryptCid(
      cidEncryption.encryptedCidHex,
      cidEncryption.keyId,
      cidEncryption.ivHex,
      cidEncryption.authTagHex
    );

    const tokenURI = `ipfs://${cid}`;

    // Encode the mint function data for the frontend wallet to sign
    const mintData = this.contract.interface.encodeFunctionData('mint', [
      owner,
      tokenURI,
    ]);

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
   * Returns the decrypted tokenURI from a Dataset
   */
  async getDecryptedTokenURI(dataset: Dataset) {
    const cidEncryption = dataset.cidEncryption as {
      encryptedCidHex: string;
      keyId: string;
      ivHex: string;
      authTagHex: string;
    };

    if (!cidEncryption) {
      throw new Error('CID encryption not found for this dataset');
    }

    const cid = await this.encryptService.decryptCid(
      cidEncryption.encryptedCidHex,
      cidEncryption.keyId,
      cidEncryption.ivHex,
      cidEncryption.authTagHex
    );

    return `ipfs://${cid}`;
  }
}
