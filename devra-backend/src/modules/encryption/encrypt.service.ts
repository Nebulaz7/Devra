import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { RsaService } from './rsa/rsa.service';
import { EncryptedFileDto } from './dto/encrypted-file.dto';


@Injectable()
export class EncryptService {
  private readonly algorithm = 'aes-256-gcm';
  constructor(private readonly rsaService: RsaService) {}

  async hashDataset(file: Express.Multer.File): Promise<string> {
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    console.log('🧩 Dataset hash (SHA-256):', hash);
    return hash;
  }

  async encryptDataset(file: Express.Multer.File): Promise<EncryptedFileDto> {
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, aesKey, iv);

    const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

    const authTag = cipher.getAuthTag();

    const encryptedPath = path.join(__dirname, "../../tmp", `enc-${Date.now()}-${file.originalname}.enc`);
    
    fs.mkdirSync(path.dirname(encryptedPath), { recursive: true });
    fs.writeFileSync(encryptedPath, encrypted);
    console.log('🔐 Dataset encrypted and saved to:', encryptedPath);
    console.log('🗝️  Encryption key (hex):', aesKey.toString('hex'));
    console.log('🔑 Initialization vector (hex):', iv.toString('hex'));
    console.log('🛡️  Auth tag (hex):', authTag.toString('hex'));

    const encryptedKey = this.rsaService.encryptKey(aesKey);
    console.log('🔒 AES key wrapped with RSA public key.');

    const result = new EncryptedFileDto();
    result.encryptedPath = encryptedPath;
    result.encryptedKey = encryptedKey;
    result.iv = iv.toString('hex');
    result.authTag = authTag.toString('hex');

    return result;
  }

  async decryptFile(encryptedFilePath: string, encryptedKeyBase64: string, ivHex: string, authTagHex: string) {
    const aesKey = this.rsaService.decryptKey(encryptedKeyBase64);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const encryptedData = fs.readFileSync(encryptedFilePath);
    const decipher = crypto.createDecipheriv(this.algorithm, aesKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    console.log('🔓 Dataset decrypted from:', encryptedFilePath);

    return decrypted;
  }
}