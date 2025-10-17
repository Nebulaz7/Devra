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
@Controller('datasets')
export class UploadController {
  constructor(private readonly encryptService: EncryptService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDataset(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Body() createDatasetDto: CreateDatasetDto, ) {
    if (!file) return { error: 'No dataset file uploaded' };

    console.log('📦 Dataset received:', file.originalname);
    console.log('📏 Size:', file.size, 'bytes');
    console.log('👤 Uploaded by wallet:', createDatasetDto.owner);
    console.log('📝 Metadata:', createDatasetDto);

    const encryptedFilePath = await this.encryptService.encryptDataset(file);

    return {
      message: 'Dataset uploaded and encrypted successfully',
      metadata: createDatasetDto,
      encryptedFilePath,
    };
  }
}
