import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrustController } from './crust.controller';
import { CrustService } from './crust.service';
import { UploadQueueService } from './queue/upload-queue.service';
import { UploadProcessor } from './queue/upload-processor.service';
import { DatasetRecordService } from '../encryption/dataset-record.service';
import { EncryptService } from '../encryption/encrypt.service';
import { RsaService } from '../encryption/rsa/rsa.service';
@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [CrustController],
  providers: [
    CrustService,
    EncryptService,
    RsaService,
    UploadQueueService,
    UploadProcessor,
    DatasetRecordService,
  ],
  exports: [UploadQueueService],
})
export class CrustModule {}
