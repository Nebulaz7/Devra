import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface VaultResponse {
  data: {
    data: {
      ENCRYPT_KEY: string;
    };
  };
}

const VAULT_ADDR = process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
const VAULT_TOKEN = process.env.VAULT_TOKEN;

if (!VAULT_TOKEN) {
  console.warn('⚠️  VAULT_TOKEN not set in environment variables.');
}
const headers = { 'X-Vault-Token': VAULT_TOKEN };

export async function storeKey(
  keyName: string,
  keyValue: string,
): Promise<void> {
  try {
    const url = `${VAULT_ADDR}/v1/secret/data/${keyName}`;
    await axios.post(url, { data: { ENCRYPT_KEY: keyValue } }, { headers });
    console.log(`✅ Stored key "${keyName}" in Vault`);
  } catch {
    const url = `${VAULT_ADDR}/v1/secret/data/${keyName}`;
    await axios.get<VaultResponse>(url, { headers });
    console.log(`Key "${keyName}" already exists in Vault`);
  }
}

export async function getKey(keyName: string): Promise<string> {
  try {
    const url = `${VAULT_ADDR}/v1/secret/data/${keyName}`;
    const res = await axios.get<VaultResponse>(url, { headers });
    const key = res.data.data.data.ENCRYPT_KEY;
    console.log(`🔑 Retrieved key "${keyName}"`);
    return key;
  } catch (error) {
    const err = error as Error;
    console.error(`❌ Failed to retrieve key: ${err.message}`);
    throw error;
  }
}
