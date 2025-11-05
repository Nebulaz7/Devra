import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface VaultResponse {
  data: {
    data: {
      ENCRYPT_KEY?: string;
      value?: string; // fallback for different naming
    };
  };
}

const VAULT_ADDR = process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
const VAULT_TOKEN = process.env.VAULT_TOKEN;

if (!VAULT_TOKEN) {
  console.warn('⚠️ VAULT_TOKEN not set in environment variables.');
}

const headers = { 'X-Vault-Token': VAULT_TOKEN };

// 🧱 Store a key in Vault under secret/data/<keyName>
export async function storeKey(
  keyName: string,
  keyValue: string,
): Promise<string> {
  const url = `${VAULT_ADDR}/v1/secret/data/${keyName}`;
  const payload = { data: { ENCRYPT_KEY: keyValue } };

  try {
    await axios.post(url, payload, { headers });
    console.log(`✅ Stored key "${keyName}" in Vault`);
    return keyName;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(
        `⚠️ Path not found for "${keyName}" — Vault may need init or re-mount.`,
      );
    } else if (axios.isAxiosError(error) && error.response?.status === 400) {
      console.warn(`⚠️ Invalid data for key "${keyName}"`);
    } else {
      console.error(
        '❌ Vault store error:',
        axios.isAxiosError(error) ? error.response?.data : String(error),
      );
    }
    throw error;
  }
}

// 🧩 Retrieve a key; return null if missing
export async function getKey(keyName: string): Promise<string | null> {
  const url = `${VAULT_ADDR}/v1/secret/data/${keyName}`;
  try {
    const res = await axios.get<VaultResponse>(url, { headers });
    const key = res.data.data.data.ENCRYPT_KEY || res.data.data.data.value;
    console.log(`🔑 Retrieved key "${keyName}"`);
    return key || null;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(`⚠️ Key "${keyName}" not found in Vault`);
      return null;
    }
    console.error(
      '❌ Vault retrieval error:',
      axios.isAxiosError(error) ? error.response?.data : String(error),
    );
    throw error;
  }
}
