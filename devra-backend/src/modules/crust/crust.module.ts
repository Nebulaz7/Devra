import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrustController } from './crust.controller';
import { CrustService } from './crust.service';
import { UploadQueueService } from './queue/upload-queue.service';
import { UploadProcessor } from './queue/upload-processor.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [CrustController],
  providers: [CrustService, UploadQueueService, UploadProcessor],
  exports: [UploadQueueService],
})
export class CrustModule {}
