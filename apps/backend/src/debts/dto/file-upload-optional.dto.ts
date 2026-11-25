import { ApiPropertyOptional } from '@nestjs/swagger';

export class FileUploadOptionalDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: any;
}
