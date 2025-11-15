import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { RsaService } from './rsa/rsa.service';
import { EncryptedFileDto } from './dto/encrypted-file.dto';
import { storeKey } from 'src/common/config/vaultConfig';
@Injectable()
export class EncryptService {
  private readonly algorithm = 'aes-256-gcm';
  constructor(private readonly rsaService: RsaService) {}

  async hashDataset(file: Express.Multer.File): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(file.buffer);
    return Promise.resolve(hash.digest('hex'));
  }
  async encryptDataset(file: Express.Multer.File): Promise<EncryptedFileDto> {
    const aesKey = crypto.randomBytes(32);
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

    const vaultKeyRef = await storeKey(
      'private-key',
      aesKey.toString('base64'),
    );
    console.log('🔐 Vault key reference:', vaultKeyRef);

    const keyId = `aes-key-${Date.now()}`;
    const encryptedKey = await this.rsaService.encryptKey(aesKey, keyId);

    const result = new EncryptedFileDto();
    result.encryptedPath = encryptedPath;
    result.encryptedKey = encryptedKey;
    result.vaultKeyRef = vaultKeyRef;
    result.keyId = keyId;
    result.iv = iv.toString('hex');
    result.authTag = authTag.toString('hex');

    return result;
  }

  async encryptCid(cid: string) {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, aesKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(cid, 'utf8')),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    const keyId = `cid-aes-key-${Date.now()}`;
    const encryptedKey = await this.rsaService.encryptKey(aesKey, keyId);

    return {
      encryptedCid: encrypted.toString('hex'),
      encryptedKey,
      keyId,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  async decryptCid(
    encryptedCidHex: string,
    keyId: string,
    ivHex: string,
    authTagHex: string,
  ): Promise<string> {
    try {
      const aesKey = await this.rsaService.decryptKey(keyId);
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

  async decryptFile(
    encryptedFilePath: string,
    encryptedKeyBase64: string,
    keyId: string,
    ivHex: string,
    authTagHex: string,
  ) {
    const aesKey = await this.rsaService.decryptKey(keyId);
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
