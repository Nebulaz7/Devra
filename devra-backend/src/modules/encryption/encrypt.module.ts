import { Module } from '@nestjs/common';
import { EncryptService } from './encrypt.service';
import { DatasetRecordService } from './dataset-record.service';
import { CrustService } from '../crust/crust.service';
import { VerificationService } from '../verification/verification.service';

@Module({
  imports: [],
  providers: [
    EncryptService,
    DatasetRecordService,
    CrustService,
    VerificationService,
  ],
  exports: [
    EncryptService,
    DatasetRecordService,
    CrustService,
    VerificationService,
  ],
})
export class EncryptionModule {}
