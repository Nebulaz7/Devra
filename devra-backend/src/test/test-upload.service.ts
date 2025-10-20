import { Injectable } from '@nestjs/common';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToU8a, u8aToHex } from '@polkadot/util';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

@Injectable()
export class TestUploadService {
  private readonly GATEWAY_URL = 'https://gw.crustfiles.app/api/v0/add';
  private readonly ADDRESS_PREFIX = 66;

  private readonly MNEMONIC = 'come timber canoe stem silver leader deposit beach awesome blouse evil mobile';

async generateAuthHeader() {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'sr25519', ss58Format: this.ADDRESS_PREFIX });
  const account = keyring.addFromMnemonic(this.MNEMONIC);

  // The message should be just the address
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
