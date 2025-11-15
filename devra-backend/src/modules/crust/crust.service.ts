import { Injectable, Logger } from '@nestjs/common';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class CrustService {
  private readonly logger = new Logger(CrustService.name);
  private readonly GATEWAY_URL = process.env.CRUST_GATEWAY_URL;
  private readonly ADDRESS_PREFIX = 66;
  private readonly MNEMONIC = process.env.MNEMONIC;

  private cachedAuthHeader: string | null = null;
  private cacheExpiry: number | null = null;

  private async generateAuthHeader(): Promise<string> {
    const now = Date.now();

    if (!this.MNEMONIC) {
      this.logger.error('MNEMONIC environment variable is not defined');
      throw new Error('MNEMONIC environment variable is not defined');
    }

    if (this.cachedAuthHeader && this.cacheExpiry && now < this.cacheExpiry) {
      this.logger.debug('Using cached auth header');
      return this.cachedAuthHeader;
    }

    this.logger.debug('Generating new auth header');
    await cryptoWaitReady();
    const keyring = new Keyring({
      type: 'sr25519',
      ss58Format: this.ADDRESS_PREFIX,
    });
    const account = keyring.addFromMnemonic(this.MNEMONIC);

    const message = account.address;

    const signature = account.sign(message);

    const signatureHex = u8aToHex(signature).slice(2);

    const raw = `${message}:${signatureHex}`;
    const encoded = Buffer.from(raw, 'utf8').toString('base64');

    const authHeader = `Basic ${encoded}`;
    this.cachedAuthHeader = authHeader;
    this.cacheExpiry = now + 24 * 60 * 60 * 1000; // Cache for 24 hours

    return authHeader;
  }

  async uploadToCrust(filePath: string, metadata?: Record<string, unknown>) {
    if (!this.GATEWAY_URL) {
      this.logger.error(
        'CRUST_GATEWAY_URL environment variable is not defined',
      );
      throw new Error('CRUST_GATEWAY_URL environment variable is not defined');
    }

    this.logger.debug(`🚀 Uploading ${filePath} to Crust...`);

    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found at path: ${filePath}`);
      throw new Error(`File not found at path: ${filePath}`);
    }

    const authHeader = await this.generateAuthHeader();
    this.logger.debug('🔑 Auth header generated successfully');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    try {
      this.logger.debug(`Sending request to ${this.GATEWAY_URL}`);
      const response = await fetch(this.GATEWAY_URL, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        Hash?: string;
        Name?: string;
        Size?: string;
      };

      if (data.error) {
        this.logger.error(`❌ Upload failed: ${JSON.stringify(data)}`);
        return data;
      }

      const { Hash, Name, Size } = data;
      const gatewayUrl = `https://gw.crustfiles.app/ipfs/${Hash}`;

      this.logger.log(`✅ Uploaded successfully: ${Name || filePath}`);
      this.logger.debug(`🔗 Access via: ${gatewayUrl}`);

      console.log('CID', Hash);

      return {
        success: true,
        hash: Hash,
        cid: Hash,
        name: Name || filePath.split('/').pop(),
        size: Size,
        url: gatewayUrl,
        gatewayUrl,
        metadata,
      };
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

      this.logger.error(`❌ Upload failed: ${errMsg}`);
      throw err;
    }
  }
}
