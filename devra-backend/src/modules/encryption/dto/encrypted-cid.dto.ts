import { ApiProperty } from '@nestjs/swagger';

export class EncryptedCidDto {
  @ApiProperty({ description: 'Encrypted CID Hash' })
  cidHash: string;

  @ApiProperty({ description: 'RSA-encrypted AES key (Base64 encoded)' })
  encryptedKey: string;

  @ApiProperty({ description: 'AES key unique identity (Base64 encoded)' })
  keyId: string;

  @ApiProperty({ description: 'Vault key reference (Base64 encoded)' })
  vaultKeyRef: string;

  @ApiProperty({ description: 'Initialization vector (IV) in hex' })
  iv: string;

  @ApiProperty({ description: 'Authentication tag (authTag) in hex' })
  authTag: string;
}
