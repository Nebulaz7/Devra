import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { EncryptService } from '../encryption/encrypt.service';
import { RsaService } from '../encryption/rsa/rsa.service';
import { DatasetRecordService } from '../encryption/dataset-record.service';
import { UploadQueueService } from '../crust/queue/upload-queue.service';
import { CrustService } from '../crust/crust.service';
import { EncryptionModule } from '../encryption/encrypt.module';
import { CrustModule } from '../crust/crust.module';
import { VerificationService } from '../verification/verification.service';

@Module({
  imports: [EncryptionModule, CrustModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    EncryptService,
    RsaService,
    DatasetRecordService,
    UploadQueueService,
    CrustService,
    ConfigService,
    VerificationService,
  ],
})
export class UploadModule {}
