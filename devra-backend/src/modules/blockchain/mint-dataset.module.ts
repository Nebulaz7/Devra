import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MintDatasetController } from './mint-dataset.controller';
import { MintDatasetService } from './mint-dataset.service';
import { DatasetRecordService } from '../encryption/dataset-record.service';
import { EncryptService } from '../encryption/encrypt.service';
import { RsaService } from '../encryption/rsa/rsa.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [MintDatasetController],
  providers: [
    MintDatasetService, 
    DatasetRecordService, 
    EncryptService, 
    RsaService
  ],
})
export class MintModule {}
