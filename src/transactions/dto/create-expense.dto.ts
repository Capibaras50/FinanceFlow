import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MaxLength(150)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  value: number;

  @IsNumber()
  @IsNotEmpty()
  walletId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  categoriesId: number[];

  @IsNumber()
  @IsOptional()
  receiptId?: number;
}
