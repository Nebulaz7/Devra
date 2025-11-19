import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrepareMintDto {
  @ApiProperty({
    description: 'Wallet address of the dataset owner',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Owner address is required' })
  @MinLength(42, { message: 'Owner address must be a valid Ethereum address' })
  owner: string;
}