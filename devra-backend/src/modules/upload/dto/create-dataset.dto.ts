import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateDatasetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid wallet address format' })
  owner: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsOptional()
  @IsString()
  category?: string;
}
