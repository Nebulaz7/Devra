import { Injectable } from '@nestjs/common';
import { CreateDatasetDto } from '../upload/dto/create-dataset.dto';

interface EncryptionResult {
  encryptedPath: string;
  encryptedKey: string;
  iv: string;
  authTag: string;
  hash: string;
}

@Injectable()
export class DatasetRecordService {
  createRecord(metadata: CreateDatasetDto, encryption: EncryptionResult) {
    const datasetRecord = {
      ...metadata,
      hash: encryption.hash,
      encryption: {
        encryptedKey: encryption.encryptedKey,
        iv: encryption.iv,
        authTag: encryption.authTag,
      },
      timestamp: new Date().toISOString(),
    };

    return datasetRecord;
  }
}
