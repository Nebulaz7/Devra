import { Injectable, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import { storeKey, getKey } from 'src/common/config/vaultConfig';

@Injectable()
export class RsaService implements OnModuleInit {
  private publicKey: string;
  private privateKey: string;

  async onModuleInit(): Promise<void> {
    await this.ensureKeyPairExists();
  }

  // 🗝️ Ensure RSA keypair exists in Vault, otherwise generate new ones
  private async ensureKeyPairExists(): Promise<void> {
    try {
      // Try to load keys from Vault
      const privateKeyFromVault = await getKey('rsa-private-key');
      const publicKeyFromVault = await getKey('rsa-public-key');

      if (privateKeyFromVault && publicKeyFromVault) {
        this.privateKey = privateKeyFromVault;
        this.publicKey = publicKeyFromVault;
        console.log('✅ Loaded RSA keypair from Vault');
        return;
      }

      console.log('ℹ️ RSA keys not found in Vault, generating new ones...');
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
      });

      // Store both keys in Vault
      await storeKey('rsa-private-key', privateKey);
      await storeKey('rsa-public-key', publicKey);

      this.privateKey = privateKey;
      this.publicKey = publicKey;

      console.log('🔐 Generated and stored new RSA keypair in Vault');
    } catch (error: unknown) {
      console.error(
        '❌ Failed to ensure RSA keypair exists:',
        (error as { response?: { data: unknown } })?.response?.data || error,
      );
      throw error;
    }
  }

  // 🔒 Encrypt AES key with public key
  async encryptKey(aesKey: Buffer, keyName: string): Promise<string> {
    if (!this.publicKey) {
      const publicKeyFromVault = await getKey('rsa-public-key');
      if (!publicKeyFromVault) throw new Error('Public key not found in Vault');
      this.publicKey = publicKeyFromVault;
    }

    const encrypted = crypto.publicEncrypt(this.publicKey, aesKey);
    const encryptedBase64 = encrypted.toString('base64');

    await storeKey(keyName, encryptedBase64);
    console.log(`✅ Encrypted AES key "${keyName}" stored in Vault`);
    return encryptedBase64;
  }

  // 🔓 Decrypt AES key with private key
  async decryptKey(keyName: string): Promise<Buffer> {
    const encryptedKeyBase64 = await getKey(keyName);
    if (!encryptedKeyBase64)
      throw new Error(`❌ Encrypted key "${keyName}" not found in Vault`);

    if (!this.privateKey) {
      const privateKeyFromVault = await getKey('rsa-private-key');
      if (!privateKeyFromVault)
        throw new Error('Private key not found in Vault');
      this.privateKey = privateKeyFromVault;
    }

    const encryptedBuffer = Buffer.from(encryptedKeyBase64, 'base64');
    const decrypted = crypto.privateDecrypt(this.privateKey, encryptedBuffer);

    console.log(`🔓 Decrypted AES key "${keyName}" successfully`);
    return decrypted;
  }
}
