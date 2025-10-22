import { ConfigService } from '@nestjs/config';

export const redisConfig = (configService: ConfigService) => ({
  host: configService.get<string>('REDIS_HOST') || '127.0.0.1',
  port: configService.get<number>('REDIS_PORT') || 6379,
  password: configService.get<string>('REDIS_PASSWORD') || undefined,
});