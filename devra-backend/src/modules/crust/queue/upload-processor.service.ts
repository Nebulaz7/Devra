import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Process } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Worker, Job, Queue } from 'bullmq';
import { createBullMQConnection } from './bullmq.config';
import { CrustService } from '../crust.service';
import { UploadJobData } from './upload-queue.service';
import type { Redis } from 'ioredis';
import { DatasetRecordService } from 'src/modules/encryption/dataset-record.service';

@Injectable()
export class UploadProcessor implements OnModuleInit {
  private connection: Redis;
  private worker: Worker<UploadJobData, any, string>;
  private readonly logger = new Logger(UploadProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly crustService: CrustService,
    private readonly datasetRecordService: DatasetRecordService,
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
    const { filePath, metadata, datasetId } = job.data;

    try {
      const result = await this.crustService.uploadToCrust(filePath);
      const cid = 'hash' in result ? result.hash : result.Hash;
      this.logger.log(`✅ Upload complete for ${filePath}: ${cid}`);

      if (datasetId && typeof datasetId === 'string' && cid) {
        await this.datasetRecordService.markAsUploaded(datasetId, cid);
        this.logger.log(`🗄️ Dataset ${datasetId} updated with CID.`);
      } else {
        this.logger.warn(`⚠️ Missing datasetId or CID — skipping DB update.`);
      }

      return { cid };
    } catch (err) {
      this.logger.error(`❌ Upload failed for ${filePath}: ${err.message}`);
      throw err;
    }
  },
  {
    connection: this.connection,
    concurrency: 3,
    autorun: true,
    stalledInterval: 30000,
    maxStalledCount: 3,
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
  }
}