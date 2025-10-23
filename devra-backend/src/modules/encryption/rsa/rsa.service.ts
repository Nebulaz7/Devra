import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';



@Injectable()
export class RsaService {
  private readonly privateKeyPath = path.join(__dirname, './keys/private.pem');
  private readonly publicKeyPath = path.join(__dirname, './keys/public.pem');

  constructor() {
    this.ensureKeyPairExists();
  }

  private ensureKeyPairExists() {
    // 🔍 Create /keys folder if missing
    const dir = path.dirname(this.privateKeyPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 🗝️ If keys don’t exist, generate new ones
    if (!fs.existsSync(this.privateKeyPath) || !fs.existsSync(this.publicKeyPath)) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096, // secure
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
      });

      fs.writeFileSync(this.privateKeyPath, privateKey);
      fs.writeFileSync(this.publicKeyPath, publicKey);
    }
  }

  encryptKey(aesKey: Buffer): string {
    const publicKey = fs.readFileSync(this.publicKeyPath, 'utf-8');
    const encryptedKey = crypto.publicEncrypt(publicKey, aesKey);
    return encryptedKey.toString('base64');
  }

  decryptKey(encryptedKeyBase64: string): Buffer {
    const privateKey = fs.readFileSync(this.privateKeyPath, 'utf-8');
    const encryptedKey = Buffer.from(encryptedKeyBase64, 'base64');
    const decryptedKey = crypto.privateDecrypt(privateKey, encryptedKey);
    return decryptedKey;
  }
}
