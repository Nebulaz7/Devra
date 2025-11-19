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
import { VerificationService } from '../verification/verification.service';
import { VerifyResultDto } from '../encryption/dto/verified-file.dto';

@Controller('datasets')
export class UploadController {
  constructor(
    private readonly encryptService: EncryptService,
    private readonly datasetRecordService: DatasetRecordService,
    private readonly uploadQueueService: UploadQueueService,
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

    const fileEncryptionResult = this.encryptService.encryptDataset(file);

    const datasetRecord = await this.datasetRecordService.createRecord(
      createDatasetDto,
      verificationResult,
      {
        hash,
        aesKeyEncrypted: fileEncryptionResult.aesKey,
        vaultKeyRef: 'private-key',
        iv: fileEncryptionResult.iv,
        authTag: fileEncryptionResult.authTag,
      },
    );

    console.log('🗂️  Dataset record created:', datasetRecord);

    await this.uploadQueueService.addJob({
      datasetId: datasetRecord.id,
      filePath: fileEncryptionResult.encryptedPath,
      metadata: createDatasetDto,
    });

    console.log('🗂️  Dataset record created:', datasetRecord);

    return {
      message: 'Dataset verified, encrypted, and uploaded successfully',
      datasetRecord,
      metadata: createDatasetDto,
      encryptedPath: fileEncryptionResult.encryptedPath,
      hash,
      verification: verifyResultDto,
    };
  }
}
