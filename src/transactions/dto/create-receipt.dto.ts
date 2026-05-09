import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { ReceiptStatus } from '../enums/receipt.enums';

export class CreateReceiptDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsOptional()
  fileName: string;

  @IsNumber()
  @IsOptional()
  fileSizeBytes: number;

  @IsString()
  @IsOptional()
  mimeType: string;

  @IsEnum(ReceiptStatus)
  @IsNotEmpty()
  status: ReceiptStatus;

  @IsString()
  @IsOptional()
  jobId: string;

  @IsNumber()
  @IsOptional()
  attempts: number;

  @IsString()
  @IsOptional()
  lastError: string;

  @IsNumber()
  @Max(100)
  @Min(0)
  @IsNotEmpty()
  extractionConfidence: number;

  @IsDate()
  @IsOptional()
  processedAt: Date;
}
