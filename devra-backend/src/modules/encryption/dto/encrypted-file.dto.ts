import { ApiProperty } from '@nestjs/swagger';

export class EncryptedFileDto {
  @ApiProperty({ description: 'Path to the encrypted dataset file' })
  encryptedPath: string;

  @ApiProperty({ description: 'RSA-encrypted AES key (Base64 encoded)' })
  encryptedKey: string;

  @ApiProperty({ description: 'Initialization vector (IV) in hex' })
  iv: string;

  @ApiProperty({ description: 'Authentication tag (authTag) in hex' })
  authTag: string;
}
