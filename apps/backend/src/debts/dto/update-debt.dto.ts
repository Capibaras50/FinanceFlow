import { PartialType } from '@nestjs/swagger';
import { CreateDebtDto } from './create-debt.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { DebtStatus } from '../enums/debt-status.enum';

export class UpdateDebtDto extends PartialType(CreateDebtDto) {
  @IsEnum(DebtStatus)
  @IsOptional()
  status?: DebtStatus;
}
