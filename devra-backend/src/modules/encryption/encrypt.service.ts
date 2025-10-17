import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface EncryptedFile {
  encryptedPath: string;
  key: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class EncryptService {
  private readonly algorithm = 'aes-256-gcm';

  async encryptDataset(file: Express.Multer.File): Promise<EncryptedFile> {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

    const authTag = cipher.getAuthTag();

    const encryptedPath = path.join(__dirname, "../../tmp", `enc-${Date.now()}-${file.originalname}.enc`);
    fs.mkdirSync(path.dirname(encryptedPath), { recursive: true });
    fs.writeFileSync(encryptedPath, encrypted);
    console.log('🔐 Dataset encrypted and saved to:', encryptedPath);

    return {
      encryptedPath,
      key: key.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    }
  }

  async decryptFile(encryptedFilePath: string, keyHex: string, ivHex: string, authTagHex: string) {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const encryptedData = fs.readFileSync(encryptedFilePath);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    console.log('🔓 Dataset decrypted from:', encryptedFilePath);

    return decrypted;
  }
}

