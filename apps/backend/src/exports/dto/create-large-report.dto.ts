import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, MinDate } from 'class-validator';

export class CreateLargeReportDto {
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date('2025-01-01'))
  @IsNotEmpty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
