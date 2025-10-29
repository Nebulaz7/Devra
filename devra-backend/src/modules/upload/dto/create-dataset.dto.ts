import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDatasetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsNotEmpty()
  timestamp?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
