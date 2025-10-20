import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './modules/upload/upload.module';
import { TestUploadModule } from './test/test-upload.module';


@Module({
  imports: [UploadModule, TestUploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
