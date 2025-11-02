import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDatasetDto } from '../upload/dto/create-dataset.dto';

@Injectable()
export class DatasetRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecord(
    metadata: CreateDatasetDto,
    extra: {
      hash: string;
      aesKeyEncrypted: string;
      vaultKeyRef: string;
      iv: string;
      authTag: string;
      algorithm?: string;
    },
  ) {
    if (!metadata.owner) {
      throw new Error('Missing owner in metadata');
    }

    if (!extra || typeof extra.hash !== 'string') {
      throw new Error('Missing or invalid hash in extra');
    }

    const encryptionDetails = {
      aesKeyEncrypted: extra.aesKeyEncrypted,
      vaultKeyRef: extra.vaultKeyRef,
      iv: extra.iv,
      authTag: extra.authTag,
      algorithm: extra.algorithm || 'aes-256-gcm',
    };

    const record = await this.prisma.dataset.create({
      data: {
        name: metadata.name,
        owner: metadata.owner ?? 'unknown',
        hash: extra.hash,
        encryption: encryptionDetails,
        status: 'pending',
      },
    });

    return record;
  }

  async markAsUploaded(id: string, cid: string) {
    const ipfsUrl = `https://gw.crustfiles.app/ipfs/${cid}`;
    console.log(
      `🛰️  Dataset uploaded to Crust with CID: ${cid}, IPFS URL: ${ipfsUrl}`,
    );

    const updated = await this.prisma.dataset.update({
      where: { id },
      data: {
        cidHash: cid,
        ipfsUrl: ipfsUrl,
        status: 'uploaded',
        createdAt: new Date(),
      },
    });

    return updated;
  }

  async findAll() {
    return this.prisma.dataset.findMany();
  }

  async findById(id: string) {
    return this.prisma.dataset.findUnique({ where: { id } });
  }
}
