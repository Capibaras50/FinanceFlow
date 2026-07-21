import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEarningDto {
  @IsString()
  @MaxLength(150)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  value: number;

  @IsNumber()
  @IsNotEmpty()
  walletId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsOptional()
  createdAt?: Date;
}
