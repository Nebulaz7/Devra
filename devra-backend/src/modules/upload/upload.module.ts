import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { EncryptService } from '../encryption/encrypt.service';
import { RsaService } from '../encryption/rsa/rsa.service';
import { DatasetRecordService } from '../encryption/dataset-record.service';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService, EncryptService, RsaService, DatasetRecordService],
})
export class UploadModule {}
