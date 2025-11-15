import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMintDto {
  @IsNotEmpty()
  @IsString()
  cid?: string;

  @IsNotEmpty()
  @IsString()
  owner?: string;
}