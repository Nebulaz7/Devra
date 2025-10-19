import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { EncryptService } from '../encryption/encrypt.service';
import { RsaService } from '../encryption/rsa/rsa.service';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService, EncryptService, RsaService],
})
export class UploadModule {}
