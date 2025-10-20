import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EncryptService } from '../encryption/encrypt.service';
import type { Request } from 'express';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { DatasetRecordService } from '../encryption/dataset-record.service';

@Controller('datasets')
export class UploadController {
  constructor(private readonly encryptService: EncryptService, private readonly datasetRecordService: DatasetRecordService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDataset(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Body() createDatasetDto: CreateDatasetDto): Promise<{
    message?: string;
    metadata?: CreateDatasetDto;
    datasetRecord?;
    encryptedPath?;
    hash?: string;
    error?: string;
  }> {
    if (!file) return { error: 'No dataset file uploaded' };

    const hash = await this.encryptService.hashDataset(file);

    const encryptedPath = await this.encryptService.encryptDataset(file);
    const datasetRecord = this.datasetRecordService.createRecord(createDatasetDto, {
     ...encryptedPath,
     hash,
    });
    console.log('🗂️  Dataset record created:', datasetRecord);

    return {
      message: 'Dataset uploaded and encrypted successfully',
      datasetRecord,
      metadata: createDatasetDto,
      encryptedPath,
      hash,
    };
  }
}