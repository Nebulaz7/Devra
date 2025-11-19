import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { EncryptedFileDto } from './dto/encrypted-file.dto';

@Injectable()
export class EncryptService {
  private readonly algorithm = 'aes-256-gcm';

  hashDataset(file: Express.Multer.File): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(file.buffer);
    return Promise.resolve(hash.digest('hex'));
  }

  encryptDataset(file: Express.Multer.File): EncryptedFileDto {
    const aesKey = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, aesKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(file.buffer),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    const encryptedPath = path.join(
      __dirname,
      '../../tmp',
      `enc-${Date.now()}-${file.originalname}.enc`,
    );

    fs.mkdirSync(path.dirname(encryptedPath), { recursive: true });
    fs.writeFileSync(encryptedPath, encrypted);

    // Build response DTO
    const result = new EncryptedFileDto();
    result.encryptedPath = encryptedPath;
    result.aesKey = aesKey.toString('base64'); // return raw AES key
    result.iv = iv.toString('hex');
    result.authTag = authTag.toString('hex');

    return result;
  }

  encryptCid(cid: string) {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, aesKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(cid, 'utf8')),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      encryptedCid: encrypted.toString('hex'),
      aesKey: aesKey.toString('base64'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  decryptCid(
    encryptedCidHex: string,
    aesKeyBase64: string,
    ivHex: string,
    authTagHex: string,
  ): string {
    try {
      const aesKey = Buffer.from(aesKeyBase64, 'base64');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedCidHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, aesKey, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (err) {
      throw new Error(
        `Failed to decrypt CID: ${(err as Error).message || err}`,
      );
    }
  }

  decryptFile(
    encryptedFilePath: string,
    aesKeyBase64: string,
    ivHex: string,
    authTagHex: string,
  ) {
    const aesKey = Buffer.from(aesKeyBase64, 'base64');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const encryptedData = fs.readFileSync(encryptedFilePath);
    const decipher = crypto.createDecipheriv(this.algorithm, aesKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted;
  }
}
