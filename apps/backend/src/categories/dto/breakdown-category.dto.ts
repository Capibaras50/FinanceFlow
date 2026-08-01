import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { CategoryType } from '../enums/category-type.enum';

export class BreakdownCategoryDto {
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
