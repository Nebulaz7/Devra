import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import { createBullMQConnection } from './bullmq.config';



export interface UploadJobData {
  filePath: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class UploadQueueService implements OnModuleInit {
  private uploadQueue: Queue<UploadJobData, any, string>;
  private connection: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // createBullMQConnection returns an IORedis.Redis instance (typed)
    this.connection = createBullMQConnection(this.configService);

    // Pass the connection instance — this matches bullmq's types
    this.uploadQueue = new Queue<UploadJobData>('crust-upload', {
      connection: this.connection,
    });
  }

  async addJob(fileData: UploadJobData) {
    // you can also pass job options here (attempts, backoff, priority...)
    await this.uploadQueue.add('upload-job', fileData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    console.log('🧩 Job added to queue:', fileData.filePath);
  }
}
