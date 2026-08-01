import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DirectionEnum } from '../enums/debt-user-type.enum';
import { DebtStatus } from '../enums/debt-status.enum';
import { DebtPriority } from '../enums/debt-priority.enum';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class FilterDebtDto extends PaginationDto {
  @IsEnum(DirectionEnum)
  @IsOptional()
  direction?: DirectionEnum;

  @IsEnum(DebtStatus)
  @IsOptional()
  status?: DebtStatus;

  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(100)
  @MinLength(3)
  @IsOptional()
  contactName?: string;

  @IsEnum(DebtPriority)
  @IsOptional()
  priority?: DebtPriority;

  @IsString()
  @IsIn(['amount', 'createdAt'])
  @IsOptional()
  sortBy?: 'amount' | 'createdAt';

  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
