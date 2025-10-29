import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import type { Redis } from 'ioredis';

export const createBullMQConnection = (configService: ConfigService): Redis => {
  const redisUrl = configService.get<string>('REDIS_URL');

  if (redisUrl) {
    const connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    console.log('✅ Connected to Redis via cloud URL');
    return connection;
  }

  const host = configService.get<string>('REDIS_HOST') ?? '127.0.0.1';
  const port = configService.get<number>('REDIS_PORT') ?? 6379;
  const password = configService.get<string>('REDIS_PASSWORD') ?? undefined;

  const connection = new IORedis({
    host,
    port,
    password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  console.log(`✅ Connected to local Redis at ${host}:${port}`);
  return connection;
};
