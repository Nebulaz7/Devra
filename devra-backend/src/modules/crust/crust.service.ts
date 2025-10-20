import { Injectable } from '@nestjs/common';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToU8a, u8aToHex } from '@polkadot/util';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import * as dotenv from 'dotenv'

dotenv.config();

@Injectable()
export class CrustService {
  private readonly GATEWAY_URL = process.env.CRUST_GATEWAY_URL;
  private readonly ADDRESS_PREFIX = 66;

  private readonly MNEMONIC = process.env.MNEMONIC;

async generateAuthHeader() {
  if (!this.MNEMONIC) {
    throw new Error('MNEMONIC environment variable is not defined');
  }
  
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'sr25519', ss58Format: this.ADDRESS_PREFIX });
  const account = keyring.addFromMnemonic(this.MNEMONIC);

  const message = account.address;
  
  // Sign the message - it will handle the conversion internally
  const signature = account.sign(message);
  
  // Convert signature to hex without 0x prefix
  const signatureHex = u8aToHex(signature).slice(2);

  // Format: address:signature
  const raw = `${message}:${signatureHex}`;
  const encoded = Buffer.from(raw, 'utf8').toString('base64');

  return `Basic ${encoded}`;
}

  async uploadToCrust(filePath: string) {
    if (!this.GATEWAY_URL) {
      throw new Error('CRUST_GATEWAY_URL environment variable is not defined');
    }
    
    const authHeader = await this.generateAuthHeader();
    console.log('🔑 Generated Auth Header:', authHeader);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    try {
      const response = await fetch(this.GATEWAY_URL, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      const data = await response.json() as { error?: string; Hash?: string };

      if (data.error) {
        console.error('❌ Upload failed:', data);
        return data;
      }

      console.log('✅ Uploaded successfully:', data);
      console.log(`🔗 Access via: https://gw.crustfiles.app/ipfs/${data.Hash}`);

      return {
        success: true,
        hash: data.Hash,
        url: `https://gw.crustfiles.app/ipfs/${data.Hash}`,
      };
    } catch (err) {
      console.error('❌ Upload failed:', err);
      throw err;
    }
  }
}
