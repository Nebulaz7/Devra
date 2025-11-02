import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { storeKey, getKey } from 'src/common/config/vaultConfig';

@Injectable()
export class RsaService {
  private readonly privateKeyPath = path.join(__dirname, './keys/private.pem');
  private readonly publicKeyPath = path.join(__dirname, './keys/public.pem');

  constructor() {
    const dir = path.dirname(this.privateKeyPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async onModuleInit(): Promise<void> {
    await this.ensureKeyPairExists();
  }

  private async ensureKeyPairExists() {
    const dir = path.dirname(this.privateKeyPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      const privateKeyFromVault = await getKey('private-key');
      if (privateKeyFromVault) {
        fs.writeFileSync(this.privateKeyPath, privateKeyFromVault);
        console.log('✅ Loaded private key from Vault');
        return;
      }
    } catch {
      console.log('ℹ️ No key in Vault, generating new one...');
    }

    // 🗝️ Generate and store new RSA keys
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });

    fs.writeFileSync(this.privateKeyPath, privateKey);
    fs.writeFileSync(this.publicKeyPath, publicKey);

    // 💾 Store private key securely in Vault
    await storeKey('private-key', privateKey);
    console.log('🔐 New private key stored in Vault');
  }

  // ⬇️ Encrypt AES key and store encrypted key in Vault
  async encryptKey(aesKey: Buffer, keyName: string): Promise<string> {
    const publicKey = fs.readFileSync(this.publicKeyPath, 'utf-8');
    const encryptedKey = crypto.publicEncrypt(publicKey, aesKey);
    const encryptedKeyBase64 = encryptedKey.toString('base64');

    // Store encrypted AES key in Vault under keyName
    await storeKey(keyName, encryptedKeyBase64);
    console.log(`✅ Stored encrypted AES key "${keyName}" in Vault`);

    return encryptedKeyBase64;
  }

  // ⬇️ Read encrypted AES key from Vault and decrypt it
  async decryptKey(keyName: string): Promise<Buffer> {
    // Get encrypted AES key from Vault
    const encryptedKeyBase64 = await getKey(keyName);
    if (!encryptedKeyBase64) {
      throw new Error(`❌ Encrypted key "${keyName}" not found in Vault`);
    }

    const privateKey = fs.readFileSync(this.privateKeyPath, 'utf-8');
    const encryptedKey = Buffer.from(encryptedKeyBase64, 'base64');
    const decryptedKey = crypto.privateDecrypt(privateKey, encryptedKey);
    return decryptedKey;
  }
}
