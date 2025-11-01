import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './modules/upload/upload.module';
import { CrustModule } from './modules/crust/crust.module';
import { ConfigModule } from '@nestjs/config';
import { EncryptionModule } from './modules/encryption/encrypt.module';
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
  providers: [AppService],
})
export class AppModule {}
