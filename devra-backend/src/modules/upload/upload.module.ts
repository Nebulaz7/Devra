import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { EncryptService } from '../encryption/encrypt.service';
import { RsaService } from '../encryption/rsa/rsa.service';
import { DatasetRecordService } from '../encryption/dataset-record.service';
import { UploadQueueService } from '../crust/queue/upload-queue.service';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService, EncryptService, RsaService, DatasetRecordService, UploadQueueService, ConfigService],
})
export class UploadModule {}
