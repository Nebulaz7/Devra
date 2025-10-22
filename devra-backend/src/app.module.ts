import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './modules/upload/upload.module';
import { CrustModule } from './modules/crust/crust.module';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { EncryptionModule } from './modules/encryption/encrypt.module';
import { DatasetRecord } from './modules/encryption/dto/dataset-record.entity';
import { PrismaModule } from './modules/prisma/prisma.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UploadModule,
    EncryptionModule,
    CrustModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService ],
})
export class AppModule {}
