import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EncryptService } from '../encryption/encrypt.service';
import { DatasetRecordService } from '../encryption/dataset-record.service';
import { UploadQueueService } from '../crust/queue/upload-queue.service';
import { CrustService } from '../crust/crust.service';
import { VerificationService } from '../verification/verification.service';
import { VerifyResultDto } from '../encryption/dto/verified-file.dto';
import { CreateDatasetDto } from './dto/create-dataset.dto';

@Controller('datasets')
export class UploadController {
  constructor(
    private readonly encryptService: EncryptService,
    private readonly datasetRecordService: DatasetRecordService,
    private readonly uploadQueueService: UploadQueueService,
    private readonly crustService: CrustService,
    private readonly verificationService: VerificationService,
  ) {}

  // 1️⃣ VERIFY DATASET
  @Post('verify')
  @UseInterceptors(FileInterceptor('file'))
  async verifyDataset(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDatasetDto: CreateDatasetDto,
  ) {
    if (!file) return { error: 'No dataset file uploaded' };

    const verification = await this.verificationService.verifyDataset(
      file,
      createDatasetDto.description,
    );

    if (!verification.isValid) {
      return {
        message: 'Dataset verification failed',
        verification,
      };
    }

    console.log('✅ Dataset verified:', verification);

    // Temporarily return file buffer as base64 for next step (you can store it instead)
    const base64File = file.buffer.toString('base64');

    return {
      message: 'Dataset verified successfully',
      verification,
      fileData: base64File, // or fileId if you store it on disk
    };
  }

  // 2️⃣ ENCRYPT DATASET
  @Post('encrypt')
  async encryptDataset(@Body() body: { base64File: string }) {
    if (!body.base64File) return { error: 'Missing file data' };

    const buffer = Buffer.from(body.base64File, 'base64');

    const encryptionResult = await this.encryptService.encryptDataset({
      buffer,
      originalname: 'dataset.zip',
    } as Express.Multer.File);

    return {
      message: 'Dataset encrypted successfully',
      encryption: {
        encryptedPath: encryptionResult.encryptedPath,
        aesKeyEncrypted: encryptionResult.encryptedKey,
        iv: encryptionResult.iv,
        authTag: encryptionResult.authTag,
      },
    };
  }

  // 3️⃣ STORE TO IPFS / CRUST
  @Post('store-ipfs')
  async storeDataset(
    @Body() body: { filePath: string; metadata: CreateDatasetDto },
  ) {
    if (!body.filePath) return { error: 'Missing encrypted file path' };

    const cid = await this.crustService.uploadToCrust(body.filePath);

    return {
      message: 'Dataset uploaded to IPFS successfully',
      cid,
    };
  }

  // 4️⃣ FINALIZE AND RECORD (optional)
  @Post('finalize')
  async finalizeRecord(
    @Body()
    body: {
      metadata: CreateDatasetDto;
      verification: VerifyResultDto;
      encryption: {
        hash: string;
        aesKeyEncrypted: string;
        vaultKeyRef: string;
        iv: string;
        authTag: string;
      };
    },
  ) {
    const datasetRecord = await this.datasetRecordService.createRecord(
      body.metadata,
      body.verification,
      body.encryption,
    );

    await this.uploadQueueService.addJob({
      datasetId: datasetRecord.id,
      filePath: body.encryption.hash,
      metadata: body.metadata,
    });

    return {
      message: 'Dataset finalized and job queued successfully',
      datasetRecord,
    };
  }
}
