import { Module } from '@nestjs/common';
import { EncryptService } from './encrypt.service';
import { DatasetRecordService } from './dataset-record.service';
import { CrustService } from '../crust/crust.service';
import { RsaService } from './rsa/rsa.service';
import { VerificationService } from '../verification/verification.service';

@Module({
  imports: [],
  providers: [
    EncryptService,
    DatasetRecordService,
    CrustService,
    RsaService,
    VerificationService,
  ],
  exports: [
    EncryptService,
    DatasetRecordService,
    CrustService,
    RsaService,
    VerificationService,
  ],
})
export class EncryptionModule {}
