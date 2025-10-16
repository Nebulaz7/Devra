import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { EncryptService } from '../encryption/encrypt.service';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService, EncryptService],
})
export class UploadModule {}
