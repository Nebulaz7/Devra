import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EncryptService } from '../encryption/encrypt.service';
import type { Request } from 'express';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { DatasetRecordService } from '../encryption/dataset-record.service';
import { UploadQueueService } from '../crust/queue/upload-queue.service';
import { CrustService } from '../crust/crust.service';
import { VerificationService } from '../encryption/verification.service';
import { VerifyResultDto } from '../encryption/dto/verified-file.dto';

@Controller('datasets')
export class UploadController {
  constructor(
    private readonly encryptService: EncryptService,
    private readonly datasetRecordService: DatasetRecordService,
    private readonly uploadQueueService: UploadQueueService,
    private readonly crustService: CrustService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDataset(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() createDatasetDto: CreateDatasetDto,
    verifyResultDto: VerifyResultDto,
  ): Promise<{
    message?: string;
    metadata?: CreateDatasetDto;
    datasetRecord?;
    encryptedPath?;
    hash?: string;
    error?: string;
    verification?: VerifyResultDto;
  }> {
    if (!file) return { error: 'No dataset file uploaded' };

    const verification = await this.verificationService.verifyDataset(file);

    if (!verification.isValid) {
      console.log('verification:', {
        scores: verification.scores,
        issues: verification.issues,
        status: verification.status,
      });
      return {
        message: 'Dataset verification failed',
        verification: {
          isValid: verification.isValid,
          scores: verification.scores,
          issues: verification.issues,
          status: verification.status,
        },
      };
    }

    const hash = await this.encryptService.hashDataset(file);

    const verificationResult =
      await this.verificationService.verifyDataset(file);

    const encryptionResult = await this.encryptService.encryptDataset(file);

    const datasetRecord = await this.datasetRecordService.createRecord(
      createDatasetDto,
      verificationResult,
      {
        hash,
        aesKeyEncrypted: encryptionResult.encryptedKey, // RSA-encrypted AES key
        vaultKeyRef: 'private-key', // Reference in Vault
        iv: encryptionResult.iv,
        authTag: encryptionResult.authTag,
      },
    );
    console.log('🗂️  Dataset record created:', datasetRecord);

    await this.uploadQueueService.addJob({
      datasetId: datasetRecord.id,
      filePath: encryptionResult.encryptedPath,
      metadata: createDatasetDto,
    });

    console.log('🗂️  Dataset record created:', datasetRecord);

    return {
      message: 'Dataset verified, encrypted, and uploaded successfully',
      datasetRecord,
      metadata: createDatasetDto,
      encryptedPath: encryptionResult.encryptedPath,
      hash,
      verification: verifyResultDto,
    };
  }
}
