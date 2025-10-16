import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()
export class EncryptService {
  private readonly algorithm = 'aes-256-cbc';

  async encryptDataset(file: Express.Multer.File) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

    const encryptedFilePath = path.join(__dirname, "../../tmp", `enc-${Date.now()}-${file.originalname}.enc`);
    fs.mkdirSync(path.dirname(encryptedFilePath), { recursive: true });
    fs.writeFileSync(encryptedFilePath, encrypted);
    console.log('🔐 Dataset encrypted and saved to:', encryptedFilePath);

    return {
      encryptedFilePath,
      key: key.toString('hex'),
      iv: iv.toString('hex'),
    }
  }

  async decryptFile(encryptedFilePath: string, keyHex: string, ivHex: string) {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedData = fs.readFileSync(encryptedFilePath);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    console.log('🔓 Dataset decrypted from:', encryptedFilePath);

    return decrypted;
  }
}

