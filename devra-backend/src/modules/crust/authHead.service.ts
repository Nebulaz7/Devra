import { Injectable } from '@nestjs/common';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { Buffer } from 'buffer';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthHeadService {
  private readonly GATEWAY_URL = process.env.CRUST_GATEWAY_URL;
  private readonly ADDRESS_PREFIX = 66;

  private readonly MNEMONIC = process.env.MNEMONIC;

  private cachedAuthHeader: string | null = null;

  private cacheExpiry: number | null = null;

  private async generateAuthHeader(): Promise<string> {
    const now = Date.now();

    if (!this.MNEMONIC) {
      throw new Error('MNEMONIC environment variable is not defined');
    }

    if (this.cachedAuthHeader && this.cacheExpiry && now < this.cacheExpiry) {
      return this.cachedAuthHeader;
    }

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

    const header = await this.generateAuthHeader();
    this.cachedAuthHeader = header;
    this.cacheExpiry = now + 24 * 60 * 60 * 1000;

    return `Basic ${encoded}`;
  }
}
