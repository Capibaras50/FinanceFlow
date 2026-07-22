import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CategoryType } from '../enums/category-type.enum';

export class FilterCategoryDto extends PaginationDto {
  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;
}
