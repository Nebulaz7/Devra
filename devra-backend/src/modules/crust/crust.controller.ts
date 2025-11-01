import { Controller, Post, Body } from '@nestjs/common';
import { UploadQueueService } from './queue/upload-queue.service';

@Controller('crust')
export class CrustController {
  constructor(private readonly uploadQueueService: UploadQueueService) {}

  @Post('upload')
  async scheduleUpload(
    @Body() body: { filePath: string; metadata?: Record<string, unknown> },
  ) {
    if (!body || !body.filePath) {
      return { error: 'filePath is required' };
    }

    await this.uploadQueueService.addJob({
      filePath: body.filePath,
      metadata: body.metadata,
    });

    return {
      message: '✅ Upload scheduled successfully',
      filePath: body.filePath,
    };
  }
}
