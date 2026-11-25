import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    description: 'The name of an user',
    example: 'Andres',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description:
      'The avatar or image profile of an user that save in cloudinary',
    example: 'http://example.com/example',
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
