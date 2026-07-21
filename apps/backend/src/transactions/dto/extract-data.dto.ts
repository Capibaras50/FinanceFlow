import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ExtractDataDto {
  @IsBoolean()
  @IsNotEmpty()
  isReceipt: boolean;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  @IsNotEmpty()
  extractionConfidence: number;

  @IsString()
  @IsNotEmpty()
  walletName: string;

  @IsString()
  @IsNotEmpty()
  categoryName: string;
}
