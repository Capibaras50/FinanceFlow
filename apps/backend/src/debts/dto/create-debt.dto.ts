import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { DebtPriority } from '../enums/debt-priority.enum';
import { DebtType } from '../enums/debt-type.enum';
import { DirectionEnum } from '../enums/debt-user-type.enum';

export class CreateDebtDto {
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(700)
  @MinLength(1)
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @IsNotEmpty()
  contactName: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsOptional()
  contactId?: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @IsEnum(DirectionEnum)
  @IsNotEmpty()
  direction: DirectionEnum;

  @IsEnum(DebtType)
  @IsNotEmpty()
  debtType: DebtType;

  @IsEnum(DebtPriority)
  @IsNotEmpty()
  priority: DebtPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;
}
