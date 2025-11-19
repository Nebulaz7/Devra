import { ApiProperty } from '@nestjs/swagger';

export class EncryptedFileDto {
  @ApiProperty({ description: 'Path to the encrypted dataset file' })
  encryptedPath: string;

  @ApiProperty({ description: 'AES key unique identity (Base64 encoded)' })
  aesKey: string;

  @ApiProperty({ description: 'Initialization vector (IV) in hex' })
  iv: string;

  @ApiProperty({ description: 'Authentication tag (authTag) in hex' })
  authTag: string;
}
