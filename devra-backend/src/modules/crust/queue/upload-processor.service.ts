import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job, Queue } from 'bullmq';
import { createBullMQConnection } from './bullmq.config';
import { CrustService } from '../crust.service';
import { UploadJobData } from './upload-queue.service';
import type { Redis } from 'ioredis';

@Injectable()
export class UploadProcessor implements OnModuleInit {
  private connection: Redis;
  private worker: Worker<UploadJobData, any, string>;
  private readonly logger = new Logger(UploadProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly crustService: CrustService,
  ) {}

  onModuleInit() {
    this.connection = createBullMQConnection(this.configService);

    // Create a queue with the worker options that include scheduling capabilities
    const queue = new Queue<UploadJobData>('crust-upload', {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 1000, 
      }
    });

    this.worker = new Worker<UploadJobData>(
      'crust-upload',
      async (job: Job<UploadJobData>) => {
        this.logger.debug(`📦 Processing upload job: ${job.id}`);
        const { filePath, metadata } = job.data;

        try {
          const result = await this.crustService.uploadToCrust(filePath);
          
          const hashValue = 'hash' in result ? result.hash : result.Hash;
          this.logger.log(`✅ Upload complete for ${filePath}: ${hashValue}`);

          return result;
        } catch (err) {
          this.logger.error(`❌ Upload failed for ${filePath}: ${err.message}`);
          throw err;
        }
      },
      { 
        connection: this.connection, 
        concurrency: 3,
        autorun: true,
        // Set worker options that handle stuck jobs
        stalledInterval: 30000,     // Check for stalled jobs every 30 seconds
        maxStalledCount: 3          // Allow jobs to be marked as stalled up to 3 times
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`🎯 Job completed: ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`💥 Job failed: ${job?.id}, ${err.message}`);
    });

    this.worker.on('stalled', (jobId) => {
      this.logger.warn(`⚠️ Job stalled: ${jobId}`);
    });

    process.on('SIGTERM', async () => {
      this.logger.log(`🔒 Cleaning up before shutdown...`);
      await this.worker.close();
      await this.connection.quit();
    });
}}