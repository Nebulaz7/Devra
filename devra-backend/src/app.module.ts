import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './modules/upload/upload.module';
import { CrustModule } from './modules/crust/crust.module';


@Module({
  imports: [UploadModule, CrustModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
