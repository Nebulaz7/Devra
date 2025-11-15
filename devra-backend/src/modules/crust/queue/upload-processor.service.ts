import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job } from 'bullmq';
import { createBullMQConnection } from './bullmq.config';
import { CrustService } from '../crust.service';
import { UploadJobData } from './upload-queue.service';
import type { Redis } from 'ioredis';
import { DatasetRecordService } from 'src/modules/encryption/dataset-record.service';
import { EncryptService } from '../../encryption/encrypt.service';

@Injectable()
export class UploadProcessor implements OnModuleInit {
  private connection: Redis;
  private worker: Worker<UploadJobData, any, string>;
  private readonly logger = new Logger(UploadProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly crustService: CrustService,
    private readonly encryptService: EncryptService,
    private readonly datasetRecordService: DatasetRecordService,
  ) {}

  onModuleInit() {
    this.connection = createBullMQConnection(this.configService);

    this.worker = new Worker<UploadJobData>(
      'crust-upload',
      async (job: Job<UploadJobData>) => {
        this.logger.debug(`📦 Processing upload job: ${job.id}`);
        const { filePath, datasetId } = job.data;

        try {
          const result = await this.crustService.uploadToCrust(filePath);
          const cid = 'hash' in result ? result.hash : result.Hash;
          this.logger.log(`✅ Upload complete for ${filePath}: ${cid}`);

          if (datasetId && typeof datasetId === 'string' && cid) {
            // Encrypt the CID
            const encryptedCidData = await this.encryptService.encryptCid(cid);
            this.logger.log(`🔐 CID encrypted for dataset ${datasetId}`);

            // Update dataset with encrypted CID (no need to remap, pass directly)
            await this.datasetRecordService.markAsUploaded(
              datasetId,
              cid,
              encryptedCidData,
            );
            this.logger.log(
              `🗄️ Dataset ${datasetId} updated with encrypted CID.`,
              ` cid: ${cid}`,
              `Encrypted CID: ${encryptedCidData.encryptedCid}`,
            );
          } else {
            this.logger.warn(
              `⚠️ Missing datasetId or CID — skipping DB update.`,
            );
          }

          return { cid };
        } catch (err) {
          const errMsg = (() => {
            try {
              if (err instanceof Error) return err.message;
              if (typeof err === 'string') return err;
              return JSON.stringify(err);
            } catch (err) {
              return String(err);
            }
          })();
          this.logger.error(`❌ Upload failed for ${filePath}: ${errMsg}`);
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

    process.on('SIGTERM', () => {
      this.logger.log(`🔒 Cleaning up before shutdown...`);
      void (async () => {
        try {
          await this.worker.close();
          await this.connection.quit();
        } catch (e) {
          this.logger.error(
            `Error during shutdown: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      })();
    });
  }
}
